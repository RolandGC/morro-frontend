"use client";

import { useEffect, useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import LowStockTable from "@/modules/reports/components/LowStockTable";
import ReportFilters, {
  type ReportFilterValue,
} from "@/modules/reports/components/ReportFilters";
import { useReportData } from "@/modules/reports/hooks/useReportData";
import { reportService } from "@/modules/reports/services/report.service";
import type { ReportQueryParams } from "@/modules/reports/types/report.types";
import {
  getSelectedCompany,
  getSelectedWarehouseId,
} from "@/modules/reports/utils/company";

interface SelectedCompany {
  companyId: string;
  warehouses: { id: string; name: string }[];
}

export default function ReportsInventoryPage() {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [filters, setFilters] = useState<ReportFilterValue>({
    from: "",
    to: "",
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
      ...(filters.warehouseId ? { warehouse_id: filters.warehouseId } : {}),
    }),
    [selected?.companyId, filters.warehouseId],
  );

  const enabled = Boolean(selected?.companyId);

  const lowStock = useReportData(
    (p) => reportService.getLowStock(p),
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
          showDates={false}
        />

        {lowStock.error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {lowStock.error}
          </div>
        ) : null}

        <LowStockTable
          data={lowStock.data?.items ?? []}
          loading={lowStock.loading && !lowStock.data}
        />
      </div>
    </RequirePermission>
  );
}
