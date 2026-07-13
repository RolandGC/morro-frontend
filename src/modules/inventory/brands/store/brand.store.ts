import { create } from "zustand";
import { Brand } from "../types/brand.types";
import { BrandForm } from "../validators/brandSchema";

const initialState: BrandForm = {
    name: "",
    is_active: true,
};

interface BrandStore {
    open: boolean;
    isEditing: boolean;

    brand: BrandForm;
    brand_id: string | null;

    brands: Brand[];

    openCreate: () => void;
    openEdit: (
        brand: BrandForm,
        brand_id: string | null
    ) => void;
    close: () => void;

    updateField: <K extends keyof BrandForm>(
        field: K,
        value: BrandForm[K]
    ) => void;

    setBrands: (brands: Brand[]) => void;

    reset: () => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
    open: false,
    isEditing: false,

    brand: initialState,
    brand_id: null,

    brands: [],

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            brand: initialState,
            brand_id: null,
        }),

    openEdit: (brand, brand_id) =>
        set({
            open: true,
            isEditing: true,
            brand,
            brand_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            brand: {
                ...state.brand,
                [field]: value,
            },
        })),

    setBrands: (brands) =>
        set({
            brands,
        }),

    reset: () =>
        set({
            brand: initialState,
            isEditing: false,
            brand_id: null,
        }),
}));