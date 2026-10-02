import type { Company } from "@/modules/core/companies/types/company.type";

/** Empresa activa guardada por la pantalla `select-company`. */
export function getSelectedCompany(): Company | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("selected_company");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Company;
  } catch {
    return null;
  }
}

export function getSelectedCompanyId(): string | null {
  return getSelectedCompany()?.id ?? null;
}

export function getSelectedWarehouseId(): string | null {
  const company = getSelectedCompany();
  return company?.warehouse_id ?? company?.warehouse?.id ?? null;
}
