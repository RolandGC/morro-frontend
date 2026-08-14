"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, Controller } from "react-hook-form";
import SimpleSelector from "@/components/SimpleSelector";
import { companyService } from "@/modules/core/companies/services/company.service";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { Customer } from "@/modules/sales/customers/types/customer.type";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";

export default function ClienteStep() {
    const router = useRouter();
    const { trigger, control } = useFormContext<SaleForm>();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [cResp, wResp] = await Promise.all([
                    companyService.getAllCompanies({ is_active: true }),
                    warehouseService.getAll({ is_active: true }),
                ]);
                if (cResp.status === 200) setCompanies(cResp.data.data);
                if (wResp.status === 200) setWarehouses(wResp.data.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, []);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [custResp, currResp] = await Promise.all([
                    customerService.getAll({ is_active: true }),
                    currencyService.getAll({ is_active: true }),
                ]);
                if (custResp.status === 200) setCustomers(custResp.data.data);
                if (currResp.status === 200) setCurrencies(currResp.data.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, []);

    return (
        <div className="container mx-auto py-4 px-4">
            <h2 className="text-lg font-medium mb-4">Cliente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="company_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SimpleSelector
                            label="Empresa"
                            value={field.value}
                            options={companies.map((c) => ({ id: c.id, name: c.name }))}
                            onSelect={field.onChange}
                            error={fieldState.error}
                        />
                    )}
                />

                <Controller
                    name="warehouse_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SimpleSelector
                            label="Almacén"
                            value={field.value}
                            options={warehouses.map((w) => ({ id: w.id, name: w.name }))}
                            onSelect={field.onChange}
                            error={fieldState.error}
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                    name="customer_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SimpleSelector
                            label="Cliente"
                            value={field.value}
                            options={customers.map((c) => ({ id: c.id, name: c.full_name }))}
                            onSelect={field.onChange}
                            error={fieldState.error}
                        />
                    )}
                />

                <Controller
                    name="currency_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SimpleSelector
                            label="Moneda"
                            value={field.value}
                            options={currencies.map((c) => ({ id: c.id, name: c.name }))}
                            onSelect={field.onChange}
                            error={fieldState.error}
                        />
                    )}
                />
            </div>

            <div className="mt-6 flex justify-between">
                <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-sm"
                    onClick={() => router.push("/sales/sale/add")}
                >
                    Anterior
                </button>

                <button
                    type="button"
                    className="rounded-md bg-primary px-3 py-1 text-sm text-white"
                    onClick={async () => {
                        const ok = await trigger?.(["company_id", "warehouse_id", "customer_id", "currency_id"]);
                        if (ok) router.push("/sales/sale/add/pago");
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
