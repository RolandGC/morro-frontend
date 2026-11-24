import { create } from "zustand";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { usePermissionStore } from "@/modules/auth/store/permission.store";
import { accountService } from "@/modules/finances/Account/services/account.service";
import type { Account } from "@/modules/finances/Account/types/account.types";
import { getSelectedCompanyId, getSelectedWarehouseId } from "@/modules/reports/utils/company";
import { payment_account_type } from "@/types/types";
import { showToast } from "@/hooks/useToast";

import {
    CASH_SESSION_DEFAULT_OPEN_NOTES,
    CASH_SESSION_PERMISSIONS,
} from "../constants/cashSession.constants";
import { cashboxService } from "../services/cashbox.service";
import type { Cashbox } from "../types/cashbox.types";
import type { CashboxForm, CashSessionCloseForm } from "../validators/cashboxSchema";
import { getCashSessionErrorMessage } from "../utils/cashSessionError";

type CheckPurpose = "startup" | "logout" | "open-request" | "close-request";
type ClosePurpose = "logout" | "manual";

interface CashSessionContext {
    companyId: string;
    warehouseId: string;
}

interface CashSessionState {
    session: Cashbox | null;
    sessionDetail: Cashbox | null;
    detailLoading: boolean;
    detailError: string | null;
    context: CashSessionContext | null;
    accounts: Account[];
    checking: boolean;
    accountsLoading: boolean;
    submitting: boolean;
    openModalOpen: boolean;
    closeModalOpen: boolean;
    closePurpose: ClosePurpose | null;
    error: string | null;
    onLogout: (() => void) | null;

    checkSession: (purpose: CheckPurpose) => Promise<void>;
    requestOpen: () => Promise<void>;
    requestClose: (session?: Cashbox) => Promise<void>;
    loadSessionDetail: (id: string) => Promise<void>;
    loadAccounts: () => Promise<void>;
    confirmOpen: (form: CashboxForm) => Promise<boolean>;
    confirmClose: (form: CashSessionCloseForm) => Promise<boolean>;
    requestLogout: (onLogout: () => void) => Promise<void>;
    cancelClose: () => void;
    dismissOpen: () => void;
    reset: () => void;
    finishLogout: () => Promise<void>;
}

const initialState = {
    session: null,
    sessionDetail: null,
    detailLoading: false,
    detailError: null,
    context: null,
    accounts: [] as Account[],
    checking: false,
    accountsLoading: false,
    submitting: false,
    openModalOpen: false,
    closeModalOpen: false,
    closePurpose: null as ClosePurpose | null,
    error: null,
    onLogout: null,
};

function canUse(permission: string): boolean {
    const permissionStore = usePermissionStore.getState();

    // Si aún no cargaron los permisos, el backend es la fuente de verdad.
    if (!permissionStore.isLoaded) return true;

    return permissionStore.hasPermission(permission);
}

function canOpenCashSession(): boolean {
    // El guard del backend original exige `cash-sessions.open`.
    return canUse(CASH_SESSION_PERMISSIONS.open);
}

export const useCashSessionStore = create<CashSessionState>((set, get) => ({
    ...initialState,

    loadAccounts: async () => {
        set({ accountsLoading: true, error: null });

        try {
            const response = await accountService.getAll({
                is_active: true,
                type: payment_account_type.cash,
                page: 1,
                limit: 100,
            });

            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al listar cuentas de pago");
            }

            set({
                accounts: response.data.data ?? [],
                accountsLoading: false,
            });
        } catch (error) {
            const message = getCashSessionErrorMessage(
                error,
                "No se pudieron cargar las cuentas de efectivo"
            );

            set({ accounts: [], accountsLoading: false, error: message });
            showToast(message, "error", 4000);
        }
    },

    loadSessionDetail: async (id) => {
        set({ detailLoading: true, detailError: null });

        try {
            const response = await cashboxService.getById(id);

            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al consultar la sesión");
            }

            set({ sessionDetail: response.data, detailLoading: false });
        } catch (error) {
            const message = getCashSessionErrorMessage(
                error,
                "No se pudo actualizar el detalle de la sesión de caja"
            );

            set({ detailError: message, detailLoading: false });
            showToast(message, "error", 4000);
        }
    },

    checkSession: async (purpose) => {
        const user = useAuthStore.getState().user;
        const companyId = getSelectedCompanyId();
        const warehouseId = getSelectedWarehouseId();
        const closePurpose: ClosePurpose | null =
            purpose === "logout"
                ? "logout"
                : purpose === "close-request"
                  ? "manual"
                  : null;

        set({
            checking: true,
            error: null,
            context: companyId && warehouseId ? { companyId, warehouseId } : null,
        });

        try {
            if (!user?.id) {
                throw new Error("No se pudo identificar al usuario actual");
            }

            if (!companyId || !warehouseId) {
                throw new Error(
                    "No hay una empresa y un almacén seleccionados en el sistema"
                );
            }

            if (!canUse(CASH_SESSION_PERMISSIONS.read)) {
                throw new Error(
                    "No tienes permiso para consultar sesiones de caja"
                );
            }

            const response = await cashboxService.getActive({
                company_id: companyId,
                warehouse_id: warehouseId,
            });

            if (response.status !== 200) {
                throw new Error("No se pudo verificar el estado de la caja");
            }

            // `/cash-sessions/active` devuelve el detalle completo (con
            // movimientos), a diferencia del listado paginado.
            const openSession = response.data ?? null;

            set({
                session: openSession,
                sessionDetail: openSession,
                checking: false,
                closePurpose,
            });

            if (openSession) {
                if (closePurpose) {
                    set({
                        openModalOpen: false,
                        closeModalOpen: true,
                        error:
                            purpose === "logout" &&
                            !canUse(CASH_SESSION_PERMISSIONS.close)
                                ? "No tienes permiso para cerrar la sesión de caja"
                                : null,
                    });
                } else {
                    set({
                        openModalOpen: false,
                        closeModalOpen: false,
                        error: null,
                    });
                    if (purpose === "open-request") {
                        showToast("Ya tienes una sesión de caja abierta", "info", 4000);
                    }
                }
                return;
            }

            set({
                closeModalOpen: false,
                closePurpose: null,
                sessionDetail: null,
                error: null,
            });

            if (purpose === "logout") {
                await get().finishLogout();
                return;
            }

            if (purpose === "close-request") {
                const message = "No hay una sesión de caja abierta para cerrar";
                set({ error: message, checking: false });
                showToast(message, "info", 4000);
                return;
            }

            if (!canOpenCashSession()) {
                set({
                    openModalOpen: true,
                    accounts: [],
                    error: "No tienes permiso para abrir sesiones de caja",
                });
                return;
            }

            await get().loadAccounts();

            if (get().accounts.length === 0) {
                set({
                    openModalOpen: true,
                    error: "No hay cuentas de efectivo activas para abrir la caja",
                });
                return;
            }

            set({ openModalOpen: true });
        } catch (error) {
            const message = getCashSessionErrorMessage(
                error,
                "No se pudo verificar el estado de la caja"
            );

            set({
                checking: false,
                error: message,
                closePurpose,
                openModalOpen: purpose === "startup" || purpose === "open-request",
                closeModalOpen: purpose === "logout" || purpose === "close-request",
            });
            showToast(message, "error", 4000);
        }
    },

    requestOpen: async () => {
        await get().checkSession("open-request");
    },

    requestClose: async (session) => {
        if (session) {
            set({
                session,
                sessionDetail: null,
                context: {
                    companyId: session.company_id,
                    warehouseId: session.warehouse_id,
                },
                closePurpose: "manual",
                openModalOpen: false,
                closeModalOpen: true,
                error: null,
            });
            void get().loadSessionDetail(session.id);
            return;
        }

        await get().checkSession("close-request");
    },

    confirmOpen: async (form) => {
        const context = get().context;

        if (!context) {
            const message = "No hay una empresa y un almacén seleccionados en el sistema";
            set({ error: message });
            showToast(message, "error", 4000);
            return false;
        }

        if (!canOpenCashSession()) {
            const message = "No tienes permiso para abrir sesiones de caja";
            set({ error: message });
            showToast(message, "error", 4000);
            return false;
        }

        set({ submitting: true, error: null });

        try {
            // Doble comprobación con el mismo criterio que usa el backend.
            const verification = await cashboxService.getActive({
                company_id: context.companyId,
                warehouse_id: context.warehouseId,
            });

            if (verification.status !== 200) {
                throw new Error("No se pudo verificar si ya existe una caja abierta");
            }

            const existing = verification.data;

            if (existing) {
                set({
                    session: existing,
                    sessionDetail: existing,
                    openModalOpen: false,
                    submitting: false,
                    error: null,
                });
                showToast("Ya existía una sesión de caja abierta", "info", 4000);
                return true;
            }

            const response = await cashboxService.open({
                ...form,
                warehouse_id: context.warehouseId,
                company_id: context.companyId,
                notes: form.notes?.trim()
                    ? form.notes
                    : CASH_SESSION_DEFAULT_OPEN_NOTES,
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error("Respuesta inesperada al abrir la caja");
            }

            set({
                session: response.data,
                openModalOpen: false,
                submitting: false,
                error: null,
            });
            showToast("Sesión de caja abierta correctamente", "success");
            return true;
        } catch (error) {
            const message = getCashSessionErrorMessage(
                error,
                "No se pudo abrir la sesión de caja"
            );

            set({ submitting: false, error: message });
            showToast(message, "error", 5000);
            return false;
        }
    },

    confirmClose: async (form) => {
        const session = get().session;

        if (!session) {
            const message = "No hay una sesión de caja abierta para cerrar";
            set({ error: message });
            showToast(message, "error", 4000);
            return false;
        }

        if (!canUse(CASH_SESSION_PERMISSIONS.close)) {
            const message = "No tienes permiso para cerrar la sesión de caja";
            set({ error: message });
            showToast(message, "error", 4000);
            return false;
        }

        const currentUserId = useAuthStore.getState().user?.id;
        if (session.user_id && currentUserId && session.user_id !== currentUserId) {
            const message = "Solo el usuario que abrió la sesión puede cerrarla";
            set({ error: message });
            showToast(message, "error", 4000);
            return false;
        }

        set({ submitting: true, error: null });

        try {
            const response = await cashboxService.close(session.id, {
                details: form.details.filter((detail) => detail.payment_account_id),
                notes: form.notes?.trim() ? form.notes : undefined,
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error("Respuesta inesperada al cerrar la caja");
            }

            const wasLogout = get().closePurpose === "logout";

            set({
                session: null,
                sessionDetail: null,
                closeModalOpen: false,
                closePurpose: null,
                submitting: false,
                error: null,
            });

            showToast("Sesión de caja cerrada correctamente", "success");

            if (wasLogout) {
                await get().finishLogout();
            }
            return true;
        } catch (error) {
            const message = getCashSessionErrorMessage(
                error,
                "No se pudo cerrar la sesión de caja"
            );

            set({ submitting: false, error: message });
            showToast(message, "error", 5000);
            return false;
        }
    },

    requestLogout: async (onLogout) => {
        set({ onLogout, error: null });
        await get().checkSession("logout");
    },

    cancelClose: () =>
        set({
            closeModalOpen: false,
            closePurpose: null,
            onLogout: null,
            error: null,
            submitting: false,
        }),

    dismissOpen: () =>
        set({
            openModalOpen: false,
            error: null,
        }),

    finishLogout: async () => {
        const callback = get().onLogout;

        set({
            ...initialState,
            accounts: [],
        });

        try {
            await useAuthStore.getState().logout();
        } finally {
            callback?.();
        }
    },

    reset: () => set({ ...initialState, accounts: [] }),
}));
