import { create } from "zustand";
import { CashboxDetailForm, CashboxForm } from "../validators/cashboxSchema";


const initialState: CashboxForm = {
    warehouse_id: "",
    company_id: "",
    notes: "",
    details: [
        {
            payment_account_id: "",
            expected_amount: 0,
        },
    ],
};

interface CashboxStore {
    open: boolean;
    isEditing: boolean;
    cashbox: CashboxForm;
    cashbox_id: string | null;

    openCreate: () => void;

    openEdit: (
        cashbox: CashboxForm,
        cashbox_id: string | null
    ) => void;

    close: () => void;

    updateField: <K extends keyof CashboxForm>(
        field: K,
        value: CashboxForm[K]
    ) => void;

    updateDetail: (
        index: number,
        field: keyof CashboxDetailForm,
        value: string | number
    ) => void;

    addDetail: () => void;

    removeDetail: (index: number) => void;

    reset: () => void;
}

export const useCashboxStore = create<CashboxStore>((set) => ({
    open: false,
    isEditing: false,
    cashbox: initialState,
    cashbox_id: null,

    openCreate: () =>
        set({
            open: true,
            isEditing: false,
            cashbox: initialState,
            cashbox_id: null,
        }),

    openEdit: (cashbox, cashbox_id) =>
        set({
            open: true,
            isEditing: true,
            cashbox,
            cashbox_id,
        }),

    close: () =>
        set({
            open: false,
        }),

    updateField: (field, value) =>
        set((state) => ({
            cashbox: {
                ...state.cashbox,
                [field]: value,
            },
        })),

    updateDetail: (index, field, value) =>
        set((state) => ({
            cashbox: {
                ...state.cashbox,
                details: state.cashbox.details.map((detail, i) =>
                    i === index
                        ? {
                            ...detail,
                            [field]: value,
                        }
                        : detail
                ),
            },
        })),

    addDetail: () =>
        set((state) => ({
            cashbox: {
                ...state.cashbox,
                details: [
                    ...state.cashbox.details,
                    {
                        payment_account_id: "",
                        expected_amount: 0,
                    },
                ],
            },
        })),

    removeDetail: (index) =>
        set((state) => ({
            cashbox: {
                ...state.cashbox,
                details: state.cashbox.details.filter((_, i) => i !== index),
            },
        })),

    reset: () =>
        set({
            cashbox: initialState,
            cashbox_id: null,
            isEditing: false,
        }),
}));