"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, Controller } from "react-hook-form";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { saleService } from "@/modules/sales/sale/services/sale.service";
import { showToast } from "@/hooks/useToast";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { sale_type } from "@/types/types";

export default function PagoStep() {
    const router = useRouter();
    const { trigger, handleSubmit, reset, control } = useFormContext();
    const { isEditing, sale_id } = useSaleStore();

    const saleTypes = [
        { id: "1", name: "Efectivo", value: sale_type.cash },
        { id: "2", name: "Crédito", value: sale_type.credit },
    ];

    const onSubmit = async (data: any) => {
        try {
            const response = isEditing && sale_id ? await saleService.update(sale_id, data) : await saleService.create(data);

            if (response.status === 201 || response.status === 200) {
                showToast(isEditing ? "Venta actualizada correctamente" : "Venta creada correctamente", "success");
                reset();
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
                            value={saleTypes.find((r) => r.value === field.value)?.id}
                            options={saleTypes}
                            onSelect={(id) => {
                                const selected = saleTypes.find((r) => r.id === id);
                                field.onChange(selected?.value ?? sale_type.cash);
                            }}
                        />
                    )}
                />

                <InputText name="exchange_rate" label="Tipo de cambio" register={control.register ?? (() => {})} />
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
