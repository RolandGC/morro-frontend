import { create } from "zustand";
import { CompanyForm } from "../validators/companySchema";

const initialState: CompanyForm = {
  name: "",
  trade_name: "",
  parent_company_id: null,
  ruc: "",
  address: "",
  phone: "",
  logo_url: null,
  //settings_json: {},
};

interface CompanyStore {
  open: boolean;
  isEditing: boolean;
  company: CompanyForm;
  company_id: string | null;

  openCreate: () => void;
  openEdit: (company: CompanyForm, company_id: string | null) => void;
  close: () => void;

  updateField: <K extends keyof CompanyForm>(
    field: K,
    value: CompanyForm[K]
  ) => void;

  reset: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  open: false,
  isEditing: false,
  company: initialState,
  company_id: null,

  openCreate: () =>
    set({
      open: true,
      isEditing: false,
      company: initialState,
      company_id: null,
    }),

  openEdit: (company, company_id) =>
    set({
      open: true,
      isEditing: true,
      company,
      company_id,
    }),

  close: () =>
    set({
      open: false,
    }),

  updateField: (field, value) =>
    set((state) => ({
      company: {
        ...state.company,
        [field]: value,
      },
    })),

  reset: () =>
    set({
      company: initialState,
      isEditing: false,
      company_id: null,
    }),
}));