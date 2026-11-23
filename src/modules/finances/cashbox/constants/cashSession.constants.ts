export const CASH_SESSION_PERMISSIONS = {
    read: "cash-sessions.read",
    create: "cash-sessions.create",
    open: "cash-sessions.open",
    close: "cash-sessions.close",
} as const;

/** Texto solicitado por defecto al abrir la caja automáticamente. */
export const CASH_SESSION_DEFAULT_OPEN_NOTES =
    "Apertura de caja automática al iniciar sesión";
