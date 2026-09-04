import { create } from "zustand";

interface ReceiptState {
    open: boolean;
    saleId: string | null;

    openCreate: (saleId: string) => void;
    close: () => void;
}

export const useReceiptStore = create<ReceiptState>((set) => ({
    open: false,
    saleId: null,

    openCreate: (saleId) =>
        set({
            open: true,
            saleId,
        }),

    close: () =>
        set({
            open: false,
            saleId: null,
        }),
}));
