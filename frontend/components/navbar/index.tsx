"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex w-[20%] flex-col gap-4 items-center justify-center">
      <h1 className="text-4xl font-bold">CEAP</h1>
      <Button
        onClick={() => router?.push("/")}
        variant={pathname === "/" ? "default" : "outline"}
        className="w-full"
      >
        Dashboard
      </Button>
      <Button
        variant={pathname === "/contatos" ? "default" : "outline"}
        onClick={() => router?.push("/contatos")}
        className="w-full"
      >
        Contatos
      </Button>
      <Button
        onClick={() => router?.push("/inbox")}
        variant={pathname === "/inbox" ? "default" : "outline"}
        className="w-full"
      >
        Caixa de entrada
      </Button>
    </div>
  );
};

export default Navbar;
