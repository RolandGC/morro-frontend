"use client";

import { StepIndicator } from "@/components/StepIndicador";
import { FormProvider } from "react-hook-form";
import { Monitor } from "lucide-react";
import { useSaleForm } from "@/modules/sales/sale/hooks/useSaleForm";
import { Button } from "@/components/ui/button";
import { openCustomerDisplay } from "@/modules/sales/sale/services/customerDisplay.service";

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
        /* {
            id: "cliente",
            label: "Cliente",
            href: "/sales/sale/add/customer",
        }, */
        {
            id: "pago",
            label: "Pago",
            href: "/sales/sale/add/payments",
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <StepIndicator steps={steps} />
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                            void openCustomerDisplay({ force: true });
                        }}
                    >
                        <Monitor />
                        Abrir pantalla cliente
                    </Button>
                </div>

                <div className="mt-4">
                    {children}
                </div>
            </div>
        </FormProvider>
    );
}
