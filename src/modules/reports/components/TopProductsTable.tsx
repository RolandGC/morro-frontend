import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopProductItem } from "../types/report.types";
import { formatMoney, formatNumber } from "../utils/format";

export default function TopProductsTable({
  data,
  loading,
}: {
  data: TopProductItem[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sin productos vendidos en el período.
                </TableCell>
              </TableRow>
            ) : (
              data.map((product, index) => (
                <TableRow key={product.product_id ?? `${product.name}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {product.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.model ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(product.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(product.amount)}
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
