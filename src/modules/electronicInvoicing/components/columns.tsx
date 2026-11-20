"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import type { ElectronicDocument } from "../types/electronicInvoicing.types";
import {
  formatDocumentDate,
  formatDocumentMoney,
  formatDocumentNumber,
  getDocumentTypeLabel,
  getSaleStatusLabel,
  getSaleStatusStyle,
} from "../utils/electronicInvoicingFormat";
import { SunatStatusBadge } from "./SunatStatusBadge";

interface GetColumnsOptions {
  canSend: boolean;
  sendingId: string | null;
  onDetail: (id: string) => void;
  onSend: (document: ElectronicDocument) => void;
}

export function getElectronicInvoicingColumns({
  canSend,
  sendingId,
  onDetail,
  onSend,
}: GetColumnsOptions): ColumnDef<ElectronicDocument, unknown>[] {
  const selectColumn: ColumnDef<ElectronicDocument, unknown> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos los comprobantes enviables de la página"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        disabled={!row.original.sendable}
        aria-label="Seleccionar comprobante"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  return [
    ...(canSend ? [selectColumn] : []),
    {
      id: "document",
      header: "Comprobante",
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="min-w-[170px]">
            <button
              type="button"
              className="text-left text-sm font-semibold text-foreground hover:text-primary hover:underline"
              onClick={() => onDetail(document.id)}
            >
              {formatDocumentNumber(document.series, document.number)}
            </button>
            <p className="text-xs text-muted-foreground">
              {getDocumentTypeLabel(document.document_type)}
            </p>
          </div>
        );
      },
    },
    {
      id: "kind",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="text-sm capitalize">
          {row.original.kind} · {row.original.regime}
        </div>
      ),
    },
    {
      accessorKey: "series",
      header: "Serie",
    },
    {
      accessorKey: "number",
      header: "Número",
    },
    {
      id: "sale_date",
      header: "Fecha de emisión",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {formatDocumentDate(row.original.sale.sale_date)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="text-sm">{row.original.customer?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.customer?.doc_type
              ? `${row.original.customer.doc_type.toUpperCase()} ${row.original.customer.doc_number ?? ""}`.trim()
              : "—"}
          </p>
        </div>
      ),
    },
    {
      id: "document_number",
      header: "Documento del cliente",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customer?.doc_number ?? "—"}</span>
      ),
    },
    {
      id: "currency",
      header: "Moneda",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.sale.currency?.code ?? "—"}
        </span>
      ),
    },
    {
      id: "total",
      header: "Importe total",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm font-medium">
          {formatDocumentMoney(
            row.original.totals.total,
            row.original.sale.currency?.code
          )}
        </span>
      ),
    },
    {
      id: "local_status",
      header: "Estado local",
      cell: ({ row }) => {
        const status = row.original.sale.status;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getSaleStatusStyle(status)}`}
          >
            {getSaleStatusLabel(status)}
          </span>
        );
      },
    },
    {
      id: "sunat_status",
      header: "Estado SUNAT",
      cell: ({ row }) => <SunatStatusBadge status={row.original.status} />,
    },
    {
      id: "sent_at",
      header: "Fecha de envío",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {formatDocumentDate(row.original.voucher?.sent_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original;
        const isSending = sendingId === document.id;

        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDetail(document.id)}
              title="Ver detalle"
            >
              <Eye className="size-4" />
            </Button>

            {canSend ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!document.sendable || isSending || sendingId !== null}
                onClick={() => onSend(document)}
                title={
                  document.sendable
                    ? "Enviar a SUNAT"
                    : "La venta asociada está anulada"
                }
              >
                <Send className="size-4" />
                <span className="sr-only">Enviar a SUNAT</span>
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];
}
