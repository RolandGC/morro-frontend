import { sale_type } from "@/types/types";
import { z } from "zod";

export const saleItemSchema = z.object({
  product_id: z.uuid("Debe seleccionar un producto"),

  product_unit_id: z.uuid("Debe seleccionar una unidad de producto"),

  quantity: z.coerce
    .number()
    .positive("La cantidad debe ser mayor que 0"),

  unit_quantity: z.coerce
    .number()
    .positive("La cantidad por unidad debe ser mayor que 0"),

  unit_price: z.coerce
    .number()
    .min(0, "El precio unitario no puede ser negativo"),

  igv_amount: z.coerce
    .number()
    .min(0, "El IGV no puede ser negativo"),

  subtotal: z.coerce
    .number()
    .min(0, "El subtotal no puede ser negativo"),

  is_bonus: z.boolean(),
});

export const saleSchema = z.object({
  company_id: z.uuid("Debe seleccionar una empresa"),

  warehouse_id: z.uuid("Debe seleccionar un almacén"),

  customer_id: z.uuid("Debe seleccionar un cliente"),

  //price_list_id: z.uuid("Debe seleccionar una lista de precios"),

  currency_id: z.uuid("Debe seleccionar una moneda"),

  exchange_rate: z.coerce
    .number()
    .positive("El tipo de cambio debe ser mayor que 0"),

  sale_type: z.nativeEnum(sale_type),

  //sale_date: z.string().optional().datetime("Ingrese una fecha válida"),

  items: z
    .array(saleItemSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export type SaleItemForm = z.infer<typeof saleItemSchema>;
export type SaleForm = z.infer<typeof saleSchema>;