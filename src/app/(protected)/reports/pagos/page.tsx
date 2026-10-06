"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import ExportPaymentsForm from "@/modules/reports/components/ExportPaymentsForm";
import { getSelectedCompany } from "@/modules/reports/utils/company";

interface SelectedCompany {
  companyId: string;
  warehouses: { id: string; name: string }[];
}

export default function ReportsPaymentsPage() {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);

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
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
      permission="reports.export"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para exportar reportes.
        </div>
      }
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ExportPaymentsForm
          companyId={selected.companyId}
          warehouses={selected.warehouses}
        />
      </div>
    </RequirePermission>
  );
}
