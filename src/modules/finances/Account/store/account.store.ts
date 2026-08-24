import { create } from "zustand";
import { Account } from "../types/account.types";
import { AccountForm } from "../validators/accountSchema";

const initialState: AccountForm = {
    company_id: "",
    name: "",
    type: "cash",
    account_number: "",
    bank_name: "",
    currency_id: "",
    is_active: true,
};

interface AccountStore {
    open: boolean;
    isEditing: boolean;
    account: AccountForm;
    account_id: string | null;
    accounts: Account[];

    openCreate: () => void;
    openEdit: (
        account: AccountForm,
        account_id: string | null
    ) => void;

    setAccounts: (accounts: Account[]) => void;

    close: () => void;

    updateField: <K extends keyof AccountForm>(
        field: K,
        value: AccountForm[K]
    ) => void;

    reset: () => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
    open: false,
    isEditing: false,
    account: initialState,
    account_id: null,
    accounts: [],

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            account: initialState,
            account_id: null,
        }),

    openEdit: (account, account_id) =>
        set({
            open: true,
            isEditing: true,
            account,
            account_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    setAccounts: (accounts) =>
        set({
            accounts,
        }),

    updateField: (field, value) =>
        set((state) => ({
            account: {
                ...state.account,
                [field]: value,
            },
        })),

    reset: () =>
        set({
            account: initialState,
            account_id: null,
            isEditing: false,
        }),
}));
