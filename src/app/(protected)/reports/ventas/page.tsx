"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Receipt, ShoppingCart } from "lucide-react";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import KpiCard from "@/modules/reports/components/KpiCard";
import PaymentMethodChart from "@/modules/reports/components/PaymentMethodChart";
import ReportFilters, {
  type ReportFilterValue,
} from "@/modules/reports/components/ReportFilters";
import SalesByDayChart from "@/modules/reports/components/SalesByDayChart";
import TopProductsTable from "@/modules/reports/components/TopProductsTable";
import { useReportData } from "@/modules/reports/hooks/useReportData";
import { reportService } from "@/modules/reports/services/report.service";
import type { ReportQueryParams } from "@/modules/reports/types/report.types";
import {
  getSelectedCompany,
  getSelectedWarehouseId,
} from "@/modules/reports/utils/company";
import { currentMonthRange } from "@/modules/reports/utils/date";
import { formatMoney, formatNumber } from "@/modules/reports/utils/format";

interface SelectedCompany {
  companyId: string;
  warehouses: { id: string; name: string }[];
}

export default function ReportsSalesPage() {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [filters, setFilters] = useState<ReportFilterValue>(() => {
    const range = currentMonthRange();
    return { from: range.from, to: range.to };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const company = getSelectedCompany();
      const warehouse = company?.warehouse;
      setSelected({
        companyId: company?.id ?? "",
        warehouses: warehouse
          ? [{ id: warehouse.id, name: warehouse.name }]
          : [],
      });
      const warehouseId = getSelectedWarehouseId();
      if (warehouseId) {
        setFilters((prev) =>
          prev.warehouseId ? prev : { ...prev, warehouseId },
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const params = useMemo<ReportQueryParams>(
    () => ({
      company_id: selected?.companyId ?? "",
      date_from: filters.from,
      date_to: filters.to,
      ...(filters.warehouseId ? { warehouse_id: filters.warehouseId } : {}),
    }),
    [selected?.companyId, filters.from, filters.to, filters.warehouseId],
  );

  const enabled = Boolean(selected?.companyId);

  const summary = useReportData(
    (p) => reportService.getSummary(p),
    params,
    enabled,
  );
  const byDay = useReportData(
    (p) => reportService.getSalesByDay(p),
    params,
    enabled,
  );
  const byMethod = useReportData(
    (p) => reportService.getSalesByPaymentMethod(p),
    params,
    enabled,
  );
  const topProducts = useReportData(
    (p) => reportService.getTopProducts({ ...p, limit: 10, sort_by: "amount" }),
    params,
    enabled,
  );

  if (!selected) {
    return <Spinner />;
  }

  if (!selected.companyId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        No hay una empresa seleccionada.
      </div>
    );
  }

  const error =
    summary.error ?? byDay.error ?? byMethod.error ?? topProducts.error;

  return (
    <RequirePermission
      permission="reports.read"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para ver reportes.
        </div>
      }
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ReportFilters
          value={filters}
          onChange={setFilters}
          warehouses={selected.warehouses}
        />

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Ventas totales"
            value={formatMoney(summary.data?.sales.total)}
            hint={`${formatNumber(summary.data?.sales.count)} ventas`}
            icon={ShoppingCart}
          />
          <KpiCard
            title="Ticket promedio"
            value={formatMoney(summary.data?.sales.ticket_average)}
            icon={Receipt}
          />
          <KpiCard
            title="Contado"
            value={formatMoney(summary.data?.sales.cash)}
            icon={Banknote}
          />
          <KpiCard
            title="Crédito"
            value={formatMoney(summary.data?.sales.credit)}
            icon={CreditCard}
          />
          <KpiCard title="IGV" value={formatMoney(summary.data?.sales.igv)} />
          <KpiCard
            title="Compras"
            value={formatMoney(summary.data?.purchases.total)}
            hint={`${formatNumber(summary.data?.purchases.count)} compras`}
          />
          <KpiCard
            title="Por cobrar"
            value={formatMoney(summary.data?.receivables_pending)}
          />
          <KpiCard
            title="Ventas anuladas"
            value={formatNumber(summary.data?.sales.cancelled_count)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SalesByDayChart
            data={byDay.data?.data ?? []}
            loading={byDay.loading && !byDay.data}
          />
          <PaymentMethodChart
            data={byMethod.data?.data ?? []}
            loading={byMethod.loading && !byMethod.data}
          />
        </div>

        <TopProductsTable
          data={topProducts.data?.data ?? []}
          loading={topProducts.loading && !topProducts.data}
        />
      </div>
    </RequirePermission>
  );
}
