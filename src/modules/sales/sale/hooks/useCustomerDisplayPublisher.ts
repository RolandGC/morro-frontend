"use client";

import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { productService } from "@/modules/inventory/products/services/product.service";
import { useCustomerDisplayStore } from "../store/customerDisplay.store";
import {
  publishClear,
  publishSummary,
  subscribeToCustomerDisplay,
} from "../services/customerDisplay.service";
import {
  CachedProduct,
  CustomerDisplayStatus,
  CustomerDisplaySummary,
} from "../types/customerDisplay.types";
import { SaleForm } from "../validators/saleSchema";

const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

// El publicador se monta en el layout del flujo y en el paso de pago.
// Estos valores compartidos evitan publicaciones duplicadas y limpiezas
// prematuras al navegar entre pasos.
let activePublishers = 0;
let completed = false;

const buildSummary = (
  status: CustomerDisplayStatus,
  items: SaleForm["items"],
  cache: Record<string, CachedProduct>,
): CustomerDisplaySummary => {
  const lines = (items ?? []).map((item) => {
    const cached = cache[item.product_id];
    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unit_price ?? 0);

    return {
      productId: item.product_id,
      name: cached?.name || "Producto",
      model: cached?.model ?? null,
      unitName: cached?.unitNames?.[item.product_unit_id] ?? null,
      quantity,
      unitPrice,
      lineTotal: round2(quantity * unitPrice),
    };
  });

  const total = round2(lines.reduce((acc, line) => acc + line.lineTotal, 0));

  return {
    status,
    updatedAt: Date.now(),
    lines,
    total,
  };
};

/**
 * Publica el resumen de la venta hacia la pantalla del cliente.
 *
 * Se monta en el layout del flujo (para que funcione desde el primer paso) y
 * también en el paso de pago. No modifica el estado de la venta: solo escribe
 * en el store independiente `customerDisplay` y en el canal hacia la segunda
 * pantalla.
 */
export function useCustomerDisplayPublisher() {
  const { watch } = useFormContext<SaleForm>();
  const items = watch("items") ?? [];
  const productCache = useCustomerDisplayStore((state) => state.productCache);

  useEffect(() => {
    activePublishers += 1;
    if (activePublishers === 1) completed = false;

    return () => {
      activePublishers -= 1;
      if (activePublishers === 0 && !completed) {
        useCustomerDisplayStore.getState().clear();
        publishClear();
      }
    };
  }, []);

  // Publica en vivo desde el primer paso del flujo.
  useEffect(() => {
    if (completed) return;

    const summary = buildSummary("sale", items, productCache);
    useCustomerDisplayStore.getState().setSummary(summary);
    publishSummary(summary);
  }, [items, productCache]);

  // Responde a la pantalla del cliente cuando recién se abre o recarga.
  useEffect(() => {
    return subscribeToCustomerDisplay((message) => {
      if (message.type !== "hello" || completed) return;

      const summary = buildSummary(
        "sale",
        items,
        useCustomerDisplayStore.getState().productCache,
      );
      publishSummary(summary);
    });
  }, [items]);

  // Completa nombres de productos que no estén en caché (draft hidratado).
  useEffect(() => {
    const cache = useCustomerDisplayStore.getState().productCache;
    const missing = Array.from(
      new Set(
        items
          .map((item) => item.product_id)
          .filter((id): id is string => !!id && !cache[id]),
      ),
    );

    if (missing.length === 0) return;

    let cancelled = false;

    const fetchMissing = async () => {
      try {
        const response = await productService.getAll({
          is_active: true,
          page: 1,
          limit: 100,
        });

        if (cancelled) return;

        const all = response.data?.data ?? [];
        all
          .filter((product) => missing.includes(product.id))
          .forEach((product) =>
            useCustomerDisplayStore.getState().cacheProduct(product),
          );
      } catch (error) {
        console.error("No se pudieron cargar productos para la pantalla cliente", error);
      }
    };

    void fetchMissing();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // Marca la venta como completada: la pantalla muestra el agradecimiento.
  const markThanks = useCallback(() => {
    completed = true;

    const summary = buildSummary(
      "thanks",
      items,
      useCustomerDisplayStore.getState().productCache,
    );

    useCustomerDisplayStore.getState().setSummary(summary);
    publishSummary(summary);
  }, [items]);

  const clear = useCallback(() => {
    completed = false;
    useCustomerDisplayStore.getState().clear();
    publishClear();
  }, []);

  return { markThanks, clear };
}
