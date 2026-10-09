import {
  CustomerDisplayMessage,
  CustomerDisplaySummary,
} from "../types/customerDisplay.types";

export const CUSTOMER_DISPLAY_CHANNEL = "morro.customer-display";
export const CUSTOMER_DISPLAY_WINDOW_NAME = "morro-customer-display";
export const CUSTOMER_DISPLAY_ROUTE = "/customer-display";
export const CUSTOMER_DISPLAY_STORAGE_KEY = "morro.customer-display.summary";

type MessageHandler = (message: CustomerDisplayMessage) => void;

let channel: BroadcastChannel | null = null;
let popupRef: Window | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
  }

  return channel;
}

// =========================================================
// Sincronización (BroadcastChannel + localStorage)
// =========================================================

export function publishSummary(summary: CustomerDisplaySummary): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CUSTOMER_DISPLAY_STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // localStorage puede no estar disponible; el canal sigue funcionando.
  }

  getChannel()?.postMessage({
    type: "summary",
    payload: summary,
  } satisfies CustomerDisplayMessage);
}

export function publishClear(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CUSTOMER_DISPLAY_STORAGE_KEY);
  } catch {
    // ignore
  }

  getChannel()?.postMessage({
    type: "clear",
    payload: null,
  } satisfies CustomerDisplayMessage);
}

export function requestCurrentSummary(): void {
  getChannel()?.postMessage({ type: "hello" } satisfies CustomerDisplayMessage);
}

export function subscribeToCustomerDisplay(
  handler: MessageHandler,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  // Escucha el evento `storage` como respaldo (otra pestaña escribe).
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CUSTOMER_DISPLAY_STORAGE_KEY) return;
    if (!event.newValue) {
      handler({ type: "clear", payload: null });
      return;
    }
    try {
      handler({ type: "summary", payload: JSON.parse(event.newValue) });
    } catch {
      // ignore
    }
  };

  const ch = getChannel();
  const onMessage = (event: MessageEvent<CustomerDisplayMessage>) => {
    if (!event.data?.type) return;
    handler(event.data);
  };

  window.addEventListener("storage", onStorage);
  ch?.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener("storage", onStorage);
    ch?.removeEventListener("message", onMessage);
  };
}

// =========================================================
// Detección de monitor secundario
// =========================================================

interface ScreenDetailedLike {
  isPrimary?: boolean;
  availLeft?: number;
  availTop?: number;
  availWidth?: number;
  availHeight?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export function hasExtendedScreen(): boolean {
  if (typeof window === "undefined") return false;

  const screenWithExtended = window.screen as Screen & {
    isExtended?: boolean;
  };

  // Si el navegador no soporta la API, asumimos una sola pantalla.
  if (typeof screenWithExtended.isExtended !== "boolean") return false;

  return screenWithExtended.isExtended;
}

export function isCustomerDisplayOpen(): boolean {
  return !!popupRef && !popupRef.closed;
}

interface ScreenDetailsLike {
  screens: ScreenDetailedLike[];
  currentScreen?: ScreenDetailedLike;
}

async function resolveOtherScreen(): Promise<ScreenDetailedLike | null> {
  const getScreenDetails = (
    window as unknown as {
      getScreenDetails?: () => Promise<ScreenDetailsLike>;
    }
  ).getScreenDetails;

  if (typeof getScreenDetails !== "function") {
    console.warn(
      "[customer-display] 'getScreenDetails' no está disponible; la ventana se abrirá sin posicionar.",
    );
    return null;
  }

  try {
    const details = await getScreenDetails.call(window);
    const screens = details?.screens ?? [];
    if (!screens.length) return null;

    const current = details?.currentScreen;

    const target =
      screens.find((s) => s !== current && !s.isPrimary) ??
      screens.find((s) => s !== current) ??
      screens.find((s) => !s.isPrimary) ??
      screens[0] ??
      null;

    console.info(
      "[customer-display] Pantallas detectadas:",
      screens.map((s) => ({
        primary: !!s.isPrimary,
        left: s.availLeft,
        top: s.availTop,
        width: s.availWidth,
        height: s.availHeight,
      })),
      "→ destino:",
      target,
    );

    return target;
  } catch (error) {
    console.warn(
      "[customer-display] No se pudo obtener la lista de pantallas (¿permiso denegado?):",
      error,
    );
    return null;
  }
}

/**
 * Abre la ventana de la pantalla del cliente en el otro monitor.
 *
 * Calcula las coordenadas del monitor secundario y las pasa a `window.open`
 * (patrón recomendado por la Window Management API). Debe invocarse dentro de
 * un gesto del usuario, por eso es asíncrona: primero resuelve las pantallas y
 * luego abre la ventana en la posición correcta.
 */
export async function openCustomerDisplay(options?: {
  force?: boolean;
}): Promise<void> {
  if (typeof window === "undefined") return;

  const force = options?.force ?? false;
  if (!force && !hasExtendedScreen()) return;

  if (isCustomerDisplayOpen()) {
    popupRef?.focus();
    return;
  }

  const target = await resolveOtherScreen();

  const features = target
    ? [
        "popup=yes",
        `left=${Math.round(target.availLeft ?? target.left ?? 0)}`,
        `top=${Math.round(target.availTop ?? target.top ?? 0)}`,
        `width=${Math.round(target.availWidth ?? target.width ?? 1024)}`,
        `height=${Math.round(target.availHeight ?? target.height ?? 768)}`,
      ].join(",")
    : "popup=yes,width=1024,height=768";

  const popup = window.open(
    CUSTOMER_DISPLAY_ROUTE,
    CUSTOMER_DISPLAY_WINDOW_NAME,
    features,
  );

  if (!popup) return;

  popupRef = popup;

  // Refuerzo: algunos equipos ignoran left/top en las features de window.open.
  if (target) {
    try {
      popup.moveTo(target.availLeft ?? 0, target.availTop ?? 0);
      popup.resizeTo(
        target.availWidth ?? 1024,
        target.availHeight ?? 768,
      );
    } catch {
      // ignore
    }
  }
}
