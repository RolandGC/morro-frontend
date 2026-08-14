import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Sale, SaleItem } from "../types/sale.types";
import { SaleForm } from "../validators/saleSchema";
import { sale_type } from "@/types/types";

const initialState: SaleForm = {
  company_id: "",
  warehouse_id: "",
  customer_id: "",
  price_list_id: "",
  currency_id: "",
  exchange_rate: 1,
  sale_type: sale_type.cash,
  sale_date: "",
  items: [],
};

interface SaleStore {
  open: boolean;
  rehydrated?: boolean;
  isEditing: boolean;
  sale: SaleForm;
  sale_id: string | null;
  sales: Sale[];

  openCreate: () => void;
  openEdit: (
    sale: SaleForm,
    sale_id: string | null
  ) => void;
  close: () => void;
  reset: () => void;

  setSales: (sales: Sale[]) => void;

  updateField: <K extends keyof SaleForm>(
    field: K,
    value: SaleForm[K]
  ) => void;

  addItem: (item: SaleItem) => void;
  updateItem: (
    index: number,
    item: Partial<SaleItem>
  ) => void;
  removeItem: (index: number) => void;
  setItems: (items: SaleItem[]) => void;
}

export const useSaleStore = create<PersistedSaleStore>()(
  persist(
    (set) => ({
      rehydrated: false,
      open: false,
      isEditing: false,
      sale: initialState,
      sale_id: null,
      sales: [],

      openCreate: () =>
        set({
          open: true,
          isEditing: false,
          sale: initialState,
          sale_id: null,
        }),

      openEdit: (sale, sale_id) =>
        set({
          open: true,
          isEditing: true,
          sale,
          sale_id,
        }),

      close: () =>
        set({
          open: false,
        }),

      reset: () =>
        set({
          sale: initialState,
          sale_id: null,
          isEditing: false,
        }),

      setSales: (sales) =>
        set({
          sales,
        }),

      updateField: (field, value) =>
        set((state) => ({
          sale: {
            ...state.sale,
            [field]: value,
          },
        })),

      addItem: (item) =>
        set((state) => ({
          sale: {
            ...state.sale,
            items: [...state.sale.items, item],
          },
        })),

      updateItem: (index, item) =>
        set((state) => ({
          sale: {
            ...state.sale,
            items: state.sale.items.map((current, i) =>
              i === index ? { ...current, ...item } : current
            ),
          },
        })),

      removeItem: (index) =>
        set((state) => ({
          sale: {
            ...state.sale,
            items: state.sale.items.filter((_, i) => i !== index),
          },
        })),

      setItems: (items) =>
        set((state) => ({
          sale: {
            ...state.sale,
            items,
          },
        })),
    }),
    {
      name: "morro.sale",
      partialize: (state) => ({ sale: state.sale, sale_id: state.sale_id, isEditing: state.isEditing }),
      onRehydrateStorage: () => (persistedState) => {
        // mark rehydration complete
        set(() => ({ rehydrated: true }));
      },
    }
  )
);

type PersistedSaleStore = SaleStore;