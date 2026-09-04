import { sale_type } from "@/types/types";
import { z } from "zod";

export const saleItemSchema = z.object({
  product_id: z.uuid("Debe seleccionar un producto"),

  product_unit_id: z.uuid("Debe seleccionar una unidad de producto"),

  quantity: z
    .number()
    .positive("La cantidad debe ser mayor que 0"),

  unit_quantity: z
    .number()
    .positive("La cantidad por unidad debe ser mayor que 0"),

  unit_price: z
    .number()
    .min(0, "El precio unitario no puede ser negativo"),

  igv_amount: z
    .number()
    .min(0, "El IGV no puede ser negativo"),

  subtotal: z
    .number()
    .min(0, "El subtotal no puede ser negativo"),

  is_bonus: z.boolean(),
});

export const salePaymentSchema = z.object({
  payment_account_id: z.uuid("Debe seleccionar una cuenta de pago"),

  /* cash_session_id: z
    .uuid("Debe seleccionar una sesión de caja")
    .optional(), */

  currency_id: z.uuid("Debe seleccionar una moneda"),

  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),

  exchange_rate: z.number().positive("El tipo de cambio debe ser mayor que 0"),

  notes: z.string().optional(),
});

export const saleSchema = z.object({
  company_id: z.uuid("Debe seleccionar una empresa").optional().or(z.literal("")),

  warehouse_id: z.uuid("Debe seleccionar un almacén").optional().or(z.literal("")),

  customer_id: z.uuid("Debe seleccionar un cliente"),

  price_list_id: z.string().optional(),

  currency_id: z.uuid("Debe seleccionar una moneda"),

  exchange_rate: z
    .number()
    .positive("El tipo de cambio debe ser mayor que 0"),

  sale_type: z.nativeEnum(sale_type),

  sale_date: z.string().optional(),

  items: z
    .array(saleItemSchema)
    .min(1, "Debe agregar al menos un producto"),
  payments: z.array(salePaymentSchema).optional(),
});

export type SaleItemForm = z.infer<typeof saleItemSchema>;
export type SalePaymentForm = z.infer<typeof salePaymentSchema>;
export type SaleForm = z.infer<typeof saleSchema>;


export function createEmptySaleForm(): SaleForm {
  return {
    company_id: "",
    warehouse_id: "",
    customer_id: "",
    price_list_id: undefined,
    currency_id: "",
    exchange_rate: 1,
    sale_type: sale_type.cash,
    sale_date: undefined,
    items: [],
    payments: [],
  };
}

export function normalizeSaleForm(draft: SaleForm | null | undefined): SaleForm {
  if (!draft) return createEmptySaleForm();

  const toNumber = (value: unknown, fallback: number) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    ...createEmptySaleForm(),
    ...draft,
    exchange_rate: toNumber(draft.exchange_rate, 1),
    items: (draft.items ?? []).map((item) => ({
      ...item,
      quantity: toNumber(item.quantity, 1),
      unit_quantity: toNumber(item.unit_quantity, 1),
      unit_price: toNumber(item.unit_price, 0),
      igv_amount: toNumber(item.igv_amount, 0),
      subtotal: toNumber(item.subtotal, 0),
    })),
    payments: (draft.payments ?? []).map((p) => ({
      ...p,
      amount: toNumber((p as any).amount, 0),
      exchange_rate: toNumber((p as any).exchange_rate, 1),
    })),
  };
}

const ticketSchema = z.object({
  sale_id: z.string(),
  customer_id: z.string(),
  sale_item_ids: z.array(z.string()).min(1, "Selecciona al menos un ítem"),
});

export type TicketForm = z.infer<typeof ticketSchema>;

