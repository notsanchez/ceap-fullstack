import { ChartComp } from "@/components/chart";
import { ChartMessagesComp } from "@/components/chartMessages";
import Navbar from "@/components/navbar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex items-start justify-between h-screen">
      <Navbar />
      <div className="flex w-[85%] flex-col gap-4 items-center justify-center p-12">
        <div className="flex items-start justify-start w-full">
          <h1 className="text-3xl">Visão geral</h1>
        </div>
        <div className="flex w-full gap-12">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Investimento</CardTitle>
              <CardDescription className="text-2xl font-bold">
                R$ 110.298,99
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Investidores</CardTitle>
              <CardDescription className="text-2xl font-bold">
                567
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>E-mails enviados por mês</CardTitle>
              <CardDescription className="text-2xl font-bold">
                890
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="flex gap-12 w-full">
          <ChartComp />
          <ChartMessagesComp />
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Cargos mais convertidos</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Parcerias fechadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">CEO</TableCell>
                <TableCell className="text-right">102</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Head Of Sales</TableCell>
                <TableCell className="text-right">91</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Country Head</TableCell>
                <TableCell className="text-right">48</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Diretor</TableCell>
                <TableCell className="text-right">33</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
