import { create } from "zustand";
import { Purchase, PurchaseItem } from "../types/purchase.types";
import { PurchaseForm } from "../validators/purchaseSchema";

const initialState: PurchaseForm = {
  company_id: "",
  warehouse_id: "",
  supplier_id: "",
  currency_id: "",
  exchange_rate: 1,
  reference_doc: "",
  purchase_date: "",
  items: [],
};

interface PurchaseStore {
  open: boolean;
  isEditing: boolean;
  purchase: PurchaseForm;
  purchase_id: string | null;
  purchases: Purchase[];

  openCreate: () => void;
  openEdit: (
    purchase: PurchaseForm,
    purchase_id: string | null
  ) => void;
  close: () => void;
  reset: () => void;

  setPurchases: (purchases: Purchase[]) => void;

  updateField: <K extends keyof PurchaseForm>(
    field: K,
    value: PurchaseForm[K]
  ) => void;

  addItem: (item: PurchaseItem) => void;
  updateItem: (
    index: number,
    item: Partial<PurchaseItem>
  ) => void;
  removeItem: (index: number) => void;
  setItems: (items: PurchaseItem[]) => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  open: false,
  isEditing: false,
  purchase: initialState,
  purchase_id: null,
  purchases: [],

  openCreate: () =>
    set({
      open: true,
      isEditing: false,
      purchase: initialState,
      purchase_id: null,
    }),

  openEdit: (purchase, purchase_id) =>
    set({
      open: true,
      isEditing: true,
      purchase,
      purchase_id,
    }),

  close: () =>
    set({
      open: false,
    }),

  reset: () =>
    set({
      purchase: initialState,
      purchase_id: null,
      isEditing: false,
    }),

  setPurchases: (purchases) =>
    set({
      purchases,
    }),

  updateField: (field, value) =>
    set((state) => ({
      purchase: {
        ...state.purchase,
        [field]: value,
      },
    })),

  addItem: (item) =>
    set((state) => ({
      purchase: {
        ...state.purchase,
        items: [...state.purchase.items, item],
      },
    })),

  updateItem: (index, item) =>
    set((state) => ({
      purchase: {
        ...state.purchase,
        items: state.purchase.items.map((current, i) =>
          i === index ? { ...current, ...item } : current
        ),
      },
    })),

  removeItem: (index) =>
    set((state) => ({
      purchase: {
        ...state.purchase,
        items: state.purchase.items.filter((_, i) => i !== index),
      },
    })),

  setItems: (items) =>
    set((state) => ({
      purchase: {
        ...state.purchase,
        items,
      },
    })),
}));