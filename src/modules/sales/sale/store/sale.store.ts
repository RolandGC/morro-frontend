import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Sale } from "../types/sale.types";
import { SaleForm } from "../validators/saleSchema";

interface SaleStore {
  draft: SaleForm | null;
  isEditing: boolean;
  sale_id: string | null;
  sales: Sale[];

  setSales: (sales: Sale[]) => void;
  setDraft: (draft: SaleForm) => void;
  startNew: () => void;
  startEdit: (draft: SaleForm, saleId: string) => void;
  clearDraft: () => void;
}

type PersistedSaleState = Pick<
  SaleStore,
  "draft" | "isEditing" | "sale_id"
>;

export const useSaleStore = create<SaleStore>()(
  persist(
    (set) => ({
      draft: null,
      isEditing: false,
      sale_id: null,
      sales: [],

      setSales: (sales) =>
        set({
          sales,
        }),

      setDraft: (draft) =>
        set({
          draft,
        }),

      startNew: () =>
        set({
          draft: null,
          isEditing: false,
          sale_id: null,
        }),

      startEdit: (draft, saleId) =>
        set({
          draft,
          isEditing: true,
          sale_id: saleId,
        }),

      clearDraft: () =>
        set({
          draft: null,
          isEditing: false,
          sale_id: null,
        }),
    }),
    {
      name: "morro.sale",
      version: 1,
      partialize: (state): PersistedSaleState => ({
        draft: state.draft,
        isEditing: state.isEditing,
        sale_id: state.sale_id,
      }),
      migrate: (persistedState, version): PersistedSaleState => {
        if (version === 0) {
          const old = persistedState as {
            sale?: SaleForm;
            isEditing?: boolean;
            sale_id?: string | null;
          };

          return {
            draft: old.sale ?? null,
            isEditing: old.isEditing ?? false,
            sale_id: old.sale_id ?? null,
          };
        }

        return persistedState as PersistedSaleState;
      },
    }
  )
);
