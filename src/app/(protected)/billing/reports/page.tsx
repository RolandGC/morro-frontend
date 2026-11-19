"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import SalesImportReportForm from "@/modules/billing/components/SalesImportReportForm";
import SalesImportReportInfo from "@/modules/billing/components/SalesImportReportInfo";
import { getSelectedCompany } from "@/modules/reports/utils/company";

export default function BillingReportsPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanyId(getSelectedCompany()?.id ?? "");
    }, 0);

    return () => clearTimeout(timer);
  }, []);

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
      permission="reports.export"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para exportar reportes.
        </div>
      }
    >
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <PageHeader
          title="Reportes"
          description="Exportación de comprobantes electrónicos para importación contable."
          icon={FileSpreadsheet}
        />

        <div className="grid w-full items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <SalesImportReportForm companyId={companyId} />
          <SalesImportReportInfo />
        </div>
      </div>
    </RequirePermission>
  );
}
