import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { useSerieStore } from "../store/serie.store";
import { SerieForm, serieSchema } from "../validators/serieSchema";
import { serieService } from "../services/serie.service";
import { User } from "../../user/types/user.types";
import { userService } from "../../user/services/user.service";
import { series_type } from "@/types/types";

interface SerieFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const typeOptions = [
    { id: "1", name: "Nota de Pedido", value: series_type.order_note },
    { id: "2", name: "Régimen General", value: series_type.general },
    { id: "3", name: "Régimen Zofra", value: series_type.zofra },
];

export default function SerieFormModal({ onSuccess, fetchData }: SerieFormProps) {
    const { isEditing, serie, open, close, serie_id } = useSerieStore();
    const defaultValues = serie;
    const { notify: showToast } = useToast();
    const [data, setData] = useState<User[]>([]);

    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
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
            });
        } else {
            resetForm(defaultValues);
        }
    }, [serie, isEditing, resetForm]);

    const fetchUsers = async () => {

        try {

            const response = await userService.getAll({ is_active: true });
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
            let response;
            if (isEditing && serie_id) {
                response = await serieService.update(serie_id, serie);
            } else {
                response = await serieService.create(serie);
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
            showToast("Error al guardar la Serie", "error")
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
                                        label="Tipo"
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

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar Serie"
                                    : "Guardar Serie"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}