"use client";

import { StepIndicator } from "@/components/StepIndicador";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SaleForm,
    saleSchema,
} from "@/modules/sales/sale/validators/saleSchema";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { sale_type } from "@/types/types";
import { useEffect, useRef } from "react";

export default function SaleNewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const updateField = useSaleStore((s) => s.updateField);
    const setItems = useSaleStore((s) => s.setItems);
    const rehydrated = useSaleStore((s) => s.rehydrated);

    const initialized = useRef(false);

    const defaultValues: SaleForm = {
        company_id: "",
        warehouse_id: "",
        customer_id: "",
        currency_id: "",
        exchange_rate: 1,
        sale_type: sale_type.cash,
        items: [],
    };

    const form = useForm<SaleForm>({
        resolver: zodResolver(saleSchema),
        defaultValues,
    });

    /**
     * 1. Cuando Zustand termina de hidratarse,
     *    cargamos los datos persistidos en RHF.
     */
    useEffect(() => {
        if (!rehydrated) return;

        const sale = useSaleStore.getState().sale;

        form.reset({
            ...defaultValues,
            ...sale,
            items: sale?.items ?? [],
        });

        initialized.current = true;
    }, [rehydrated]);

    /**
     * 2. Después de inicializar el formulario,
     *    sincronizamos RHF -> Zustand.
     */
    useEffect(() => {
        if (!rehydrated) return;
        if (!initialized.current) return;

        const subscription = form.watch((_, info) => {
            const name = info?.name;

            if (!name) return;

            if (name.startsWith("items")) {
                const items = form.getValues("items");

                setItems(items ?? []);
            } else {
                const value = form.getValues(name as keyof SaleForm);

                updateField(name as keyof SaleForm, value);
            }
        });

        return () => subscription.unsubscribe();
    }, [
        rehydrated,
        form,
        updateField,
        setItems,
    ]);

    const steps = [
        {
            id: "productos",
            label: "Productos",
            href: "/sales/sale/add",
        },
        {
            id: "cliente",
            label: "Cliente",
            href: "/sales/sale/add/cliente",
        },
        {
            id: "pago",
            label: "Pago",
            href: "/sales/sale/add/pago",
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="container mx-auto px-4 py-6">
                <StepIndicator steps={steps} />

                <div className="mt-8">
                    {children}
                </div>
            </div>
        </FormProvider>
    );
}