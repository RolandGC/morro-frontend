"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
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

export function useSaleForm() {
  const form = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
    defaultValues: createEmptySaleForm(),
  });

  const [ready, setReady] = useState(false);

  // Evita que un cambio que acaba de venir de RHF
  // provoque un reset innecesario desde Zustand.
  const syncingFromForm = useRef(false);

  // =========================================================
  // 1. HIDRATACIÓN
  // =========================================================

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const hydrate = () => {
      const { draft } = useSaleStore.getState();

      const normalizedDraft = normalizeSaleForm(draft);

      form.reset(normalizedDraft);

      setReady(true);
    };

    if (useSaleStore.persist.hasHydrated()) {
      hydrate();
    } else {
      unsubscribe =
        useSaleStore.persist.onFinishHydration(hydrate);
    }

    return () => unsubscribe?.();
  }, [form]);

  // =========================================================
  // 2. RHF → ZUSTAND
  // =========================================================

  useEffect(() => {
    if (!ready) return;

    const subscription = form.watch((values) => {
      syncingFromForm.current = true;

      useSaleStore
        .getState()
        .setDraft(values as SaleForm);

      // Permitimos nuevamente la sincronización
      // después de que Zustand procese el cambio.
      queueMicrotask(() => {
        syncingFromForm.current = false;
      });
    });

    // Sincronización inicial
    useSaleStore
      .getState()
      .setDraft(form.getValues());

    return () => subscription.unsubscribe();
  }, [ready, form]);

  // =========================================================
  // 3. ZUSTAND → RHF
  // =========================================================

  useEffect(() => {
    if (!ready) return;

    const unsubscribe = useSaleStore.subscribe(
      (state, prevState) => {
        if (state.draft === prevState.draft) {
          return;
        }

        // Si el cambio viene desde RHF,
        // NO debemos hacer reset().
        if (syncingFromForm.current) {
          return;
        }

        const storeDraft = normalizeSaleForm(
          state.draft
        );

        const currentValues = form.getValues();

        if (
          !areDraftsEqual(
            storeDraft,
            currentValues
          )
        ) {
          form.reset(storeDraft);
        }
      }
    );

    return unsubscribe;
  }, [ready, form]);

  return form;
}
