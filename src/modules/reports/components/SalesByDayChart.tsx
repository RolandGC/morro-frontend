"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesByDayItem } from "../types/report.types";
import { formatDateLabel, formatMoney } from "../utils/format";

export default function SalesByDayChart({
  data,
  loading,
}: {
  data: SalesByDayItem[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por día</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin ventas en el período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickFormatter={(value: string) => formatDateLabel(value)}
              />
              <YAxis
                fontSize={12}
                width={90}
                tickFormatter={(value: number) => formatMoney(value)}
              />
              <Tooltip
                formatter={(value: unknown) => formatMoney(Number(value))}
                labelFormatter={(label: unknown) =>
                  formatDateLabel(String(label))
                }
              />
              <Legend />
              <Bar
                dataKey="cash"
                name="Contado"
                stackId="total"
                fill="var(--chart-1)"
              />
              <Bar
                dataKey="credit"
                name="Crédito"
                stackId="total"
                fill="var(--chart-2)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
