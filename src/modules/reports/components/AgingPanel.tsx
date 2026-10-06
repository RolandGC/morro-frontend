import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReceivablesAgingReport } from "../types/report.types";
import { formatMoney } from "../utils/format";

export default function AgingPanel({
  data,
  loading,
}: {
  data: ReceivablesAgingReport | null;
  loading?: boolean;
}) {
  const buckets = data
    ? [
        { label: "Por vencer", value: data.buckets.current },
        { label: "1 a 30 días", value: data.buckets.d1_30 },
        { label: "31 a 60 días", value: data.buckets.d31_60 },
        { label: "61 a 90 días", value: data.buckets.d61_90 },
        { label: "Más de 90 días", value: data.buckets.d90_plus },
      ]
    : [];

  const maxBucket = buckets.reduce(
    (max, bucket) => Math.max(max, bucket.value),
    0,
  );

  if (loading && !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Cargando...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total por cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatMoney(data?.total_pending)}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Vencido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-destructive">
              {formatMoney(data?.overdue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Antigüedad de saldos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{bucket.label}</span>
                <span className="font-medium">{formatMoney(bucket.value)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-[var(--chart-1)]"
                  style={{
                    width: `${
                      maxBucket > 0 ? (bucket.value / maxBucket) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data || data.by_customer.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No hay cuentas por cobrar pendientes.
                  </TableCell>
                </TableRow>
              ) : (
                data.by_customer.map((customer, index) => (
                  <TableRow
                    key={`${customer.customer_id ?? "sin-cliente"}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {customer.customer_name ?? "Sin cliente"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMoney(customer.pending)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
