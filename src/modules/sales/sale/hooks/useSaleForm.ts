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

  const syncingFromForm = useRef(false);
  const hydratedRef = useRef(false);

  // =========================================================
  // 1. HIDRATACIÓN
  // =========================================================

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const hydrate = () => {
      const { draft } = useSaleStore.getState();
      const normalizedDraft = normalizeSaleForm(draft);

      form.reset(normalizedDraft);
      hydratedRef.current = true;
      setReady(true);
    };

    if (useSaleStore.persist.hasHydrated()) {
      hydrate();
    } else {
      unsubscribe = useSaleStore.persist.onFinishHydration(hydrate);
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

      useSaleStore.getState().setDraft(values as SaleForm);

      queueMicrotask(() => {
        syncingFromForm.current = false;
      });
    });

    if (hydratedRef.current) {
      const currentValues = form.getValues();
      const storeDraft = normalizeSaleForm(
        useSaleStore.getState().draft
      );

      if (!areDraftsEqual(currentValues, storeDraft)) {
        useSaleStore.getState().setDraft(currentValues);
      }
    }

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

        if (syncingFromForm.current) {
          return;
        }

        const storeDraft = normalizeSaleForm(state.draft);
        const currentValues = form.getValues();

        if (!areDraftsEqual(storeDraft, currentValues)) {
          form.reset(storeDraft);
        }
      }
    );

    return unsubscribe;
  }, [ready, form]);

  return form;
}
