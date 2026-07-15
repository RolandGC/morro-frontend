import { create } from "zustand";
import { Customer } from "../types/customer.type";
import { CustomerForm } from "../validators/customerSchema";
import { doc_type } from "@/types/types";

const initialState: CustomerForm = {
  full_name: "",
  doc_type: doc_type.dni,
  doc_number: "",
  phone: "",
  email: "",
  address: "",
  credit_limit: 0,
  credit_balance: 0,
};

interface CustomerStore {
  open: boolean;
  isEditing: boolean;
  customer: CustomerForm;
  customer_id: string | null;
  customers: Customer[];

  openCreate: () => void;
  openEdit: (
    customer: CustomerForm,
    customer_id: string | null
  ) => void;

  setCustomers: (customers: Customer[]) => void;

  close: () => void;

  updateField: <K extends keyof CustomerForm>(
    field: K,
    value: CustomerForm[K]
  ) => void;

  reset: () => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  open: false,
  isEditing: false,
  customer: initialState,
  customer_id: null,
  customers: [],

  openCreate: () =>
    set({
      open: true,
      isEditing: false,
      customer: initialState,
      customer_id: null,
    }),

  openEdit: (customer, customer_id) =>
    set({
      open: true,
      isEditing: true,
      customer,
      customer_id,
    }),

  close: () =>
    set({
      open: false,
    }),

  setCustomers: (customers) =>
    set({
      customers,
    }),

  updateField: (field, value) =>
    set((state) => ({
      customer: {
        ...state.customer,
        [field]: value,
      },
    })),

  reset: () =>
    set({
      customer: initialState,
      customer_id: null,
      isEditing: false,
    }),
}));