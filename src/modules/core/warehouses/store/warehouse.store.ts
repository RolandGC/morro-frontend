import { create } from "zustand";
import { WarehouseForm } from "../validators/warehouseSchema";
import { warehouse_type } from "@/types/types";

const initialState: WarehouseForm = {
    name: "",
    type: warehouse_type.warehouse,
    company_id: "",
    address: "",
    is_active: true,
};

interface WarehouseStore {
    open: boolean;
    isEditing: boolean;
    warehouse: WarehouseForm;
    warehouse_id: string | null;

    openCreate: () => void;
    openEdit: (
        warehouse: WarehouseForm,
        warehouse_id: string | null
    ) => void;
    close: () => void;

    updateField: <K extends keyof WarehouseForm>(
        field: K,
        value: WarehouseForm[K]
    ) => void;

    reset: () => void;
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
    open: false,
    isEditing: false,
    warehouse: initialState,
    warehouse_id: null,

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            warehouse: initialState,
            warehouse_id: null,
        }),

    openEdit: (warehouse, warehouse_id) =>
        set({
            open: true,
            isEditing: true,
            warehouse,
            warehouse_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            warehouse: {
                ...state.warehouse,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            warehouse: initialState,
            isEditing: false,
            warehouse_id: null,
        }),
}));