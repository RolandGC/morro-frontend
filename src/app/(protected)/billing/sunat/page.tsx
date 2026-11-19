"use client";

import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";

export default function BillingSunatPage() {
  return (
    <RequirePermission
      permission="electronic-invoicing.read"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para acceder a facturación SUNAT.
        </div>
      }
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageHeader
          title="Facturación SUNAT"
          description="Envío de comprobantes electrónicos a SUNAT."
          icon={Receipt}
        />

        <EmptyState
          icon={Receipt}
          title="Módulo en preparación"
          description="Aquí podrás enviar comprobantes a SUNAT de forma individual o por lotes, y consultar su estado."
        />
      </div>
    </RequirePermission>
  );
}
