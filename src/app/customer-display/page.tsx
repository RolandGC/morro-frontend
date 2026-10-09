"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { CustomerDisplaySummary } from "@/modules/sales/sale/types/customerDisplay.types";
import {
  requestCurrentSummary,
  subscribeToCustomerDisplay,
} from "@/modules/sales/sale/services/customerDisplay.service";

const money = (value: number): string => `S/ ${value.toFixed(2)}`;

const THANKS_DURATION_MS = 8000;

export default function CustomerDisplayPage() {
  const [summary, setSummary] = useState<CustomerDisplaySummary | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const thanksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCustomerDisplay((message) => {
      if (message.type === "clear") {
        setSummary(null);
        return;
      }

      if (message.type === "summary" && message.payload !== undefined) {
        setSummary(message.payload);
      }
    });

    return () => unsubscribe();
  }, []);

  // Si aún no hay resumen, pide el estado a la pantalla principal (con reintentos,
  // porque su publicador puede tardar en montar).
  useEffect(() => {
    if (summary) return;

    requestCurrentSummary();
    const retryA = setTimeout(requestCurrentSummary, 700);
    const retryB = setTimeout(requestCurrentSummary, 1600);

    return () => {
      clearTimeout(retryA);
      clearTimeout(retryB);
    };
  }, [summary]);

  // El agradecimiento se muestra unos segundos y luego vuelve a espera.
  useEffect(() => {
    if (thanksTimerRef.current) {
      clearTimeout(thanksTimerRef.current);
      thanksTimerRef.current = null;
    }

    if (summary?.status === "thanks") {
      thanksTimerRef.current = setTimeout(() => setSummary(null), THANKS_DURATION_MS);
    }

    return () => {
      if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current);
    };
  }, [summary]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // El navegador puede requerir gesto del usuario.
    }
  }, []);

  const total = summary?.total ?? 0;

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-4 top-4 z-10 rounded-full border bg-card/80 p-2 text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground"
        aria-label="Pantalla completa"
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {!summary ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="text-6xl">🛒</div>
          <h1 className="text-3xl font-semibold">Bienvenido</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            El detalle de su compra aparecerá aquí.
          </p>
        </div>
      ) : summary.status === "thanks" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="text-7xl">✅</div>
          <h1 className="text-4xl font-bold">¡Gracias por su compra!</h1>
          <p className="text-6xl font-bold text-primary">{money(total)}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <header className="border-b px-8 py-6">
            <h1 className="text-3xl font-bold">Resumen de su compra</h1>
          </header>

          <section className="flex-1 px-8 py-6">
            <ul className="divide-y">
              {summary.lines.map((line, index) => {
                const description = [
                  line.name,
                  line.model ? `(${line.model})` : null,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <li
                    key={`${line.productId}-${index}`}
                    className="flex items-center justify-between gap-6 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-6">
                      <span className="w-16 shrink-0 text-center text-2xl font-semibold text-muted-foreground">
                        {line.quantity}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-2xl font-medium">{description}</p>
                        <p className="mt-1 text-lg text-muted-foreground">
                          {line.unitName ? `${line.unitName} · ` : ""}
                          {money(line.unitPrice)} c/u
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-2xl font-semibold">
                      {money(line.lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <footer className="border-t bg-muted/30 px-8 py-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-medium text-muted-foreground">Total</span>
              <span className="text-4xl font-bold">{money(total)}</span>
            </div>
          </footer>
        </div>
      )}
    </main>
  );
}
