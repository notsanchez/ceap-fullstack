"use client";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMessage, setSelectedMessage]: any = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const limit = 15;

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchContacts(page);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [page]);

  const fetchContacts = async (page: number) => {
    try {
      const res = await axios.get(
        `https://ceap-fullstack.onrender.com/mensagens?page=${page}&limit=${limit}`
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

  const handleRowClick = (message: any) => {
    setSelectedMessage(message);
  };

  const handleRegen = async (id: string) => {
    setIsLoading(true);
    await axios.post(`https://ceap-fullstack.onrender.com/regen-message?id=${id}`);
    await axios.get(`https://ceap-fullstack.onrender.com/message?id=${id}`).then((res) => {
      setSelectedMessage((prevState: any) => ({
        ...prevState,
        mensagem: res.data.mensagem,
        assunto: res.data.assunto,
      }));
      setIsLoading(false);
    });
  };

  return (
    <div className="flex items-start justify-between h-screen">
      <Navbar />
      <div className="flex w-[85%] flex-col gap-4 items-center justify-center p-12">
        <div className="flex items-start justify-start w-full gap-6">
          <h1 className="text-3xl">Mensagens</h1>
        </div>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.map((el: any) => (
              <Dialog key={el.id}>
                <DialogTrigger asChild>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => handleRowClick(el)}
                  >
                    <TableCell>{el.nome}</TableCell>
                    <TableCell>{el.assunto}</TableCell>
                    <TableCell>{el.mensagem.substring(0, 40)}...</TableCell>
                    <TableCell>Aguardando aprovação</TableCell>
                  </TableRow>
                </DialogTrigger>
                {selectedMessage && selectedMessage.id === el.id && (
                  <DialogContent className="w-full flex flex-col gap-4">
                    {/* <DialogHeader>
                      <DialogTitle>Mensagem gerada</DialogTitle>
                    </DialogHeader> */}
                    {isLoading ? (
                      <div className="w-full flex flex-col items-center justify-center p-12">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando novamente...
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 py-4 h-full">
                          <div className="items-center gap-4">
                            <Label className="text-lg">Contato</Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {selectedMessage.nome}
                            </p>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {selectedMessage.email}
                            </p>
                          </div>
                          <div className="items-center gap-4">
                            <Label className="text-lg">Assunto do email</Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {selectedMessage.assunto}
                            </p>
                          </div>
                          <div className="w-full h-[1px] bg-zinc-400"></div>
                          <div className="items-center gap-4 h-full">
                            <Label className="text-lg">Mensagem gerada</Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {selectedMessage.mensagem}
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button disabled type="button">
                            Confirmar
                          </Button>
                          <Button
                            onClick={() => {
                              handleRegen(selectedMessage.id);
                            }}
                            type="button"
                          >
                            Gerar novamente
                          </Button>
                          <Button type="button" variant={"outline"}>
                            Excluir
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                )}
              </Dialog>
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
