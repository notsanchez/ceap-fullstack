"use client";

import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "#d3d3d3" }, // Light Gray
  { browser: "safari", visitors: 200, fill: "#a9a9a9" }, // Dark Gray
  
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Primeiro contato",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Em Negociação",
    color: "hsl(var(--chart-2))",
  },
  
} satisfies ChartConfig;

export function ChartMessagesComp() {
  

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Mensagens Respondidas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 font-medium leading-none">
            Respondidas
          </div>
          <div className="flex items-center gap-2 font-medium leading-none">
            Não respondidas
          </div>
        </div>

        
        <div className="leading-none text-muted-foreground">
          +21% Respondidas esse mês
        </div>
      </CardFooter>
    </Card>
  );
}
