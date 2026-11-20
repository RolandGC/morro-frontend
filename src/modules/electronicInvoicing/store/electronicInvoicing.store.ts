import { create } from "zustand";

interface ElectronicInvoicingStore {
  detailId: string | null;
  openDetail: (id: string) => void;
  close: () => void;
}

export const useElectronicInvoicingStore = create<ElectronicInvoicingStore>(
  (set) => ({
    detailId: null,
    openDetail: (id) => set({ detailId: id }),
    close: () => set({ detailId: null }),
  })
);
