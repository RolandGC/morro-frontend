"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { SendBatchResponse } from "../types/electronicInvoicing.types";
import { formatDocumentNumber } from "../utils/electronicInvoicingFormat";
import { SunatStatusBadge } from "./SunatStatusBadge";

function ResultStatusBadge({ status }: { status: string }) {
  if (status === "error") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
        Error
      </span>
    );
  }

  if (
    status === "not_sent" ||
    status === "pending" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "contingency"
  ) {
    return <SunatStatusBadge status={status} />;
  }

  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
      {status}
    </span>
  );
}

function ResultItem({ label, value, icon }: { label: string; value: number; icon: ReactNode | null }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-xl font-semibold">{value}</p>
    </div>
  );
}

export default function ElectronicInvoicingBatchResultModal({
  response,
  onClose,
}: {
  response: SendBatchResponse | null;
  onClose: () => void;
}) {
  const pending = response
    ? response.results.filter((result) => result.status === "pending").length
    : 0;

  return (
    <Dialog open={response !== null} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">
            Resultado del envío masivo
          </DialogTitle>
        </DialogHeader>

        {response ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <ResultItem label="Total procesados" value={response.total} icon={null} />
              <ResultItem
                label="Aceptados"
                value={response.summary.accepted}
                icon={<CheckCircle2 className="size-3.5" />}
              />
              <ResultItem
                label="Rechazados"
                value={response.summary.rejected}
                icon={<XCircle className="size-3.5" />}
              />
              <ResultItem
                label="Errores de envío"
                value={response.summary.error}
                icon={null}
              />
              <ResultItem
                label="En proceso"
                value={pending}
                icon={<Clock3 className="size-3.5" />}
              />
              <ResultItem
                label="Contingencia"
                value={response.summary.contingency}
                icon={<RotateCcw className="size-3.5" />}
              />
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Mensaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response.results.map((result) => (
                    <TableRow key={result.document_id}>
                      <TableCell>
                        {result.series || result.number
                          ? formatDocumentNumber(result.series, result.number)
                          : result.document_id}
                      </TableCell>
                      <TableCell>
                        <ResultStatusBadge status={result.status} />
                      </TableCell>
                      <TableCell>{result.code ?? "—"}</TableCell>
                      <TableCell>{result.message ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
