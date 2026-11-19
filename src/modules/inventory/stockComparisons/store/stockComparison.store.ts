import { create } from "zustand";

interface StockComparisonStore {
    createOpen: boolean;
    detailId: string | null;

    openCreate: () => void;
    openDetail: (id: string) => void;
    close: () => void;
}

export const useStockComparisonStore = create<StockComparisonStore>((set) => ({
    createOpen: false,
    detailId: null,

    openCreate: () => set({ createOpen: true, detailId: null }),
    openDetail: (id) => set({ detailId: id, createOpen: false }),
    close: () => set({ createOpen: false, detailId: null }),
}));
