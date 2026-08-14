"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSaleStore } from "../store/sale.store";
import {
  SaleForm,
  createEmptySaleForm,
  normalizeSaleForm,
  saleSchema,
} from "../validators/saleSchema";

function areDraftsEqual(
  a: SaleForm | null | undefined,
  b: SaleForm | null | undefined
): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/**
 * Puente entre React Hook Form y el store de Zustand.
 *
 * - Carga el borrador persistido en RHF una vez que Zustand termina de hidratar.
 * - Escribe (write-through) cada cambio de RHF en el store, que persiste en storage.
 * - Reacciona a cambios externos del store (startNew / startEdit / clearDraft)
 *   re-sincronizando el formulario.
 */
export function useSaleForm() {
  const form = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
    defaultValues: createEmptySaleForm(),
  });

  const [ready, setReady] = useState(false);

  // 1) Hidratación: recuperar el borrador persistido y cargarlo en RHF.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const hydrate = () => {
      const { draft } = useSaleStore.getState();
      form.reset(normalizeSaleForm(draft));
      setReady(true);
    };

    if (useSaleStore.persist.hasHydrated()) {
      hydrate();
    } else {
      unsubscribe = useSaleStore.persist.onFinishHydration(hydrate);
    }

    return () => unsubscribe?.();
  }, [form]);

  // 2) Write-through: RHF -> store (se persiste automáticamente al modificar).
  useEffect(() => {
    if (!ready) return;

    const subscription = form.watch((values) => {
      useSaleStore.getState().setDraft(values as SaleForm);
    });

    // Sincronización inicial para cubrir el reset de la hidratación.
    useSaleStore.getState().setDraft(form.getValues());

    return () => subscription.unsubscribe();
  }, [ready, form]);

  // 3) Store -> RHF: re-sincronizar cuando el borrador cambia externamente.
  useEffect(() => {
    if (!ready) return;

    const unsubscribe = useSaleStore.subscribe((state, prevState) => {
      if (state.draft === prevState.draft) return;
      if (!areDraftsEqual(state.draft, form.getValues())) {
        form.reset(normalizeSaleForm(state.draft));
      }
    });

    return unsubscribe;
  }, [ready, form]);

  return form;
}
