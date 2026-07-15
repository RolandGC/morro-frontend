import { create } from "zustand";
import { Currency } from "../types/currency.types";
import { CurrencyForm } from "../validators/currencySchema";

const initialState: CurrencyForm = {
  name: "",
  code: "",
  symbol: "",
  is_base: false,
  //is_active: true,
};

interface CurrencyStore {
  open: boolean;
  isEditing: boolean;
  currency: CurrencyForm;
  currency_id: string | null;
  currencies: Currency[];

  openCreate: () => void;
  openEdit: (
    currency: CurrencyForm,
    currency_id: string | null
  ) => void;

  setCurrencies: (currencies: Currency[]) => void;

  close: () => void;

  updateField: <K extends keyof CurrencyForm>(
    field: K,
    value: CurrencyForm[K]
  ) => void;

  reset: () => void;
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  open: false,
  isEditing: false,
  currency: initialState,
  currency_id: null,
  currencies: [],

  openCreate: () =>
    set({
      open: true,
      isEditing: false,
      currency: initialState,
      currency_id: null,
    }),

  openEdit: (currency, currency_id) =>
    set({
      open: true,
      isEditing: true,
      currency,
      currency_id,
    }),

  close: () =>
    set({
      open: false,
    }),

  setCurrencies: (currencies) =>
    set({
      currencies,
    }),

  updateField: (field, value) =>
    set((state) => ({
      currency: {
        ...state.currency,
        [field]: value,
      },
    })),

  reset: () =>
    set({
      currency: initialState,
      currency_id: null,
      isEditing: false,
    }),
}));