import { create } from "zustand";
import { UserForm } from "../validators/userShema";

const initialState: UserForm = {
    name: "",
    last_name: "",
    email: "",
    doc_number: "",
    is_superadmin: false,
    password: "",
    company_ids: [],
};

interface UserStore {
    open: boolean;
    isEditing: boolean;
    user: UserForm;
    user_id: string | null;

    openCreate: () => void;
    openEdit: (user: UserForm, user_id: string | null) => void;
    close: () => void;

    updateField: <K extends keyof UserForm>(
        field: K,
        value: UserForm[K]
    ) => void;

    reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    open: false,
    isEditing: false,
    user: initialState,
    user_id: null,

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            user: initialState,
            user_id: null,
        }),

    openEdit: (user, user_id) =>
        set({
            open: true,
            isEditing: true,
            user,
            user_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            user: {
                ...state.user,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            user: initialState,
            isEditing: false,
            user_id: null,
        }),
}));