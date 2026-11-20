"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, FileCheck2, Receipt, Send } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { Spinner } from "@/components/Spinner";
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
import { usePermission } from "@/hooks/usePermission";
import { showToast } from "@/hooks/useToast";
import { confirmAction } from "@/lib/swal";

import { electronicInvoicingService } from "../services/electronicInvoicing.service";
import { useElectronicInvoicingStore } from "../store/electronicInvoicing.store";
import type { ElectronicDocumentDetail } from "../types/electronicInvoicing.types";
import { getElectronicInvoicingErrorMessage } from "../utils/electronicInvoicingError";
import {
  formatDocumentDate,
  formatDocumentDateTime,
  formatDocumentMoney,
  formatDocumentNumber,
  formatDocumentQuantity,
  getDocumentTypeLabel,
  getSaleStatusLabel,
  getSaleStatusStyle,
} from "../utils/electronicInvoicingFormat";
import { SunatStatusBadge } from "./SunatStatusBadge";

interface DetailState {
  id: string;
  document: ElectronicDocumentDetail | null;
  error: string | null;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function ElectronicInvoicingDetailModal({
  onSent,
}: {
  onSent: () => Promise<void> | void;
}) {
  const { detailId, close } = useElectronicInvoicingStore();
  const { can } = usePermission();
  const canSend = can("electronic-invoicing.send");

  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [sending, setSending] = useState(false);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const response = await electronicInvoicingService.getById(id);
      if (response.status !== 200) {
        throw new Error("Respuesta inesperada al obtener el detalle");
      }
      setDetailState({ id, document: response.data, error: null });
    } catch (error) {
      console.error("Error cargando detalle electrónico:", error);
      setDetailState({
        id,
        document: null,
        error: getElectronicInvoicingErrorMessage(
          error,
          "No se pudo cargar el detalle del comprobante"
        ),
      });
    }
  }, []);

  useEffect(() => {
    if (!detailId) return;
    const timer = setTimeout(() => {
      void loadDetail(detailId);
    }, 0);

    return () => clearTimeout(timer);
  }, [detailId, loadDetail]);

  const isCurrentDetail = detailState?.id === detailId;
  const loading = Boolean(detailId) && !isCurrentDetail;
  const error =
    Boolean(detailId) && isCurrentDetail ? (detailState?.error ?? null) : null;
  const document =
    Boolean(detailId) && isCurrentDetail
      ? (detailState?.document ?? null)
      : null;

  const handleSend = async () => {
    if (!document || sending) return;

    const result = await confirmAction(
      "Enviar a SUNAT",
      `Se enviará el comprobante ${formatDocumentNumber(document.series, document.number)} a SUNAT.`,
      "Sí, enviar"
    );
    if (!result.isConfirmed) return;

    setSending(true);
    try {
      const response = await electronicInvoicingService.send(document.id);
      const data = response.data;
      showToast(
        data?.message ||
          `Comprobante enviado a SUNAT (${data?.status ?? "sin estado"}).`,
        data?.status === "rejected" || data?.status === "contingency"
          ? "warning"
          : "success"
      );
      await loadDetail(document.id);
      await onSent();
    } catch (sendError) {
      console.error("Error enviando comprobante a SUNAT:", sendError);
      showToast(
        getElectronicInvoicingErrorMessage(
          sendError,
          "No se pudo enviar el comprobante a SUNAT"
        ),
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const currency = document?.sale.currency?.code ?? "PEN";
  const items = document?.items ?? [];

  return (
    <Dialog
      open={detailId !== null}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">
            Detalle del comprobante electrónico
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="No se pudo cargar el detalle"
            description={error}
            action={
              <Button variant="outline" onClick={close}>
                Cerrar
              </Button>
            }
          />
        ) : document ? (
          <div className="flex flex-col gap-4">
            <SectionCard
              icon={Receipt}
              title="Información general"
              description="Datos registrados localmente y de la venta asociada."
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <SummaryItem
                  label="Tipo de comprobante"
                  value={getDocumentTypeLabel(document.document_type)}
                />
                <SummaryItem
                  label="Serie y correlativo"
                  value={formatDocumentNumber(document.series, document.number)}
                />
                <SummaryItem
                  label="Fecha de emisión"
                  value={formatDocumentDate(document.sale.sale_date)}
                />
                <SummaryItem
                  label="Fecha de registro"
                  value={formatDocumentDate(document.created_at)}
                />
                <SummaryItem
                  label="Cliente"
                  value={document.customer?.name ?? "—"}
                />
                <SummaryItem
                  label="Documento del cliente"
                  value={
                    document.customer?.doc_number
                      ? `${document.customer.doc_type?.toUpperCase() ?? ""} ${document.customer.doc_number}`.trim()
                      : "—"
                  }
                />
                <SummaryItem
                  label="Moneda"
                  value={document.sale.currency?.code ?? "—"}
                />
                <SummaryItem
                  label="Importe total"
                  value={formatDocumentMoney(document.totals.total, currency)}
                />
                <SummaryItem
                  label="Estado local"
                  value={getSaleStatusLabel(document.sale.status)}
                />
                <SummaryItem
                  label="Régimen"
                  value={document.regime === "zofra" ? "Zofra" : "General"}
                />
                <SummaryItem
                  label="Almacén"
                  value={document.sale.warehouse?.name ?? "—"}
                />
                <SummaryItem
                  label="Vendedor"
                  value={document.sale.seller?.name ?? "—"}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={FileCheck2}
              title="Detalle de operaciones"
              description="Productos o servicios, cantidades, precios e impuestos."
              bodyClassName="p-0"
            >
              {items.length === 0 ? (
                <EmptyState
                  compact
                  icon={FileCheck2}
                  title="Sin ítems registrados"
                  className="m-4"
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio unitario</TableHead>
                        <TableHead className="text-right">IGV</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead>Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.sale_item_id}>
                          <TableCell>
                            <p className="font-medium">
                              {item.product_name ?? "Producto"}
                            </p>
                            {item.model ? (
                              <p className="text-xs text-muted-foreground">
                                {item.model}
                              </p>
                            ) : null}
                          </TableCell>
                          <TableCell>{item.unit ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            {formatDocumentQuantity(item.quantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDocumentMoney(item.unit_price, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDocumentMoney(item.igv_amount, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDocumentMoney(item.subtotal, currency)}
                          </TableCell>
                          <TableCell>
                            {item.is_bonus ? "Bonificación" : "Normal"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="grid gap-3 border-t p-4 sm:grid-cols-3">
                <SummaryItem
                  label="Subtotal"
                  value={formatDocumentMoney(document.totals.subtotal, currency)}
                />
                <SummaryItem
                  label="IGV"
                  value={formatDocumentMoney(document.totals.igv, currency)}
                />
                <SummaryItem
                  label="Total"
                  value={formatDocumentMoney(document.totals.total, currency)}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Send}
              title="Información de SUNAT"
              description="Estado y resultado del último envío registrado por el backend."
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <div className="mt-1">
                    <SunatStatusBadge status={document.status} />
                  </div>
                </div>
                <SummaryItem
                  label="Fecha de envío"
                  value={formatDocumentDateTime(document.voucher?.sent_at)}
                />
                <SummaryItem
                  label="Código de respuesta"
                  value={document.voucher?.code ?? "—"}
                />
                <SummaryItem
                  label="Mensaje de SUNAT"
                  value={document.voucher?.message ?? "—"}
                />
                <SummaryItem
                  label="Hash"
                  value={document.voucher?.hash ?? "—"}
                />
                <SummaryItem
                  label="ID externo"
                  value={document.voucher?.external_id ?? "—"}
                />
                <SummaryItem
                  label="Reintentos"
                  value={String(document.voucher?.retry_count ?? 0)}
                />
                <SummaryItem
                  label="Próximo reintento"
                  value={formatDocumentDateTime(document.voucher?.next_retry_at)}
                />
                <SummaryItem
                  label="Ambiente"
                  value={document.voucher?.environment ?? "—"}
                />
                <SummaryItem
                  label="ID del proveedor"
                  value={document.voucher?.provider_company_id ?? "—"}
                />
              </div>
            </SectionCard>

            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getSaleStatusStyle(document.sale.status)}`}
                >
                  {getSaleStatusLabel(document.sale.status)}
                </span>
                {!document.sendable ? (
                  <span className="text-xs text-muted-foreground">
                    El backend no permite enviar comprobantes de ventas anuladas.
                  </span>
                ) : null}
              </div>

              {canSend ? (
                <Button
                  onClick={() => void handleSend()}
                  disabled={!document.sendable || sending}
                >
                  <Send className="mr-1.5 size-4" />
                  {sending ? "Enviando..." : "Enviar a SUNAT"}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
