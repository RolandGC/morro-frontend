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
import type { CompanyBillingResponse } from "../types/billing.types";

interface BillingStatusCardProps {
  data: CompanyBillingResponse;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BillingStatusCard({ data }: BillingStatusCardProps) {
  const billing = data.billing;
  const status = billing?.sync_status ?? "pending";
  const statusLabel =
    status === "synced"
      ? "Sincronizado"
      : status === "error"
        ? "Error"
        : "Pendiente";
  const statusClass =
    status === "synced"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
      : status === "error"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de facturación</CardTitle>
        <CardDescription>
          Información de la empresa y estado de sincronización.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{data.company.name || "Empresa"}</p>
            <p className="text-xs text-muted-foreground">
              RUC {data.company.ruc || "—"}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {data.company.logo_url ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.company.logo_url}
              alt="Logo de la empresa"
              className="h-12 w-auto max-w-24 object-contain"
            />
            <span className="text-xs text-muted-foreground">
              Logo tomado de la empresa.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            La empresa no tiene logo configurado. Se usa para la sincronización
            con APISPERU.
          </div>
        )}

        {billing?.sync_error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {billing.sync_error}
          </div>
        ) : null}

        <Separator />

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Habilitado</dt>
            <dd>{billing?.is_enabled ? "Sí" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ambiente</dt>
            <dd>{billing?.environment || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">ID APISPERU</dt>
            <dd className="break-all">{billing?.provider_company_id || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Última sync</dt>
            <dd>{formatDate(billing?.last_synced_at)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Certificado</dt>
            <dd className="flex items-center gap-1.5">
              {billing?.has_certificate ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <XCircle className="size-4 text-muted-foreground" />
              )}
              {billing?.has_certificate ? "Cargado" : "Sin cargar"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Clave SUNAT</dt>
            <dd className="flex items-center gap-1.5">
              {billing?.has_sol_pass ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <XCircle className="size-4 text-muted-foreground" />
              )}
              {billing?.has_sol_pass ? "Configurada" : "Sin configurar"}
            </dd>
          </div>
        </dl>

        {billing?.certificate_filename ? (
          <p className="text-xs text-muted-foreground">
            Certificado: {billing.certificate_filename}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
