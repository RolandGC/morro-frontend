import { create } from "zustand";
import { Serie } from "../types/serie.types";
import { SerieForm } from "../validators/serieSchema";
import { series_type } from "@/types/types";

const initialState: SerieForm = {
    user_id: "",
    series: "",
    type: series_type.general,
    next_number: 1,
};

interface SerieStore {
    open: boolean;
    isEditing: boolean;
    serie: SerieForm;
    serie_id: string | null;
    series: Serie[];

    openCreate: () => void;
    openEdit: (
        serie: SerieForm,
        series_id: string | null
    ) => void;

    setSeries: (series: Serie[]) => void;

    close: () => void;

    updateField: <K extends keyof SerieForm>(
        field: K,
        value: SerieForm[K]
    ) => void;

    reset: () => void;
}

export const useSerieStore = create<SerieStore>((set) => ({
    open: false,
    isEditing: false,
    serie: initialState,
    serie_id: null,
    series: [],

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            serie: initialState,
            serie_id: null,
        }),

    openEdit: (serie, serie_id) =>
        set({
            open: true,
            isEditing: true,
            serie,
            serie_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    setSeries: (series) =>
        set({
            series,
        }),

    updateField: (field, value) =>
        set((state) => ({
            serie: {
                ...state.serie,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            serie: initialState,
            serie_id: null,
            isEditing: false,
        }),
}));