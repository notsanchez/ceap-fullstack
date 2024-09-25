const express = require("express");
const cron = require("node-cron");
const { faker } = require("@faker-js/faker/locale/pt_BR");
const { Client } = require("pg");
const { default: axios } = require("axios");
const cors = require("cors");

require('dotenv').config();

const client = new Client({
  user: "postgres",
  host: "autorack.proxy.rlwy.net",
  database: "railway",
  password: "KMdxmBtBSGXPBPxvTwevQOzCTyTqDyQh",
  port: 40507,
});

client.connect();

const segmentosEmpresas = [
  "Tecnologia",
  "Saúde",
  "Educação",
  "Varejo",
  "Financeiro",
  "Indústria",
];

const IAURL = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.API_KEY;

async function checkForNewContactsAndAddMessage() {
  try {
    const activeResult = await client.query(
      `SELECT active FROM contatos_automatico ORDER BY id DESC LIMIT 1`
    );

    if (activeResult.rows[0].active === false) {
      return;
    }

    const name = faker.person.firstName();
    const company = faker.company.name();
    const jobPosition = faker.person.jobTitle();
    const email = faker.internet.email();
    const empresaSegmento =
      segmentosEmpresas[Math.floor(Math.random() * segmentosEmpresas.length)];

    const query = `INSERT INTO contatos (nome, empresa, empresa_segmento, cargo, email) 
                    VALUES ($1, $2, $3, $4, $5) 
                    RETURNING id`;
    const values = [name, company, empresaSegmento, jobPosition, email];

    try {
      const result = await client.query(query, values);
      addedContact = result.rows[0];
      console.log(`Contato ${name} adicionado com sucesso!`);
    } catch (err) {
      console.error("Erro ao adicionar contato:", err);
    }

    const { id } = addedContact;

    let subjectResponse;
    let messageResponse;

    await axios
      .post(
        IAURL,
        {
          messages: [
            {
              role: "system",
              content: `
                    gere um script para primeiro contato de prospecção, você deve se apresentar como a organização "CEAP" em terceira pessoa no masculino por exemplo "O CEAP", o nome do cliente é "${name}", o cargo do 
                    cliente em questão é "${jobPosition}" e a empresa que trabalha é do seguimento "${empresaSegmento}", o nome da empresa é 
                    "${company}" O projeto que busca esta prospecção é uma ONG que auxilia jovens da periferia de São Paulo em suas carreiras profissionais, 
                    com cursos de redes de computadores, informatica, e adminsitração, sua missão é trazer jovens preparados para o mercado de trabalho, 
                    mas para isso toda essa infraestrutura tem um custo e eles precisam de doadores para continuar com essa missão. o nome do projeto é CEAP. 
                    Gere apenas a mensagem do email, sem espaçamentos desnecessarios e sem o assunto, não deve incluir no email "[Seu Nome]"`,
            },
          ],
          model: "gpt-4o-mini",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      )
      .then((res) => {
        messageResponse = res.data.choices[0].message.content;
      });

    await axios
      .post(
        IAURL,
        {
          messages: [
            {
              role: "system",
              content: `
                    gere um titulo simples de no maximo 1 linha para o seguinte email: "${messageResponse}". 
                    Gere apenas a mensagem do assunto/titulo, sem espaçamentos desnecessarios`,
            },
          ],
          model: "gpt-4o-mini",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data.choices[0].message.content);
        subjectResponse = res.data.choices[0].message.content;
      });

    const assunto = subjectResponse;
    const mensagem = messageResponse;

    await client.query(
      `INSERT INTO mensagens (id_contato, assunto, mensagem) VALUES ($1, $2, $3)`,
      [id, assunto, mensagem]
    );

    console.log(`Mensagem adicionada para o contato: ${name}`);
  } catch (err) {
    console.error("Erro ao verificar contatos e adicionar mensagens:", err);
  }
}

cron.schedule("*/8 * * * * *", () => {
  checkForNewContactsAndAddMessage();
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/contatos", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const result = await client.query(
      "SELECT * FROM contatos ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const totalContacts = await client.query("SELECT COUNT(*) FROM contatos");
    const totalPages = Math.ceil(totalContacts.rows[0].count / limit);

    res.json({
      data: result.rows,
      page: parseInt(page),
      totalPages: totalPages,
      totalItems: parseInt(totalContacts.rows[0].count),
    });
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ error: "Erro ao buscar contatos" });
  }
});

app.get("/mensagens", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const result = await client.query(
      "SELECT m.id, m.assunto, m.mensagem, c.nome, c.email FROM mensagens m INNER JOIN contatos c ON c.id = m.id_contato ORDER BY m.id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const totalMessages = await client.query("SELECT COUNT(*) FROM mensagens");
    const totalPages = Math.ceil(totalMessages.rows[0].count / limit);

    res.json({
      data: result.rows,
      page: parseInt(page),
      totalPages: totalPages,
      totalItems: parseInt(totalMessages.rows[0].count),
    });
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

app.post("/active-automatic-contacts", async (req, res) => {
  try {
    const lastResult = await client.query(
      "SELECT active FROM contatos_automatico ORDER BY id DESC LIMIT 1"
    );

    let newActiveValue;

    if (lastResult.rows.length > 0) {
      const lastActive = lastResult.rows[0].active;

      newActiveValue = lastActive ? false : true;
    } else {
      newActiveValue = true;
    }

    await client.query("INSERT INTO contatos_automatico (active) values ($1)", [
      newActiveValue,
    ]);

    res.json({ success: true, newActiveValue });
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

app.get("/automatic-contacts", async (req, res) => {
  try {
    const lastResult = await client.query(
      "SELECT active FROM contatos_automatico ORDER BY id DESC LIMIT 1"
    );

    const lastActive = lastResult.rows[0].active;

    res.json({ success: true, active: lastActive });
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

app.post("/regen-message", async (req, res) => {
  try {
    if (!req.query.id) {
      return res
        .status(400)
        .json({ error: "Corpo da requisição não enviado." });
    }

    const { id } = req.query;

    const lastResult = await client.query(
      "SELECT * FROM mensagens WHERE id = $1",
      [id]
    );

    if (lastResult.rows.length === 0) {
      return res.status(404).json({ error: "Mensagem não encontrada." });
    }

    const { id_contato } = lastResult.rows[0];

    const contactResult = await client.query(
      "SELECT * FROM contatos WHERE id = $1",
      [id_contato]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: "Contato não encontrado." });
    }

    const { nome, empresa, cargo, empresa_segmento } = contactResult.rows[0];

    let subjectResponse;
    let messageResponse;

    await axios
      .post(
        IAURL,
        {
          messages: [
            {
              role: "system",
              content: `gere um script para primeiro contato de prospecção, você deve se apresentar como a organização "CEAP" em terceira pessoa no masculino por exemplo "O CEAP", o nome do cliente é "${nome}", o cargo do 
                        cliente em questão é "${cargo}" e a empresa que trabalha é do seguimento "${empresa_segmento}", o nome da empresa é 
                        "${empresa}". O projeto que busca esta prospecção é uma ONG que auxilia jovens da periferia de São Paulo em suas carreiras profissionais, 
                        com cursos de redes de computadores, informatica, e administração, sua missão é trazer jovens preparados para o mercado de trabalho, 
                        mas para isso toda essa infraestrutura tem um custo e eles precisam de doadores para continuar com essa missão. o nome do projeto é CEAP. 
                        Gere apenas a mensagem do email, sem espaçamentos desnecessarios e sem o assunto, não deve incluir no email "[Seu Nome]".`,
            },
          ],
          model: "gpt-4o-mini",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      )
      .then((res) => {
        messageResponse = res.data.choices[0].message.content;
      });

    await axios
      .post(
        IAURL,
        {
          messages: [
            {
              role: "system",
              content: `gere um titulo simples de no maximo 1 linha para o seguinte email: "${messageResponse}". 
                        Gere apenas a mensagem do assunto/titulo, sem espaçamentos desnecessarios.`,
            },
          ],
          model: "gpt-4o-mini",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      )
      .then((res) => {
        subjectResponse = res.data.choices[0].message.content;
      });

    await client.query(
      `UPDATE mensagens SET assunto = $1, mensagem = $2 WHERE id = $3`,
      [subjectResponse, messageResponse, id]
    );

    res.json({ success: true, message: "Mensagem atualizada com sucesso." });
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

app.get("/message", async (req, res) => {
  try {
    const { id } = req.query;

    const lastResult = await client.query(
      "SELECT * FROM mensagens WHERE id = $1",
      [id]
    );

    if (lastResult.rows.length === 0) {
      return res.status(404).json({ error: "Mensagem não encontrada." });
    }

    res.json({
      success: true,
      assunto: lastResult.rows[0].assunto,
      mensagem: lastResult.rows[0].mensagem,
    });
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

const PORT = process.env.PORT || 8585;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
