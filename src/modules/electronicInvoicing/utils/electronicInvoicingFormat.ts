import { formatCurrency, formatNumber } from "@/lib/format";

import type { ElectronicDocumentStatus } from "../types/electronicInvoicing.types";

export const ELECTRONIC_STATUS_LABELS: Record<
  ElectronicDocumentStatus,
  string
> = {
  not_sent: "Sin enviar",
  pending: "En proceso",
  accepted: "Aceptado",
  rejected: "Rechazado",
  contingency: "Contingencia",
};

export const ELECTRONIC_STATUS_STYLES: Record<
  ElectronicDocumentStatus,
  string
> = {
  not_sent: "bg-slate-100 text-slate-700 ring-slate-500/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  contingency: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const SALE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  delivered: "Entregada",
  cancelled: "Anulada",
};

const SALE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  delivered: "bg-sky-50 text-sky-700 ring-sky-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  boleta_general: "Boleta general",
  boleta_zofra: "Boleta zofra",
  factura_general: "Factura general",
  factura_zofra: "Factura zofra",
};

export function getElectronicStatus(
  status: string | null | undefined
): ElectronicDocumentStatus {
  if (
    status === "not_sent" ||
    status === "pending" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "contingency"
  ) {
    return status;
  }

  return "not_sent";
}

export function getDocumentTypeLabel(documentType: string): string {
  return DOCUMENT_TYPE_LABELS[documentType] ?? documentType;
}

export function getSaleStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return SALE_STATUS_LABELS[status] ?? status;
}

export function getSaleStatusStyle(status: string | null | undefined): string {
  if (!status) return "bg-muted text-muted-foreground ring-border";
  return SALE_STATUS_STYLES[status] ?? "bg-muted text-muted-foreground ring-border";
}

export function formatDocumentNumber(
  series: string | null | undefined,
  number: number | null | undefined
): string {
  if (!series && number === null) return "—";
  return `${series ?? "—"}-${number ?? "—"}`;
}

export function formatDocumentDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDocumentDateTime(
  value: string | null | undefined
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDocumentMoney(
  value: number | null | undefined,
  currencyCode?: string | null
): string {
  return formatCurrency(value, currencyCode || "PEN");
}

export function formatDocumentQuantity(value: number | null | undefined): string {
  return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
