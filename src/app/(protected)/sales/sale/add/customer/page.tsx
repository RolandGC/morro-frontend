"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import SimpleSelector from "@/components/SimpleSelector";
import { companyService } from "@/modules/core/companies/services/company.service";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { Customer, CustomerQueryParams } from "@/modules/sales/customers/types/customer.type";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";
import { Search } from "lucide-react";
import { CustomerSearchItem } from "@/modules/sales/customers/components/CustomerSearchItem";

export default function ClienteStep() {
    const router = useRouter();
    const { trigger, control, setValue } = useFormContext<SaleForm>();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);

    const [company, setCompany] = useState<Company | null>(null);
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

    useEffect(() => {
        try {
            const storedCompany = localStorage.getItem("selected_company");

            if (!storedCompany ) {
                console.error("No existe empresa o almacén seleccionado");
                return;
            }

            const parsedCompany: Company = JSON.parse(storedCompany);

            /* setCompany(parsedCompany);
            setWarehouse(parsedCompany?.); */

            // Setear directamente en react-hook-form
           /*  setValue("company_id", parsedCompany.id, {
                shouldValidate: true,
                shouldDirty: false,
            });

            setValue("warehouse_id", parsedWarehouse.id, {
                shouldValidate: true,
                shouldDirty: false,
            }); */
        } catch (error) {
            console.error(
                "Error recuperando empresa/almacén del storage:",
                error
            );
        }
    }, [setValue]);


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
                const currResp = await currencyService.getAll({ is_active: true })
                if (currResp.status === 200) setCurrencies(currResp.data.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, []);


    const fetchCustomers = async (full_name = "") => {
        try {
            setCustomerLoading(true);

            const response = await customerService.getAll({
                full_name,
                is_active: true,
                page: 1,
                limit: 6,
            });

            if (response.status === 200) {
                setCustomerResults(response.data.data);
            } else {
                setCustomerResults([]);
            }
        } catch (error) {
            console.error("Error obteniendo clientes:", error);
            setCustomerResults([]);
        } finally {
            setCustomerLoading(false);
        }
    };

    useEffect(() => {
        const value = searchCustomer.trim();

        const timeout = setTimeout(() => {
            fetchCustomers(value);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchCustomer]);


    return (
        <div className="container mx-auto py-4 px-4">
            <h2 className="text-lg font-medium mb-4">Cliente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Empresa
                            </label>

                            <input
                                type="text"
                                value={company?.name ?? ""}
                                disabled
                                readOnly
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Almacén
                            </label>

                            <input
                                type="text"
                                value={warehouse?.name ?? ""}
                                disabled
                                readOnly
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* <Controller
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
                /> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                    name="customer_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Cliente
                            </label>

                            {/* Buscador */}
                            <div className="relative">
                                <Search
                                    size={20}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchCustomer}
                                    onChange={(e) =>
                                        setSearchCustomer(e.target.value)
                                    }
                                    placeholder="Buscar cliente..."
                                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            {/* Listado */}
                            <div className="mt-3 space-y-2 max-h-125 overflow-y-auto pr-1">
                                {customerLoading ? (
                                    <div className="py-8 text-center text-sm text-gray-400">
                                        Buscando cliente...
                                    </div>
                                ) : customerResults.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-gray-400">
                                        No se encontraron clientes.
                                    </div>
                                ) : (
                                    customerResults.map((customer) => (
                                        <CustomerSearchItem
                                            key={customer.id}
                                            customer={customer}
                                            selected={field.value === customer.id}
                                            onSelect={(customer) =>
                                                field.onChange(customer.id)
                                            }
                                        />
                                    ))
                                )}
                            </div>

                            {fieldState.error && (
                                <p className="mt-1 text-sm text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
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
                        const ok = await trigger?.([ "customer_id", "currency_id"]);
                        if (ok) router.push("/sales/sale/add/payments");
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
