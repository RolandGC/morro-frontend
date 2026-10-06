"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showToast } from "@/hooks/useToast";
import { payment_account_type } from "@/types/types";
import { accountService } from "@/modules/finances/Account/services/account.service";
import { translateAccountType } from "@/modules/finances/Account/utils";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { reportService } from "../services/report.service";
import { downloadBase64File } from "../utils/download";
import { currentMonthRange, type DateRange } from "../utils/date";
import ReportSelect, { type ReportSelectOption } from "./ReportSelect";

const PAYMENT_METHODS: ReportSelectOption[] = [
  { value: payment_account_type.cash, label: "Efectivo" },
  { value: payment_account_type.yape, label: "Yape" },
  { value: payment_account_type.plin, label: "Plin" },
  { value: payment_account_type.debit_card, label: "Tarjeta de débito" },
  { value: payment_account_type.credit_card, label: "Tarjeta de crédito" },
  { value: payment_account_type.transfer, label: "Transferencia" },
];

const FORMATS: ReportSelectOption[] = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (.xlsx)" },
];

interface ExportPaymentsFormProps {
  companyId: string;
  warehouses: { id: string; name: string }[];
}

export default function ExportPaymentsForm({
  companyId,
  warehouses,
}: ExportPaymentsFormProps) {
  const [range, setRange] = useState<DateRange>(() => currentMonthRange());
  const [customerId, setCustomerId] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [currencyId, setCurrencyId] = useState("all");
  const [paymentAccountId, setPaymentAccountId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState<
    payment_account_type | "all"
  >("all");
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<ReportSelectOption[]>([]);
  const [currencies, setCurrencies] = useState<ReportSelectOption[]>([]);
  const [accounts, setAccounts] = useState<ReportSelectOption[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const [customersRes, currenciesRes, accountsRes] = await Promise.all([
          customerService.getAll({ limit: 100 }),
          currencyService.getAll({ limit: 100 }),
          accountService.getAll({ company_id: companyId, limit: 100 }),
        ]);

        setCustomers(
          customersRes.data.data.map((customer) => ({
            value: customer.id,
            label: customer.full_name,
          })),
        );
        setCurrencies(
          currenciesRes.data.data.map((currency) => ({
            value: currency.id,
            label: `${currency.name} (${currency.code})`,
          })),
        );
        setAccounts(
          accountsRes.data.data.map((account) => ({
            value: account.id,
            label: `${account.name} (${translateAccountType(account.type)})`,
          })),
        );
      } catch (err) {
        console.error("No se pudieron cargar los filtros del reporte", err);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [companyId]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await reportService.exportPayments({
        company_id: companyId,
        date_from: range.from,
        date_to: range.to,
        ...(customerId !== "all" ? { customer_id: customerId } : {}),
        ...(warehouseId !== "all" ? { warehouse_id: warehouseId } : {}),
        ...(currencyId !== "all" ? { currency_id: currencyId } : {}),
        ...(paymentAccountId !== "all"
          ? { payment_account_id: paymentAccountId }
          : {}),
        ...(paymentMethod !== "all" ? { payment_method: paymentMethod } : {}),
        format,
      });

      downloadBase64File(response.data);
      showToast("Reporte generado correctamente", "success");
    } catch {
      showToast("No se pudo generar el reporte", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de pagos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="payments-from"
            >
              Desde
            </label>
            <Input
              id="payments-from"
              type="date"
              value={range.from}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, from: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="payments-to"
            >
              Hasta
            </label>
            <Input
              id="payments-to"
              type="date"
              value={range.to}
              onChange={(event) =>
                setRange((prev) => ({ ...prev, to: event.target.value }))
              }
            />
          </div>

          <ReportSelect
            label="Cliente"
            value={customerId}
            onChange={setCustomerId}
            options={customers}
            allLabel="Todos los clientes"
          />

          <ReportSelect
            label="Almacén"
            value={warehouseId}
            onChange={setWarehouseId}
            options={warehouses.map((warehouse) => ({
              value: warehouse.id,
              label: warehouse.name,
            }))}
            allLabel="Todos los almacenes"
          />

          <ReportSelect
            label="Moneda"
            value={currencyId}
            onChange={setCurrencyId}
            options={currencies}
            allLabel="Todas las monedas"
          />

          <ReportSelect
            label="Cuenta de pago"
            value={paymentAccountId}
            onChange={setPaymentAccountId}
            options={accounts}
            allLabel="Todas las cuentas"
          />

          <ReportSelect
            label="Método de pago"
            value={paymentMethod}
            onChange={(value) =>
              setPaymentMethod(value as payment_account_type | "all")
            }
            options={PAYMENT_METHODS}
            allLabel="Todos los métodos"
          />

          <ReportSelect
            label="Formato"
            value={format}
            onChange={(value) => setFormat(value === "xlsx" ? "xlsx" : "pdf")}
            options={FORMATS}
          />
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleExport} disabled={loading}>
            <Download className="size-4" />
            {loading ? "Generando..." : "Generar reporte"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
