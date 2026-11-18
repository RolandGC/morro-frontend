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
            <div className="mx-auto w-full max-w-[1600px] px-4 py-2 lg:px-6">
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
                        <span className="hidden sm:inline">
                            Abrir pantalla cliente
                        </span>
                        <span className="sr-only sm:hidden">
                            Abrir pantalla cliente
                        </span>
                    </Button>
                </div>

                <div className="mt-4">
                    {children}
                </div>
            </div>
        </FormProvider>
    );
}
