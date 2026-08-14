"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFormContext, Controller } from "react-hook-form";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { saleService } from "@/modules/sales/sale/services/sale.service";
import { showToast } from "@/hooks/useToast";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { sale_type } from "@/types/types";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";

export default function PagoStep() {
    const router = useRouter();
    const { trigger, handleSubmit, control, register } = useFormContext<SaleForm>();

    const saleTypes = [
        { id: sale_type.cash, name: "Efectivo" },
        { id: sale_type.credit, name: "Crédito" },
    ];

    const onSubmit = async (data: SaleForm) => {
        const { isEditing, sale_id } = useSaleStore.getState();

        try {
            const response = isEditing && sale_id
                ? await saleService.update(sale_id, data)
                : await saleService.create(data);

            if (response.status === 201 || response.status === 200) {
                showToast(isEditing ? "Venta actualizada correctamente" : "Venta creada correctamente", "success");
                useSaleStore.getState().startNew();
                router.push("/sales/sale");
            }
        } catch (error) {
            showToast("Error al guardar la venta", "error");
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto py-4 px-4">
            <h2 className="text-lg font-medium mb-4">Pago</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="sale_type"
                    control={control}
                    render={({ field }) => (
                        <SimpleSelector
                            label="Tipo de venta"
                            value={field.value}
                            options={saleTypes}
                            onSelect={field.onChange}
                        />
                    )}
                />

                <InputText
                    name="exchange_rate"
                    label="Tipo de cambio"
                    register={register}
                    registerOptions={{ valueAsNumber: true }}
                />
            </div>

            <div className="mt-6 flex justify-between">
                <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-sm"
                    onClick={() => router.push("/sales/sale/add/cliente")}
                >
                    Anterior
                </button>

                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded-md bg-muted px-3 py-1 text-sm text-white"
                        onClick={async () => {
                            const ok = await trigger?.(["sale_type", "exchange_rate"]);
                            if (ok) {
                                handleSubmit(onSubmit)();
                            }
                        }}
                    >
                        Guardar venta
                    </button>
                </div>
            </div>
        </div>
    );
}
