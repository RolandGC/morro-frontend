import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { useSerieStore } from "../store/serie.store";
import { SerieForm, serieSchema } from "../validators/serieSchema";
import { serieService } from "../services/serie.service";
import { User } from "../../user/types/user.types";
import { userService } from "../../user/services/user.service";
import { series_type } from "@/types/types";
import { getSelectedCompanyId } from "@/modules/reports/utils/company";

interface SerieFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const environmentOptions = [
    { id: "beta", name: "Beta" },
    { id: "produccion", name: "Producción" },
];

const typeOptions = [
    { id: "1", name: "Nota de Pedido", value: series_type.order_note },
    { id: "2", name: "Boleta General", value: series_type.boleta_general },
    { id: "3", name: "Boleta ZOFRA", value: series_type.boleta_zofra },
    { id: "4", name: "Factura General", value: series_type.factura_general },
    { id: "5", name: "Factura ZOFRA", value: series_type.factura_zofra },
];

export default function SerieFormModal({ onSuccess, fetchData }: SerieFormProps) {
    const { isEditing, serie, open, close, serie_id } = useSerieStore();
    const defaultValues = serie;
    const { notify: showToast } = useToast();
    const [data, setData] = useState<User[]>([]);

    const { register, handleSubmit,
        control, reset: resetForm,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SerieForm>({
        resolver: zodResolver(serieSchema),
        defaultValues: serie,
    });


    useEffect(() => {
        if (isEditing && serie) {
            resetForm({
                user_id: serie.user_id ?? "",
                series: serie.series ?? "",
                type: serie.type ?? "",
                next_number: serie.next_number ?? 0,
                environment: serie.environment ?? "beta",
                create_in_other_environment: false,
            });
        } else {
            resetForm(defaultValues);
        }
    }, [serie, isEditing, resetForm]);

    const selectedEnvironment = watch("environment");
    const otherEnvironmentLabel =
        selectedEnvironment === "beta" ? "Producción" : "Beta";

    const fetchUsers = async () => {

        try {

            const companyId = getSelectedCompanyId();
            const response = await userService.getAll({
                is_active: true,
                ...(companyId ? { company_id: companyId } : {}),
            });
            if (response.status === 200) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [])

    const onSubmit = async (serie: SerieForm) => {
        try {
            const companyId = getSelectedCompanyId();
            const payload: SerieForm = {
                ...serie,
                ...(companyId ? { company_id: companyId } : {}),
            };

            let response;
            if (isEditing && serie_id) {
                response = await serieService.update(serie_id, payload);
            } else {
                response = await serieService.create(payload);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Serie actualizado correctamente" : "Serie creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            const response = error as {
                response?: { data?: { message?: string | string[] } };
            };
            const message = response.response?.data?.message;
            showToast(
                Array.isArray(message)
                    ? message.join(", ")
                    : message || "Error al guardar la serie",
                "error"
            );
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar serie" : "Crear serie"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <p className="text-xs text-muted-foreground">
                        La serie se crea en el ambiente seleccionado. Si lo necesitas, puedes replicarla al otro ambiente.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="series"
                                label="Número de Serie"
                                register={register}
                                error={errors.series}
                            />
                            <Controller
                                name="user_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Usuario"
                                        value={field.value}
                                        options={data.map((user) => ({
                                            id: user.id,
                                            name: user.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.user_id}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="next_number"
                                label="Inicio"
                                register={register}
                                error={errors.next_number}
                                registerOptions={{
                                    valueAsNumber: true,
                                }}
                            />
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Tipo de comprobante"
                                        value={
                                            typeOptions.find(
                                                (option) => option.value === field.value
                                            )?.id ?? ""
                                        }
                                        options={typeOptions}
                                        onSelect={(id) => {
                                            const selected = typeOptions.find(
                                                (option) => option.id === id
                                            );

                                            field.onChange(selected?.value ?? "");
                                        }}
                                        error={errors.type}
                                    />
                                )}
                            />

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="environment"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Ambiente"
                                        value={field.value}
                                        options={environmentOptions}
                                        onSelect={field.onChange}
                                        error={errors.environment}
                                        disabled={isEditing}
                                    />
                                )}
                            />

                            {!isEditing && (
                                <Controller
                                    name="create_in_other_environment"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex min-h-9 items-center gap-2 self-end text-sm">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) =>
                                                    field.onChange(checked === true)
                                                }
                                            />
                                            Crear también en {otherEnvironmentLabel}
                                        </label>
                                    )}
                                />
                            )}
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
                                        ? "Actualizar Serie"
                                        : "Guardar Serie"}
                            </Button>
                        </div>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}