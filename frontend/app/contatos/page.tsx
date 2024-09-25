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

export default function Contatos() {
  const [contatos, setContatos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 10;

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  const fetchContacts = async (page: number) => {
    try {
      const res = await axios.get(
        `http://localhost:8585/contatos?page=${page}&limit=${limit}`
      );
      setContatos(res.data.data);
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
    <div className="flex items-start justify-between h-screen ">
      <Navbar />
      <div className="flex w-[85%] flex-col gap-4 items-center justify-center p-12">
        <div className="flex items-start justify-start w-full gap-6">
          <h1 className="text-3xl">Contatos</h1>
          {/* <Button>Adicionar +</Button> */}
        </div>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Segmento da empresa</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Primeiro contato</TableHead>
              <TableHead>Último contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contatos?.map((el: any) => (
              <TableRow key={el.id}>
                <TableCell>{el.nome}</TableCell>
                <TableCell>{el.empresa}</TableCell>
                <TableCell>{el.empresa_segmento}</TableCell>
                <TableCell>{el.cargo}</TableCell>
                <TableCell>{el.primeiro_contato ? el.primeiro_contato : '-'}</TableCell>
                <TableCell>{el.ultimo_contato ? el.ultimo_contato : '-'}</TableCell>
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
            Página {page} de {totalPages} (Total de {totalItems} contatos)
          </span>
          <Button onClick={handleNextPage} disabled={page === totalPages}>
            Próxima Página
          </Button>
        </div>
      </div>
    </div>
  );
}
