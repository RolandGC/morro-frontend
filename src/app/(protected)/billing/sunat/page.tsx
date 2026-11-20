"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Receipt } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";
import { SectionCard } from "@/components/section-card";
import { Spinner } from "@/components/Spinner";
import { usePermission } from "@/hooks/usePermission";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { showToast } from "@/hooks/useToast";
import { confirmAction } from "@/lib/swal";
import ElectronicInvoicingBatchResultModal from "@/modules/electronicInvoicing/components/ElectronicInvoicingBatchResultModal";
import ElectronicInvoicingDashboard from "@/modules/electronicInvoicing/components/ElectronicInvoicingDashboard";
import ElectronicInvoicingDetailModal from "@/modules/electronicInvoicing/components/ElectronicInvoicingDetailModal";
import {
  ElectronicInvoicingDataTable,
  MAX_BATCH_SELECTION,
} from "@/modules/electronicInvoicing/components/ElectronicInvoicingDataTable";
import { electronicInvoicingService } from "@/modules/electronicInvoicing/services/electronicInvoicing.service";
import { useElectronicInvoicingStore } from "@/modules/electronicInvoicing/store/electronicInvoicing.store";
import type {
  ElectronicDocument,
  ElectronicDocumentQueryParams,
  ElectronicInvoicingSummary,
  SendBatchResponse,
} from "@/modules/electronicInvoicing/types/electronicInvoicing.types";
import { getElectronicInvoicingErrorMessage } from "@/modules/electronicInvoicing/utils/electronicInvoicingError";
import { formatDocumentNumber } from "@/modules/electronicInvoicing/utils/electronicInvoicingFormat";
import {
  getSelectedCompanyId,
  getSelectedWarehouseId,
} from "@/modules/reports/utils/company";
import type { PaginationMeta } from "@/types/types";

export default function BillingSunatPage() {
  const { isLoading: routeLoading } =
    useProtectedRoute("electronic-invoicing.read");
  const { can } = usePermission();
  const { openDetail } = useElectronicInvoicingStore();
  const canSend = can("electronic-invoicing.send");

  const [data, setData] = useState<ElectronicDocument[]>([]);
  const [pages, setPages] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [companyId] = useState<string | undefined>(
    () => getSelectedCompanyId() ?? undefined
  );
  const [warehouseId] = useState<string | undefined>(
    () => getSelectedWarehouseId() ?? undefined
  );

  const [summary, setSummary] = useState<ElectronicInvoicingSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState<SendBatchResponse | null>(null);

  const initialLoad = useRef(true);

  const [filter, setFilter] = useState<ElectronicDocumentQueryParams>({
    page: 1,
    limit: 10,
    kind: "all",
    status: "all",
  });

  const handleFilter = <K extends keyof ElectronicDocumentQueryParams>(
    key: K,
    value: ElectronicDocumentQueryParams[K]
  ) => {
    setFilter((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "page" ? {} : { page: 1 }),
    }));
  };

  const fetchData = useCallback(async () => {
    const isInitial = initialLoad.current;
    if (isInitial) setLoading(true);
    else setFilterLoading(true);

    try {
      const { kind, status, ...rest } = filter;
      const response = await electronicInvoicingService.getAll({
        ...rest,
        ...(kind && kind !== "all" ? { kind } : {}),
        ...(status && status !== "all" ? { status } : {}),
        ...(companyId ? { company_id: companyId } : {}),
        ...(warehouseId ? { warehouse_id: warehouseId } : {}),
      });

      if (response.status !== 200) {
        throw new Error("Respuesta inesperada al listar comprobantes");
      }

      setData(response.data.data);
      setPages(response.data.meta);
    } catch (error) {
      console.error("Error cargando comprobantes electrónicos:", error);
      showToast(
        getElectronicInvoicingErrorMessage(
          error,
          "No se pudieron cargar los comprobantes electrónicos"
        ),
        "error"
      );
    } finally {
      initialLoad.current = false;
      if (isInitial) setLoading(false);
      else setFilterLoading(false);
    }
  }, [filter, companyId, warehouseId]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await electronicInvoicingService.getSummary(
        companyId ? { company_id: companyId } : undefined
      );

      if (response.status !== 200) {
        throw new Error("Respuesta inesperada al obtener el resumen");
      }

      setSummary(response.data);
      setSummaryError(null);
    } catch (error) {
      console.error("Error cargando resumen de facturación electrónica:", error);
      setSummaryError(
        getElectronicInvoicingErrorMessage(
          error,
          "No se pudo cargar el resumen de estados"
        )
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [companyId]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchData(), fetchSummary()]);
  }, [fetchData, fetchSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSummary();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchSummary]);

  const handleSend = async (document: ElectronicDocument) => {
    if (sendingId) return;

    const result = await confirmAction(
      "Enviar a SUNAT",
      `Se enviará el comprobante ${formatDocumentNumber(document.series, document.number)} a SUNAT.`,
      "Sí, enviar"
    );
    if (!result.isConfirmed) return;

    setSendingId(document.id);
    try {
      const response = await electronicInvoicingService.send(document.id);
      showToast(
        response.data?.message ||
          `Comprobante enviado a SUNAT (${response.data?.status ?? "sin estado"}).`,
        response.data?.status === "rejected" ||
          response.data?.status === "contingency"
          ? "warning"
          : "success"
      );
      await refreshAll();
    } catch (error) {
      console.error("Error enviando comprobante a SUNAT:", error);
      showToast(
        getElectronicInvoicingErrorMessage(
          error,
          "No se pudo enviar el comprobante a SUNAT"
        ),
        "error"
      );
    } finally {
      setSendingId(null);
    }
  };

  const handleSendBatch = async (ids: string[]): Promise<boolean> => {
    if (sendingBatch || ids.length === 0) return false;

    if (ids.length > MAX_BATCH_SELECTION) {
      showToast(
        `El backend permite enviar hasta ${MAX_BATCH_SELECTION} comprobantes por lote.`,
        "warning"
      );
      return false;
    }

    const result = await confirmAction(
      "Enviar seleccionados a SUNAT",
      `Se enviarán ${ids.length} comprobantes seleccionados a SUNAT.`,
      "Sí, enviar"
    );
    if (!result.isConfirmed) return false;

    setSendingBatch(true);
    try {
      const response = await electronicInvoicingService.sendBatch(ids);
      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Respuesta inesperada al enviar el lote");
      }

      setBatchResult(response.data);
      showToast(
        `Lote procesado: ${response.data.summary.accepted} aceptados, ${response.data.summary.rejected} rechazados, ${response.data.summary.error} con error.`,
        response.data.summary.error > 0 || response.data.summary.rejected > 0
          ? "warning"
          : "success"
      );
      await refreshAll();
      return true;
    } catch (error) {
      console.error("Error enviando lote a SUNAT:", error);
      showToast(
        getElectronicInvoicingErrorMessage(
          error,
          "No se pudo enviar el lote seleccionado a SUNAT"
        ),
        "error"
      );
      return false;
    } finally {
      setSendingBatch(false);
    }
  };

  if (loading || routeLoading) {
    return (
      <div className="container mx-auto px-4 py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <RequirePermission
      permission="electronic-invoicing.read"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para acceder a facturación electrónica.
        </div>
      }
    >
      <main className="w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="mx-auto grid w-full min-w-0 max-w-screen-2xl grid-cols-1 gap-4 px-3 py-4 sm:px-4 lg:px-6">

          <div className="w-full min-w-0">
            <PageHeader
              title="Facturación electrónica"
              description="Consulta los comprobantes registrados localmente, monitoriza su estado y envíalos a SUNAT."
              icon={Receipt}
            />
          </div>

          <div className="w-full min-w-0">
            <ElectronicInvoicingDashboard
              summary={summary}
              loading={summaryLoading}
              error={summaryError}
              onRetry={() => void fetchSummary()}
            />
          </div>

          <div className="w-full min-w-0">
            <SectionCard
              title="Comprobantes electrónicos"
              description="Los filtros de tipo, estado y fecha se aplican en el servidor; la búsqueda de texto actúa sobre la página actual."
              badge={
                filterLoading ? (
                  <span className="text-xs text-muted-foreground">
                    Actualizando...
                  </span>
                ) : null
              }
            >
              <div className="w-full min-w-0">
                <ElectronicInvoicingDataTable
                  data={data}
                  filter={filter}
                  handleFilter={handleFilter}
                  totalPages={pages?.totalPages ?? 1}
                  totalRecords={pages?.total ?? 0}
                  isFiltering={filterLoading}
                  canSend={canSend}
                  sendingId={sendingId}
                  onDetail={openDetail}
                  onSend={(document) => void handleSend(document)}
                  sendingBatch={sendingBatch}
                  onSendBatch={handleSendBatch}
                />
              </div>
            </SectionCard>
          </div>

          <ElectronicInvoicingDetailModal onSent={refreshAll} />
          <ElectronicInvoicingBatchResultModal
            response={batchResult}
            onClose={() => setBatchResult(null)}
          />
        </div>
      </main>
    </RequirePermission>
  );
}
