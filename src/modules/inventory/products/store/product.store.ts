import { create } from "zustand";
import { regime } from "@/types/types";
import { FormProductDto } from "../validators/productShema";

const initialState: FormProductDto = {
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
    product: FormProductDto;
    product_id: string | null;

    openCreate: () => void;
    openEdit: (product: FormProductDto, product_id: string | null) => void;
    close: () => void;

    updateField: <K extends keyof FormProductDto>(
        field: K,
        value: FormProductDto[K]
    ) => void;

    reset: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
    open: false,
    isEditing: false,
    product: initialState,
    product_id: null,
    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            product: initialState,
            product_id: null,
        }),

    openEdit: (product, product_id) =>
        set({
            open: true,
            isEditing: true,
            product,
            product_id,
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
            product_id: null,
        }),
}));