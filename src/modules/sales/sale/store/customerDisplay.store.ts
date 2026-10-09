import { create } from "zustand";
import {
  CachedProduct,
  CachedProductUnit,
  CustomerDisplaySummary,
} from "../types/customerDisplay.types";

/**
 * Store independiente de la venta.
 *
 * Su única responsabilidad es acumular la información que se mostrará en la
 * pantalla del cliente (segundo monitor). No participa en la lógica de venta
 * ni reemplaza a `sale.store`.
 */
interface CustomerDisplayState {
  summary: CustomerDisplaySummary | null;
  productCache: Record<string, CachedProduct>;

  setSummary: (summary: CustomerDisplaySummary | null) => void;
  cacheProduct: (product: {
    id: string;
    name?: string | null;
    model?: string | null;
    product_units?: CachedProductUnit[] | null;
  }) => void;
  clear: () => void;
}

export const useCustomerDisplayStore = create<CustomerDisplayState>((set) => ({
  summary: null,
  productCache: {},

  setSummary: (summary) => set({ summary }),

  cacheProduct: (product) =>
    set((state) => {
      const previous = state.productCache[product.id];
      const unitNames: Record<string, string> = {
        ...(previous?.unitNames ?? {}),
      };

      for (const unit of product.product_units ?? []) {
        if (unit?.id) unitNames[unit.id] = unit.name ?? "";
      }

      return {
        productCache: {
          ...state.productCache,
          [product.id]: {
            id: product.id,
            name: product.name ?? previous?.name ?? "",
            model: product.model ?? previous?.model ?? null,
            unitNames,
          },
        },
      };
    }),

  clear: () => set({ summary: null }),
}));
