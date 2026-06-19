import { create } from "zustand";
import { regime } from "@/types/types";
import { ProductSend } from "../types/produc.type";

        // export interface ProductFormState {
        //     id?: string;
        //     name: string;
        //     model: string;
        //     unit_base: string;
        //     regime: regime;
        //     has_igv: boolean;
        //     track_stock: boolean;
        //     category_id: string;
        //     brand_id: string;
        // }

const initialState: ProductSend = {
    name: "",
    model: "",
    unit_base: "",
    regime: regime.general,
    has_igv: true,
    track_stock: true,
    category_id: "",
    brand_id: "",
};

interface ProductStore {
    open: boolean;
    isEditing: boolean;
    product: ProductSend;

    openCreate: () => void;
    openEdit: (product: ProductSend) => void;
    close: () => void;

    updateField: <K extends keyof ProductSend>(
        field: K,
        value: ProductSend[K]
    ) => void;

    reset: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
    open: false,
    isEditing: false,
    product: initialState,

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            product: initialState,
        }),

    openEdit: (product) =>
        set({
            open: true,
            isEditing: true,
            product,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            product: {
                ...state.product,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            product: initialState,
            isEditing: false,
        }),
}));