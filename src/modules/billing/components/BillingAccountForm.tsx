"use client";

import { useState } from "react";
import { PlugZap, Save } from "lucide-react";
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
import { showToast } from "@/hooks/useToast";
import { billingService } from "../services/billing.service";
import type { BillingAccountResponse } from "../types/billing.types";

interface BillingAccountFormProps {
  account: BillingAccountResponse | null;
  onUpdated: () => void | Promise<void>;
}

function errorMessage(error: unknown, fallback: string) {
  const response = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const message = response.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BillingAccountForm({
  account,
  onUpdated,
}: BillingAccountFormProps) {
  const [form, setForm] = useState({
    username: account?.username ?? "",
    password: "",
    base_url: account?.base_url ?? "",
    is_active: account?.is_active ?? true,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form.username.trim() || !form.password) {
      showToast("Ingrese usuario y contraseña de APISPERU", "warning");
      return;
    }

    setSaving(true);

    try {
      await billingService.updateAccount({
        username: form.username.trim(),
        password: form.password,
        ...(form.base_url.trim() ? { base_url: form.base_url.trim() } : {}),
        is_active: form.is_active,
      });

      showToast("Cuenta APISPERU actualizada", "success");
      setForm((prev) => ({ ...prev, password: "" }));
      setDirty(false);
      await onUpdated();
    } catch (error) {
      showToast(
        errorMessage(error, "No se pudo actualizar la cuenta APISPERU"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (dirty) {
      showToast(
        "Guarde la cuenta antes de probar la conexión con APISPERU",
        "warning",
      );
      return;
    }

    setTesting(true);

    try {
      const response = await billingService.testAccount();
      if (response.data.success) {
        showToast("Conexión con APISPERU correcta", "success");
      } else {
        showToast(
          response.data.error || "No se pudo conectar con APISPERU",
          "error",
        );
      }

      await onUpdated();
    } catch (error) {
      showToast(
        errorMessage(error, "No se pudo conectar con APISPERU"),
        "error",
      );
      await onUpdated();
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta APISPERU</CardTitle>
        <CardDescription>
          Cuenta plataforma compartida. Solo el superadministrador puede
          modificarla.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
          {account?.configured
            ? `Configurada para ${account.username ?? "—"}.`
            : "La cuenta APISPERU aún no está configurada."}
          {account?.last_error ? (
            <span className="mt-1 block text-destructive">
              {account.last_error}
            </span>
          ) : null}
          {account?.token_expires_at ? (
            <span className="mt-1 block">
              Token expira: {formatDate(account.token_expires_at)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="billing-user">
            Usuario
          </label>
          <Input
            id="billing-user"
            value={form.username}
            onChange={(event) => setField("username", event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="billing-pass">
            Contraseña
          </label>
          <Input
            id="billing-pass"
            type="password"
            value={form.password}
            placeholder="Requerida para guardar"
            onChange={(event) => setField("password", event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="billing-url">
            Base URL
          </label>
          <Input
            id="billing-url"
            value={form.base_url}
            placeholder="https://facturacion.apisperu.com/api/v1"
            onChange={(event) => setField("base_url", event.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.is_active}
            onCheckedChange={(checked) =>
              setField("is_active", checked === true)
            }
          />
          Cuenta activa
        </label>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testing || saving}
          >
            <PlugZap className="size-4" />
            {testing ? "Probando..." : "Probar conexión"}
          </Button>

          <Button type="button" onClick={handleSave} disabled={saving || testing}>
            <Save className="size-4" />
            {saving ? "Guardando..." : "Guardar cuenta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
