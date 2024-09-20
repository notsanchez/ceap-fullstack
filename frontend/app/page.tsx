import Navbar from "@/components/navbar";
import { ChartConfig } from "@/components/ui/chart";

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
    <div className="flex items-start justify-between h-screen p-12">
      <Navbar />
      <div className="flex w-[75%] flex-col gap-4 items-center justify-center">
        <div className="flex items-start justify-start w-full">
          <h1 className="text-3xl">Dashboard</h1>
        </div>
        <h1 >Nenhum dado disponível</h1>
        
      </div>
    </div>
  );
}
