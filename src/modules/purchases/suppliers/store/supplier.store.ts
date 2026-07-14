import { create } from "zustand";
import { SupplierForm } from "../validators/supplierSchema";
import { Supplier } from "../types/suppliers.types";

const initialState: SupplierForm = {
  name: "",
  company_id: "",
  ruc: "",
  phone: "",
  email: "",
};

interface SupplierStore {
  open: boolean;
  isEditing: boolean;
  supplier: SupplierForm;
  supplier_id: string | null;
  suppliers: Supplier[];

  openCreate: () => void;
  openEdit: (
    supplier: SupplierForm,
    supplier_id: string | null
  ) => void;
  close: () => void;
  reset: () => void;

  setSuppliers: (suppliers: Supplier[]) => void;

  updateField: <K extends keyof SupplierForm>(
    field: K,
    value: SupplierForm[K]
  ) => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  open: false,
  isEditing: false,
  supplier: initialState,
  supplier_id: null,
  suppliers: [],

  openCreate: () =>
    set({
      open: true,
      isEditing: false,
      supplier: initialState,
      supplier_id: null,
    }),

  openEdit: (supplier, supplier_id) =>
    set({
      open: true,
      isEditing: true,
      supplier,
      supplier_id,
    }),

  close: () =>
    set({
      open: false,
    }),

  setSuppliers: (suppliers) =>
    set({
      suppliers,
    }),

  updateField: (field, value) =>
    set((state) => ({
      supplier: {
        ...state.supplier,
        [field]: value,
      },
    })),

  reset: () =>
    set({
      supplier: initialState,
      supplier_id: null,
      isEditing: false,
    }),
}));