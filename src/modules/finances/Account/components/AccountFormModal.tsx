import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { companyService } from "@/modules/core/companies/services/company.service";
import { useAccountStore } from "../store/account.store";
import { Account } from "../types/account.types";
import { AccountForm, accountSchema } from "../validators/accountSchema";
import { Company } from "@/modules/core/companies/types/company.type";
import { accountService } from "../services/account.service";
import { payment_account_type } from "@/types/types";
import { currencyService } from "../../currency/services/currency.service";
import { Currency } from "../../currency/types/currency.types";

interface AccountFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const optionsAccounts = [
    { id: "1", name: "Efectivo", value: payment_account_type.cash },
    { id: "2", name: "Tarjeta de crédito", value: payment_account_type.credit_card },
    { id: "3", name: "Tarjeta de débito", value: payment_account_type.debit_card },
    { id: "4", name: "Plin", value: payment_account_type.plin },
    { id: "5", name: "Transferencia", value: payment_account_type.transfer },
    { id: "6", name: "Yape", value: payment_account_type.yape },
];

export default function AccountFormModal({ onSuccess, fetchData }: AccountFormProps) {
    const { isEditing, account, open, close, account_id } = useAccountStore();
    const defaultValues = account;
    const { notify: showToast } = useToast();
    const [data, setData] = useState<Company[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<AccountForm>({
        resolver: zodResolver(accountSchema),
        defaultValues: account,
    });


    useEffect(() => {
        if (isEditing && account) {
            resetForm({
                company_id: account.company_id ?? "",
                name: account.name ?? "",
                bank_name: account.bank_name ?? "",
                type: account.type ?? "",
                currency_id: account.currency_id ?? 0,
                account_number: account.account_number ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [account, isEditing, resetForm]);

    const fetchServices = async () => {
        try {
            const [companyResponse, currencyResponse] = await Promise.all([
                companyService.getAllCompanies({ is_active: true }),
                currencyService.getAll({ is_active: true }),
            ]);

            if (companyResponse.status === 200) {
                setData(companyResponse.data.data);
            }

            if (currencyResponse.status === 200) {
                setCurrencies(currencyResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);


    const onSubmit = async (account: AccountForm) => {
        try {
            let response;
            if (isEditing && account_id) {
                response = await accountService.update(account_id, account);
            } else {
                response = await accountService.create(account);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Cuenta actualizado correctamente" : "Cuenta creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la Cuenta", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar cuenta" : "Crear cuenta"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit,(errors) => {
                        console.log("❌ ERRORES ZOD:", errors);
        })} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="company_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Empresa"
                                        value={field.value}
                                        options={data.map((company) => ({
                                            id: company.id,
                                            name: company.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.company_id}
                                    />
                                )}
                            />
                            <InputText
                                name="name"
                                label="Nombre"
                                register={register}
                                error={errors.name}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="account_number"
                                label="Número de cuenta"
                                register={register}
                                error={errors.account_number}
                            />
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => {
                                    const selectedOption = optionsAccounts.find(
                                        (option) => option.value === field.value
                                    );

                                    return (
                                        <SimpleSelector
                                            label="Tipo"
                                            value={selectedOption?.id ?? optionsAccounts[0].id}
                                            options={optionsAccounts}
                                            onSelect={(id) => {
                                                const selected = optionsAccounts.find(
                                                    (option) => option.id === id
                                                );

                                                if (selected) {
                                                    field.onChange(selected.value);
                                                }
                                            }}
                                        />
                                    );
                                }}
                            />


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="bank_name"
                                label="Nombre del banco"
                                register={register}
                                error={errors.bank_name}
                            />
                            <Controller
                                name="currency_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Moneda"
                                        value={field.value}
                                        options={currencies.map((cuerrency) => ({
                                            id: cuerrency.id,
                                            name: cuerrency.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.currency_id}
                                    />
                                )}
                            />
                            
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar cuenta"
                                    : "Guardar cuenta"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}