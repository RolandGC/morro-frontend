"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SalesImportReportInfo() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>¿Qué incluye el reporte?</CardTitle>
        <CardDescription>
          Datos que se exportan al archivo Excel.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        <ul className="flex flex-col gap-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>Boletas y facturas aceptadas por SUNAT.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>Filtrado por fecha de venta y empresa seleccionada.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>Formato Excel (.xlsx), listo para importación contable.</span>
          </li>
        </ul>

        <Separator />

        <div>
          <p className="mb-2 font-medium">No incluye</p>
          <ul className="flex flex-col gap-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>Notas de pedido.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>Comprobantes pendientes, rechazados o en contingencia.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>Glosa, tipo de cambio, plantilla contable y bases adicionales.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
          El archivo se descarga automáticamente después de generarlo.
        </div>
      </CardContent>
    </Card>
  );
}
