"use client";

import { useEffect, useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import AgingPanel from "@/modules/reports/components/AgingPanel";
import { useReportData } from "@/modules/reports/hooks/useReportData";
import { reportService } from "@/modules/reports/services/report.service";
import type { ReportQueryParams } from "@/modules/reports/types/report.types";
import { getSelectedCompany } from "@/modules/reports/utils/company";

export default function ReportsReceivablesPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanyId(getSelectedCompany()?.id ?? "");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const params = useMemo<ReportQueryParams>(
    () => ({ company_id: companyId ?? "" }),
    [companyId],
  );

  const enabled = Boolean(companyId);

  const aging = useReportData(
    (p) => reportService.getReceivablesAging(p),
    params,
    enabled,
  );

  if (companyId === null) {
    return <Spinner />;
  }

  if (!companyId) {
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
        {aging.error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {aging.error}
          </div>
        ) : null}

        <AgingPanel
          data={aging.data}
          loading={aging.loading && !aging.data}
        />
      </div>
    </RequirePermission>
  );
}
