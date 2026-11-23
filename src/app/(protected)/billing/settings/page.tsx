"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/Spinner";
import BillingAccountForm from "@/modules/billing/components/BillingAccountForm";
import BillingStatusCard from "@/modules/billing/components/BillingStatusCard";
import CompanyBillingForm from "@/modules/billing/components/CompanyBillingForm";
import { billingService } from "@/modules/billing/services/billing.service";
import type {
  BillingAccountResponse,
  CompanyBillingResponse,
} from "@/modules/billing/types/billing.types";
import { getSelectedCompany } from "@/modules/reports/utils/company";
import { showToast } from "@/hooks/useToast";
import { useAuthStore } from "@/modules/auth/store/authStore";

export default function BillingSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [data, setData] = useState<CompanyBillingResponse | null>(null);
  const [account, setAccount] = useState<BillingAccountResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanyId(getSelectedCompany()?.id ?? "");
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!companyId) return;

      if (!silent) setLoading(true);

      try {
        const response = await billingService.getCompanyBilling(companyId);
        setData(response.data);

        if (user?.is_superadmin) {
          try {
            const accountResponse = await billingService.getAccount();
            setAccount(accountResponse.data);
          } catch {
            setAccount(null);
          }
        } else {
          setAccount(null);
        }
      } catch {
        if (!silent) setData(null);
        showToast("No se pudo cargar la configuración de facturación", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [companyId, user],
  );

  useEffect(() => {
    if (!companyId) return;
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [companyId, load]);

  const refresh = useCallback(() => load(true), [load]);

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
      permission="billing.read"
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
          No tienes permiso para ver la configuración de facturación.
        </div>
      }
    >
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <PageHeader
          title="Configuración de facturación"
          description="Datos fiscales, credenciales SUNAT y estado de sincronización de la empresa."
          icon={Settings2}
        />

        {loading ? (
          <Spinner />
        ) : data ? (
          <div className="grid w-full items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
            <CompanyBillingForm
              key={data.billing?.updated_at ?? data.company.id}
              companyId={companyId}
              data={data}
              onUpdated={refresh}
            />

            <div className="flex flex-col gap-4">
              <BillingStatusCard data={data} />
              {user?.is_superadmin ? (
                <BillingAccountForm
                  key={account?.username ?? "account"}
                  account={account}
                  onUpdated={refresh}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            No se pudo cargar la configuración de la empresa.
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
