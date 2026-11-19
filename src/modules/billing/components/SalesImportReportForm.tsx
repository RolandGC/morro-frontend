"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showToast } from "@/hooks/useToast";
import { reportService } from "@/modules/reports/services/report.service";
import type { SalesImportReportPreview } from "@/modules/reports/types/report.types";
import { downloadBase64File } from "@/modules/reports/utils/download";
import { currentMonthRange, type DateRange } from "@/modules/reports/utils/date";

interface SalesImportReportFormProps {
  companyId: string;
}

export default function SalesImportReportForm({
  companyId,
}: SalesImportReportFormProps) {
  const [range, setRange] = useState<DateRange>(() => currentMonthRange());
  const [preview, setPreview] = useState<SalesImportReportPreview | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const updateRange = (key: "from" | "to", value: string) => {
    setRange((prev) => ({ ...prev, [key]: value }));
    setPreview(null);
  };

  const validateRange = () => {
    if (!range.from || !range.to) {
      showToast("Seleccione el rango de fechas", "warning");
      return false;
    }

    if (range.from > range.to) {
      showToast(
        "La fecha desde no puede ser mayor que la fecha hasta",
        "warning",
      );
      return false;
    }

    return true;
  };

  const handleSearch = async () => {
    if (!validateRange()) return;

    setSearching(true);

    try {
      const response = await reportService.previewSalesImport({
        company_id: companyId,
        date_from: range.from,
        date_to: range.to,
      });
      setPreview(response.data);
    } catch {
      setPreview(null);
      showToast("No se pudo consultar el reporte", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleExport = async () => {
    if (!preview || preview.count === 0) return;
    if (!validateRange()) return;

    setDownloading(true);

    try {
      const response = await reportService.exportSalesImport({
        company_id: companyId,
        date_from: range.from,
        date_to: range.to,
      });

      downloadBase64File(response.data);
      showToast("Reporte generado correctamente", "success");
    } catch {
      showToast("No se pudo generar el reporte", "error");
    } finally {
      setDownloading(false);
    }
  };

  const formatDisplayDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Reporte de importación de ventas</CardTitle>
        <CardDescription>
          Genera el Excel con los comprobantes aceptados por SUNAT en el rango
          seleccionado. No incluye notas de pedido ni comprobantes pendientes.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="sales-import-from"
            >
              Desde
            </label>
            <Input
              id="sales-import-from"
              type="date"
              value={range.from}
              onChange={(event) => updateRange("from", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="sales-import-to"
            >
              Hasta
            </label>
            <Input
              id="sales-import-to"
              type="date"
              value={range.to}
              onChange={(event) => updateRange("to", event.target.value)}
            />
          </div>
        </div>

        {preview ? (
          preview.count > 0 ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <p>
                Se encontraron <strong>{preview.count}</strong>{" "}
                {preview.count === 1 ? "resultado" : "resultados"} entre el{" "}
                <strong>{formatDisplayDate(preview.date_from)}</strong> y el{" "}
                <strong>{formatDisplayDate(preview.date_to)}</strong>.
              </p>
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
                Incluye {preview.boletas} boletas y {preview.facturas} facturas.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              No se encontraron comprobantes para el rango seleccionado.
            </div>
          )
        ) : (
          <p className="text-xs text-muted-foreground">
            Presiona “Buscar” para ver cuántos comprobantes se incluirán.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={searching || downloading}
          >
            <Search className="size-4" />
            {searching ? "Buscando..." : "Buscar"}
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={
              !preview ||
              preview.count === 0 ||
              searching ||
              downloading
            }
          >
            <Download className="size-4" />
            {downloading ? "Generando..." : "Descargar Excel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
