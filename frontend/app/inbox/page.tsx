'use client'
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 10;

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchContacts(page);
    }, 1200);

    return () => clearInterval(intervalId); 
  }, [page]);

  const fetchContacts = async (page: number) => {
    try {
      const res = await axios.get(
        `http://localhost:8585/mensagens?page=${page}&limit=${limit}`
      );
      setMessages(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (err) {
      console.error("Erro ao buscar contatos:", err);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="flex items-start justify-between h-screen p-12">
      <Navbar />
      <div className="flex w-[75%] flex-col gap-4 items-center justify-center">
        <div className="flex items-start justify-start w-full gap-6">
          <h1 className="text-3xl">Contatos</h1>
        </div>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.map((el: any) => (
              <TableRow key={el.id}>
                <TableCell>{el.nome}</TableCell>
                <TableCell>{el.assunto}</TableCell>
                <TableCell>{el.mensagem}</TableCell>
                <TableCell>Aguardando aprovação</TableCell>
                <TableCell className="gap-4 flex">
                  <Button>Aprovar</Button>
                  <Button>Gerar novamente</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação */}
        <div className="flex items-center justify-between w-full mt-4">
          <Button onClick={handlePrevPage} disabled={page === 1}>
            Página Anterior
          </Button>
          <span>
            Página {page} de {totalPages} (Total de {totalItems} mensagens)
          </span>
          <Button onClick={handleNextPage} disabled={page === totalPages}>
            Próxima Página
          </Button>
        </div>
      </div>
    </div>
  );
}
