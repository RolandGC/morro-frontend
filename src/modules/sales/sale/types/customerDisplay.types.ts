export type CustomerDisplayStatus = "sale" | "thanks";

export interface CustomerDisplayLine {
  productId: string;
  name: string;
  model: string | null;
  unitName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerDisplaySummary {
  status: CustomerDisplayStatus;
  updatedAt: number;
  lines: CustomerDisplayLine[];
  total: number;
}

export interface CachedProductUnit {
  id: string;
  name: string;
}

export interface CachedProduct {
  id: string;
  name: string;
  model: string | null;
  unitNames: Record<string, string>;
}

export interface CustomerDisplayMessage {
  type: "summary" | "clear" | "hello";
  payload?: CustomerDisplaySummary | null;
}
