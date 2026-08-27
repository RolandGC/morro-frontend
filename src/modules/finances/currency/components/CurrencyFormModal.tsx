import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { useCurrencyStore } from "../store/currency.store";
import { CurrencyForm, currencySchema } from "../validators/currencySchema";
import { currencyService } from "../services/currency.service";

interface CurrencyFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function CurrencyFormModal({ onSuccess, fetchData }: CurrencyFormProps) {
    const { isEditing, currency, open, close, currency_id } = useCurrencyStore();
    const defaultValues = currency;
    const { notify: showToast } = useToast();

    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<CurrencyForm>({
        resolver: zodResolver(currencySchema),
        defaultValues: currency,
    });


    useEffect(() => {
        if (isEditing && currency) {
            resetForm({
                name: currency.name ?? "",
                code: currency.code ?? "",
                symbol: currency.symbol ?? "",
                is_base: currency.is_base ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [currency, isEditing, resetForm]);

    const onSubmit = async (currency: CurrencyForm) => {
        try {
            let response;
            if (isEditing && currency_id) {
                response = await currencyService.update(currency_id, currency);
            } else {
                response = await currencyService.create(currency);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Moneda actualizado correctamente" : "Moneda creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la Moneda", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar moneda" : "Crear moneda"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="name"
                                label="Nombre"
                                register={register}
                                error={errors.name}
                            />
                            <InputText
                                name="code"
                                label="Código"
                                register={register}
                                error={errors.code}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="symbol"
                                label="Símbolo"
                                register={register}
                                error={errors.symbol}
                            />
                            <Controller
                                name="is_base"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Base"
                                        value={
                                            field.value
                                                ? booleanOptions[0].id
                                                : booleanOptions[1].id
                                        }
                                        options={booleanOptions}
                                        onSelect={(id) => {
                                            const selected = booleanOptions.find(
                                                (option) => option.id === id
                                            );
                                            field.onChange(selected?.value ?? true);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={close}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Guardando..."
                                    : isEditing
                                        ? "Actualizar Moneda"
                                        : "Guardar Moneda"}
                            </Button>
                        </div>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}