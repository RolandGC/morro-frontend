import { create } from "zustand";
import { RoleForm } from "../validators/rolesSchema";

const initialState: RoleForm = {
    name: "",
    display_name: "",
    description: "",
};

interface RoleStore {
    open: boolean;
    isEditing: boolean;
    role: RoleForm;
    role_id: string | null;

    openCreate: () => void;
    openEdit: (role: RoleForm, role_id: string | null) => void;
    close: () => void;

    updateField: <K extends keyof RoleForm>(
        field: K,
        value: RoleForm[K]
    ) => void;

    reset: () => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
    open: false,
    isEditing: false,
    role: initialState,
    role_id: null,

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            role: initialState,
            role_id: null,
        }),

    openEdit: (role, role_id) =>
        set({
            open: true,
            isEditing: true,
            role,
            role_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            role: {
                ...state.role,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            role: initialState,
            isEditing: false,
            role_id: null,
        }),
}));