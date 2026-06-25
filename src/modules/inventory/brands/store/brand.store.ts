import { create } from 'zustand';
import { Brand, CreateBrand } from '../types/brand.types';


type Mode = 'create' | 'edit';

interface BrandState {
    mode: Mode;
    brand: CreateBrand;
    editingId: string | null;
    brands: Brand[]; // Lista global de brands

    setMode: (mode: Mode) => void;

    setBrand: (data: Partial<CreateBrand>) => void;

    loadBrandToEdit: (brand: Brand) => void;

    setBrands: (brands: Brand[]) => void; // Método para guardar la lista

    reset: () => void;
}

const initialState: CreateBrand = {
    name: '',
};

export const useBrandStore = create<BrandState>((set) => ({
    mode: 'create',
    brand: initialState,
    editingId: null,
    brands: [],

    setMode: (mode) => set({ mode }),

    setBrand: (data) =>
        set((state) => ({
            brand: { ...state.brand, ...data },
        })),

    loadBrandToEdit: (brand) =>
        set({
            mode: 'edit',
            editingId: brand.id,
            brand: {
                name: brand.name,
            },
        }),

    setBrands: (brands) => set({ brands }),

    reset: () =>
        set({
            mode: 'create',
            brand: initialState,
            editingId: null,
        }),
}));