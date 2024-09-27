"use client";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState(false);

  const handleChangeContactAutomatic = async () => {
    const response = await axios.post('https://ceap-fullstack.onrender.com/active-automatic-contacts');
    setActive(response.data.newActiveValue);
  };

  useEffect(() => {
    axios.get('https://ceap-fullstack.onrender.com/automatic-contacts').then((res) => {
      setActive(res.data.active);
    });
  }, []);

  return (
    <div className="flex w-[14%] flex-col gap-4 items-center justify-start border-r-2 h-screen py-8 px-2">
      <Button
        variant={pathname === "/" ? "default" : "outline"}
        onClick={() => router?.push("/")}
        className="w-full"
      >
        Home
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
        Mensagens
      </Button>
      <div className="flex items-center space-x-2">
        <Switch
          id="airplane-mode"
          checked={active}
          onCheckedChange={async (checked) => {
            await handleChangeContactAutomatic();
          }}
        />
        <Label htmlFor="airplane-mode">Contatos automáticos</Label>
      </div>
    </div>
  );
};

export default Navbar;
