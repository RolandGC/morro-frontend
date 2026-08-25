"use client";

import { StepIndicator } from "@/components/StepIndicador";
import { FormProvider } from "react-hook-form";
import { useSaleForm } from "@/modules/sales/sale/hooks/useSaleForm";

export default function SaleNewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const form = useSaleForm();

    const steps = [
        {
            id: "productos",
            label: "Productos",
            href: "/sales/sale/add",
        },
        {
            id: "cliente",
            label: "Cliente",
            href: "/sales/sale/add/customer",
        },
        {
            id: "pago",
            label: "Pago",
            href: "/sales/sale/add/payments",
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
