"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SalesByPaymentMethodItem } from "../types/report.types";
import { formatMoney } from "../utils/format";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#94a3b8",
];

export default function PaymentMethodChart({
  data,
  loading,
}: {
  data: SalesByPaymentMethodItem[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por método de pago</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin pagos en el período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.method}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => formatMoney(Number(value))}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
