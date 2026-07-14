import { create } from "zustand";
import { Category } from "../types/category.types";
import { CategoryForm } from "../validators/categorySchema";

const initialState: CategoryForm = {
    name: "",
    description: "",
    parent_id: null,
};

interface CategoryStore {
    open: boolean;
    isEditing: boolean;

    category: CategoryForm;
    category_id: string | null;

    categories: Category[];

    openCreate: () => void;
    openEdit: (
        category: CategoryForm,
        category_id: string | null
    ) => void;
    close: () => void;

    updateField: <K extends keyof CategoryForm>(
        field: K,
        value: CategoryForm[K]
    ) => void;

    setCategories: (categories: Category[]) => void;

    reset: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
    open: false,
    isEditing: false,

    category: initialState,
    category_id: null,

    categories: [],

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            category: initialState,
            category_id: null,
        }),

    openEdit: (category, category_id) =>
        set({
            open: true,
            isEditing: true,
            category,
            category_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            category: {
                ...state.category,
                [field]: value,
            },
        })),

    setCategories: (categories) =>
        set({
            categories,
        }),

    reset: () =>
        set({
            category: initialState,
            isEditing: false,
            category_id: null,
        }),
}));