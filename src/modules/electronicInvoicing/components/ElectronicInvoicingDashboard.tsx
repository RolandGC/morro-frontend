"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  RotateCw,
  Send,
  XCircle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/modules/reports/components/KpiCard";

import type { ElectronicInvoicingSummary } from "../types/electronicInvoicing.types";
import { ELECTRONIC_STATUS_LABELS } from "../utils/electronicInvoicingFormat";

const STATUS_COLORS: Record<string, string> = {
  not_sent: "var(--chart-1)",
  pending: "var(--chart-2)",
  accepted: "var(--chart-3)",
  rejected: "var(--chart-4)",
  contingency: "var(--chart-5)",
};

interface ElectronicInvoicingDashboardProps {
  summary: ElectronicInvoicingSummary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function ElectronicInvoicingDashboard({
  summary,
  loading,
  error,
  onRetry,
}: ElectronicInvoicingDashboardProps) {
  const cards = [
    { key: "total", title: "Total de comprobantes", icon: FileText },
    { key: "not_sent", title: "Sin enviar", icon: Send },
    { key: "pending", title: "En proceso de envío", icon: Clock3 },
    { key: "accepted", title: "Aceptados por SUNAT", icon: CheckCircle2 },
    { key: "rejected", title: "Rechazados por SUNAT", icon: XCircle },
    { key: "contingency", title: "Contingencia", icon: AlertTriangle },
  ] as const;

  const chartData = summary
    ? cards
        .filter((card) => card.key !== "total")
        .map((card) => ({
          key: card.key,
          name: ELECTRONIC_STATUS_LABELS[card.key],
          value: summary[card.key],
        }))
    : [];

  return (
    <div className="space-y-4">
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <KpiCard
            key={card.key}
            title={card.title}
            value={
              loading || !summary
                ? "…"
                : summary[card.key].toLocaleString("es-PE")
            }
            icon={card.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Distribución por estado SUNAT</CardTitle>
          {error ? (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RotateCw className="mr-1.5 size-3.5" />
              Reintentar
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Cargando resumen...
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          ) : chartData.every((item) => item.value === 0) ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No hay comprobantes registrados para el resumen.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis
                  fontSize={12}
                  allowDecimals={false}
                  tickFormatter={(value: number) =>
                    Number(value).toLocaleString("es-PE")
                  }
                />
                <Tooltip
                  formatter={(value: unknown) => [
                    Number(value).toLocaleString("es-PE"),
                    "Comprobantes",
                  ]}
                />
                <Bar dataKey="value" name="Comprobantes" radius={[4, 4, 0, 0]}>
                  {chartData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={STATUS_COLORS[item.key] ?? "var(--chart-1)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
