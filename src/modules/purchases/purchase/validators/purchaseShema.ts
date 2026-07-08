import { z } from "zod";

export const purchaseItemSchema = z.object({
  product_id: z.uuid("Debe seleccionar un producto"),

  product_unit_id: z.uuid("Debe seleccionar una unidad de producto"),

  quantity: z.coerce
    .number()
    .positive("La cantidad debe ser mayor que 0"),

  unit_quantity: z.coerce
    .number()
    .positive("La cantidad por unidad debe ser mayor que 0"),

  unit_cost: z.coerce
    .number()
    .min(0, "El costo unitario no puede ser negativo"),

  total_cost: z.coerce
    .number()
    .min(0, "El costo total no puede ser negativo"),

  lot_number: z
    .string()
    .max(100, "El lote no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  expiry_date: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const purchaseSchema = z.object({
  company_id: z.uuid("Debe seleccionar una empresa"),

  warehouse_id: z.uuid("Debe seleccionar un almacén"),

  supplier_id: z.uuid("Debe seleccionar un proveedor"),

  currency_id: z.uuid("Debe seleccionar una moneda"),

  exchange_rate: z.coerce
    .number()
    .positive("El tipo de cambio debe ser mayor que 0"),

  reference_doc: z
    .string()
    .max(100, "La referencia no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  purchase_date: z.string().date("Ingrese una fecha válida"),

  items: z
    .array(purchaseItemSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export type PurchaseItemForm = z.infer<typeof purchaseItemSchema>;
export type PurchaseForm = z.infer<typeof purchaseSchema>;