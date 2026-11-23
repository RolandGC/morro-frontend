"use client";

import { useState } from "react";
import { RefreshCw, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import ReportSelect from "@/modules/reports/components/ReportSelect";
import { showToast } from "@/hooks/useToast";
import { billingService } from "../services/billing.service";
import { fileToBase64 } from "../utils/file";
import type {
  BillingEnvironment,
  BillingPlan,
  CompanyBillingResponse,
  UpdateCompanyBillingPayload,
} from "../types/billing.types";

interface CompanyBillingFormProps {
  companyId: string;
  data: CompanyBillingResponse;
  onUpdated: () => void | Promise<void>;
}

const ENVIRONMENT_OPTIONS = [
  { value: "beta", label: "Beta / pruebas" },
  { value: "produccion", label: "Producción" },
];

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

const CERTIFICATE_FORMATS = [
  { value: "p12", label: "P12" },
  { value: "pfx", label: "PFX" },
  { value: "pem", label: "PEM" },
];

function errorMessage(error: unknown, fallback: string) {
  const response = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const message = response.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || fallback;
}

export default function CompanyBillingForm({
  companyId,
  data,
  onUpdated,
}: CompanyBillingFormProps) {
  const billing = data.billing;

  const [form, setForm] = useState({
    legal_name: billing?.legal_name ?? data.company.name ?? "",
    trade_name: billing?.trade_name ?? "",
    fiscal_address: billing?.fiscal_address ?? "",
    ubigeo: billing?.ubigeo ?? "",
    department: billing?.department ?? "",
    province: billing?.province ?? "",
    district: billing?.district ?? "",
    urbanization: billing?.urbanization ?? "",
    cod_local: billing?.cod_local ?? "",
    email: billing?.email ?? "",
    phone: billing?.phone ?? "",
    environment: (billing?.environment ?? "beta") as BillingEnvironment,
    plan: (billing?.plan ?? "free") as BillingPlan,
    sol_user: billing?.sol_user ?? "",
    sol_pass: "",
    is_enabled: Boolean(billing?.is_enabled),
  });

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateFormat, setCertificateFormat] = useState<
    "p12" | "pfx" | "pem"
  >("p12");
  const [certificatePassword, setCertificatePassword] = useState("");

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload: UpdateCompanyBillingPayload = {
        legal_name: form.legal_name,
        trade_name: form.trade_name,
        fiscal_address: form.fiscal_address,
        department: form.department,
        province: form.province,
        district: form.district,
        urbanization: form.urbanization,
        cod_local: form.cod_local,
        email: form.email,
        phone: form.phone,
        environment: form.environment,
        plan: form.plan,
        is_enabled: form.is_enabled,
      };

      if (form.ubigeo) payload.ubigeo = form.ubigeo;
      if (form.sol_user) payload.sol_user = form.sol_user;
      if (form.sol_pass) payload.sol_pass = form.sol_pass;

      const response = await billingService.updateCompanyBilling(
        companyId,
        payload,
      );

      if (response.data.sync && !response.data.sync.success) {
        showToast(
          response.data.sync.error || "No se pudo sincronizar con APISPERU",
          "warning",
        );
      } else {
        showToast("Configuración guardada", "success");
      }

      setDirty(false);
      await onUpdated();
    } catch (error) {
      showToast(
        errorMessage(error, "No se pudo guardar la configuración"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (dirty) {
      showToast(
        "Guarde los cambios antes de sincronizar con APISPERU",
        "warning",
      );
      return;
    }

    setSyncing(true);

    try {
      const response = await billingService.syncCompany(companyId);

      if (response.data.success) {
        showToast("Empresa sincronizada con APISPERU", "success");
      } else {
        showToast(
          response.data.error || "No se pudo sincronizar la empresa",
          "warning",
        );
      }

      await onUpdated();
    } catch (error) {
      showToast(
        errorMessage(error, "No se pudo sincronizar la empresa"),
        "error",
      );
      await onUpdated();
    } finally {
      setSyncing(false);
    }
  };

  const handleCertificate = async () => {
    if (dirty) {
      showToast(
        "Guarde los cambios antes de subir el certificado",
        "warning",
      );
      return;
    }

    if (!certificateFile) {
      showToast("Seleccione un certificado", "warning");
      return;
    }

    if (
      (certificateFormat === "p12" || certificateFormat === "pfx") &&
      !certificatePassword
    ) {
      showToast("Ingrese la contraseña del certificado", "warning");
      return;
    }

    setUploading(true);

    try {
      const certificate_base64 = await fileToBase64(certificateFile);
      const response = await billingService.uploadCertificate(companyId, {
        certificate_base64,
        format: certificateFormat,
        ...(certificatePassword ? { password: certificatePassword } : {}),
        filename: certificateFile.name,
      });

      if (response.data.sync && !response.data.sync.success) {
        showToast(
          response.data.sync.error ||
            "Certificado guardado, pero no se pudo sincronizar",
          "warning",
        );
      } else {
        showToast("Certificado guardado", "success");
      }

      setCertificateFile(null);
      setCertificatePassword("");
      setDirty(false);
      await onUpdated();
    } catch (error) {
      showToast(
        errorMessage(error, "No se pudo subir el certificado"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Datos de facturación</CardTitle>
        <CardDescription>
          Configura la información fiscal y las credenciales SUNAT de la
          empresa seleccionada.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="legal-name">
              Razón social
            </label>
            <Input
              id="legal-name"
              value={form.legal_name}
              onChange={(event) => setField("legal_name", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="trade-name">
              Nombre comercial
            </label>
            <Input
              id="trade-name"
              value={form.trade_name}
              onChange={(event) => setField("trade_name", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="fiscal-address"
            >
              Dirección fiscal
            </label>
            <Input
              id="fiscal-address"
              value={form.fiscal_address}
              onChange={(event) =>
                setField("fiscal_address", event.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="ubigeo">
              Ubigeo
            </label>
            <Input
              id="ubigeo"
              value={form.ubigeo}
              maxLength={6}
              inputMode="numeric"
              onChange={(event) => setField("ubigeo", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="department"
            >
              Departamento
            </label>
            <Input
              id="department"
              value={form.department}
              onChange={(event) => setField("department", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="province">
              Provincia
            </label>
            <Input
              id="province"
              value={form.province}
              onChange={(event) => setField("province", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="district">
              Distrito
            </label>
            <Input
              id="district"
              value={form.district}
              onChange={(event) => setField("district", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="urbanization"
            >
              Urbanización
            </label>
            <Input
              id="urbanization"
              value={form.urbanization}
              onChange={(event) =>
                setField("urbanization", event.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="cod-local">
              Código de local
            </label>
            <Input
              id="cod-local"
              value={form.cod_local}
              onChange={(event) => setField("cod_local", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="phone">
              Teléfono
            </label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <ReportSelect
            label="Ambiente"
            value={form.environment}
            onChange={(value) =>
              setField("environment", value as BillingEnvironment)
            }
            options={ENVIRONMENT_OPTIONS}
          />

          <ReportSelect
            label="Plan"
            value={form.plan}
            onChange={(value) => setField("plan", value as BillingPlan)}
            options={PLAN_OPTIONS}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="sol-user">
              Usuario SUNAT (SOL)
            </label>
            <Input
              id="sol-user"
              value={form.sol_user}
              onChange={(event) => setField("sol_user", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="sol-pass">
              Clave SUNAT
            </label>
            <Input
              id="sol-pass"
              type="password"
              value={form.sol_pass}
              placeholder="Dejar vacío para conservar"
              onChange={(event) => setField("sol_pass", event.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.is_enabled}
            onCheckedChange={(checked) =>
              setField("is_enabled", checked === true)
            }
          />
          Habilitar emisión electrónica para esta empresa
        </label>

        <Separator />

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Certificado digital</p>
            <p className="text-xs text-muted-foreground">
              {billing?.has_certificate
                ? `Certificado cargado${
                    billing.certificate_filename
                      ? `: ${billing.certificate_filename}`
                      : ""
                  }`
                : "Aún no hay certificado cargado."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="certificate-file"
              >
                Archivo
              </label>
              <Input
                id="certificate-file"
                type="file"
                accept=".p12,.pfx,.pem"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setCertificateFile(file);
                  if (!file) return;
                  const ext = file.name.split(".").pop()?.toLowerCase();
                  if (ext === "p12" || ext === "pfx" || ext === "pem") {
                    setCertificateFormat(ext);
                  }
                }}
              />
            </div>

            <ReportSelect
              label="Formato"
              value={certificateFormat}
              onChange={(value) =>
                setCertificateFormat(value as "p12" | "pfx" | "pem")
              }
              options={CERTIFICATE_FORMATS}
            />

            <div className="flex flex-col gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="certificate-password"
              >
                Contraseña del certificado
              </label>
              <Input
                id="certificate-password"
                type="password"
                value={certificatePassword}
                placeholder="Solo para P12/PFX"
                onChange={(event) =>
                  setCertificatePassword(event.target.value)
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCertificate}
                disabled={uploading || !certificateFile}
              >
                <Upload className="size-4" />
                {uploading ? "Subiendo..." : "Subir certificado"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSync}
            disabled={syncing || saving || uploading}
          >
            <RefreshCw className="size-4" />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || syncing || uploading}
          >
            <Save className="size-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
