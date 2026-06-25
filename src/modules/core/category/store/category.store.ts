import { create } from 'zustand';
import { Category, CreateCategory } from '../types/category.types';


type Mode = 'create' | 'edit';

interface CategoryState {
    mode: Mode;
    category: CreateCategory; // usamos esta para form (sirve para crear y editar)
    editingId: string | null;
    categories: Category[]; // Lista global de categories

    setMode: (mode: Mode) => void;

    setCategory: (data: Partial<CreateCategory>) => void;

    loadCategoryToEdit: (category: Category) => void;

    setCategories: (categories: Category[]) => void; // Método para guardar la lista

    reset: () => void;
}

const initialState: CreateCategory = {
    name: '',
    description: '',
    parent_id: null,
};

export const useCategoryStore = create<CategoryState>((set) => ({
    mode: 'create',
    category: initialState,
    editingId: null,
    categories: [],

    setMode: (mode) => set({ mode }),

    setCategory: (data) =>
        set((state) => ({
            category: { ...state.category, ...data },
        })),

    loadCategoryToEdit: (category) =>
        set({
            mode: 'edit',
            editingId: category.id,
            category: {
                name: category.name,
                description: category.description,
                parent_id: category.parent_id,
            },
        }),

    setCategories: (categories) => set({ categories }),

    reset: () =>
        set({
            mode: 'create',
            category: initialState,
            editingId: null,
        }),
}));