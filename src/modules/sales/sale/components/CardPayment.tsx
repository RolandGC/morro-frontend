"use client";

import { Controller, Control, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { Account } from "@/modules/finances/Account/types/account.types";

interface CardPaymentProps {
    index: number;
    control: Control<SaleForm>;
    register: UseFormRegister<SaleForm>;
    currencies: Currency[];
    accounts: Account[];
    onRemove: (index: number) => void;
}

export default function CardPayment({
    index,
    control,
    register,
    currencies,
    accounts,
    onRemove,
}: CardPaymentProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-background">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold">
                            Pago #{index + 1}
                        </h4>

                        <p className="text-xs text-muted-foreground">
                            Método de pago
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRemove(index)}
                    className="text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                >
                    Eliminar
                </Button>
            </div>

            {/* FORMULARIO */}
            <div className="p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* CUENTA */}
                    <Controller
                        name={`payments.${index}.payment_account_id`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <SimpleSelector
                                label="Forma de pago"
                                value={field.value}
                                options={accounts.map((account) => ({
                                    id: account.id,
                                    name: account.name,
                                }))}
                                onSelect={field.onChange}
                                error={fieldState.error}
                            />
                        )}
                    />

                    {/* MONEDA */}
                    <Controller
                        name={`payments.${index}.currency_id`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <SimpleSelector
                                label="Moneda"
                                value={field.value}
                                options={currencies.map((currency) => ({
                                    id: currency.id,
                                    name: currency.name,
                                }))}
                                onSelect={field.onChange}
                                error={fieldState.error}
                            />
                        )}
                    />

                    {/* MONTO */}
                    <InputText
                        name={`payments.${index}.amount`}
                        label="Monto"
                        register={register}
                        registerOptions={{
                            valueAsNumber: true,
                        }}
                    />

                    {/* TIPO DE CAMBIO */}
                    <InputText
                        name={`payments.${index}.exchange_rate`}
                        label="Tipo de cambio"
                        register={register}
                        registerOptions={{
                            valueAsNumber: true,
                        }}
                    />

                    {/* NOTAS */}
                    <div className="sm:col-span-2">
                        <InputText
                            name={`payments.${index}.notes`}
                            label="Notas"
                            register={register}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
