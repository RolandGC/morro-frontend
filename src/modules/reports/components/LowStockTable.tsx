import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LowStockItem } from "../types/report.types";
import { formatNumber } from "../utils/format";

function StockBadge({ quantity }: { quantity: number }) {
  const isOut = quantity <= 0;
  return (
    <span
      className={
        isOut
          ? "inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
          : "inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600"
      }
    >
      {isOut ? "Sin stock" : "Bajo"}
    </span>
  );
}

export default function LowStockTable({
  data,
  loading,
}: {
  data: LowStockItem[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos con stock bajo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No hay productos con stock bajo.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={`${item.product_id ?? item.product_name}-${index}`}
                >
                  <TableCell className="font-medium">
                    {item.product_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.model ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.warehouse_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.min_stock != null
                      ? formatNumber(item.min_stock)
                      : item.reorder_point != null
                        ? formatNumber(item.reorder_point)
                        : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <StockBadge quantity={item.quantity} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
