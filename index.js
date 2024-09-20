const express = require("express");
const cron = require("node-cron");
const { faker } = require('@faker-js/faker/locale/pt_BR');
const { Client } = require("pg");
const { default: axios } = require("axios");
const cors = require("cors");

const client = new Client({
  user: "postgres",
  host: "autorack.proxy.rlwy.net",
  database: "railway",
  password: "KMdxmBtBSGXPBPxvTwevQOzCTyTqDyQh",
  port: 40507,
});

client.connect();

const segmentosEmpresas = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'Varejo',
    'Financeiro',
    'Indústria',
];

const IAURL = "http://localhost:11434/api/generate"

async function addFakeContact() {
  const name = faker.person.firstName();
  const company = faker.company.name();
  const jobPosition = faker.person.jobTitle();
  const email = faker.internet.email();
  const empresaSegmento = segmentosEmpresas[Math.floor(Math.random() * segmentosEmpresas.length)];

  const query = `INSERT INTO contatos (nome, empresa, empresa_segmento, cargo, email) VALUES ($1, $2, $3, $4, $5)`;
  const values = [name, company, empresaSegmento, jobPosition, email];

  try {
    await client.query(query, values);
    console.log(`Contato ${name} adicionado com sucesso!`);
  } catch (err) {
    console.error("Erro ao adicionar contato:", err);
  }
}

async function checkForNewContactsAndAddMessage() {
    try {
      const result = await client.query(`
        SELECT c.id, c.nome, c.empresa, c.empresa_segmento, c.cargo
        FROM contatos c
        LEFT JOIN mensagens m ON c.id = m.id_contato
        WHERE m.id_contato IS NULL
      `);
  
      for (let row of result.rows) {
        const { id, nome, empresa, empresa_segmento, cargo } = row;

        // let messageResponse;

        // await axios.post(IAURL, 
        //     {
        //         "model": "llama3",
        //         "prompt": `
        //             gere um script para primeiro contato de prospecção, o nome do cliente é ${nome}, o cargo do 
        //             cliente em questão é ${cargo} e a empresa que trabalha é do seguimento ${empresa_segmento}, o nome da empresa é 
        //             ${empresa} O projeto que busca esta prospecção é uma ONG que auxilia jovens da periferia de São Paulo em suas carreiras profissionais, 
        //             com cursos de redes de computadores, informatica, e adminsitração, sua missão é trazer jovens preparados para o mercado de trabalho, 
        //             mas para isso toda essa infraestrutura tem um custo e eles precisam de doadores para continuar com essa missão. o nome do projeto é CEAP. 
        //             Gere apenas a mensagem do email, sem espaçamentos desnecessarios e sem o assunto`,
        //         "stream": false
        //     }
        // ).then((res) => {
        //     messageResponse = res.data.response
        // })

        const assunto = `Bem-vindo(a), ${nome}`;
        const mensagem = `Olá ${nome}, agradecemos pelo seu interesse!`;
  
        await client.query(
          `INSERT INTO mensagens (id_contato, assunto, mensagem) VALUES ($1, $2, $3)`,
          [id, assunto, mensagem]
        );
  
        console.log(`Mensagem adicionada para o contato: ${nome}`);
      }
    } catch (err) {
      console.error('Erro ao verificar contatos e adicionar mensagens:', err);
    }
  }

// cron.schedule("*/25 * * * * *", () => {
//   addFakeContact();
// });

cron.schedule('*/15 * * * * *', () => {
    checkForNewContactsAndAddMessage();
});  

const app = express();

app.use(cors());

app.get("/contatos", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const result = await client.query(
      "SELECT * FROM contatos ORDER BY id LIMIT $1 OFFSET $2",
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
      "SELECT m.assunto, m.mensagem, c.nome FROM mensagens m INNER JOIN contatos c ON c.id = m.id_contato ORDER BY m.id LIMIT $1 OFFSET $2",
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


const PORT = process.env.PORT || 8585;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
