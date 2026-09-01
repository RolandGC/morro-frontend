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
import { Company } from "@/modules/core/companies/types/company.type";
import Swal from "sweetalert2";

export default function PagoStep() {
    const router = useRouter();
    const { trigger, handleSubmit, control, register } = useFormContext<SaleForm>();

    const saleTypes = [
        { id: sale_type.cash, name: "Efectivo" },
        { id: sale_type.credit, name: "Crédito" },
    ];

    const onSubmit = async (data: SaleForm) => {
        const { isEditing, sale_id } = useSaleStore.getState();

        const storedCompany = localStorage.getItem("selected_company");

        if (!storedCompany) {
            showToast("No existe empresa seleccionada", "error");
            return;
        }

        const parsedCompany: Company = JSON.parse(storedCompany);

        try {
            const response = await saleService.create({
                ...data,
                company_id: parsedCompany.id,
                warehouse_id: parsedCompany.warehouse?.id,
            });

            if (response.status === 201 || response.status === 200) {
                const notaPedidoBase64 = response.data.notaPedidoBase64;

                const result = await Swal.fire({
                    icon: "success",
                    title: isEditing
                        ? "Venta actualizada correctamente"
                        : "Venta creada correctamente",
                    text: notaPedidoBase64
                        ? "¿Deseas imprimir el comprobante?"
                        : "La venta fue registrada correctamente.",
                    showCancelButton: !!notaPedidoBase64,
                    confirmButtonText: notaPedidoBase64
                        ? "Imprimir comprobante"
                        : "Aceptar",
                    cancelButtonText: "Cerrar",
                    confirmButtonColor: "#2563eb",
                    cancelButtonColor: "#6b7280",
                });

                if (result.isConfirmed && notaPedidoBase64) {
                    openPdf(notaPedidoBase64);
                }

                useSaleStore.getState().startNew();

                router.push("/sales/sale");
            }
        } catch (error) {
            showToast("Error al guardar la venta", "error");
            console.error(error);
        }
    };


    const openPdf = (base64: string) => {
        try {
            const cleanBase64 = base64.includes(",")
                ? base64.split(",")[1]
                : base64;

            const byteCharacters = atob(cleanBase64);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                const slice = byteCharacters.slice(offset, offset + 1024);

                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                byteArrays.push(new Uint8Array(byteNumbers));
            }

            const blob = new Blob(byteArrays, {
                type: "application/pdf",
            });

            const pdfUrl = URL.createObjectURL(blob);

            window.open(pdfUrl, "_blank");
        } catch (error) {
            console.error("Error abriendo comprobante:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo abrir el comprobante.",
            });
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
