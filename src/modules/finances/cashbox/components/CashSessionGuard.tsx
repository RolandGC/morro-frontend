"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/modules/auth/store/authStore";
import { usePermissionStore } from "@/modules/auth/store/permission.store";
import { getSelectedCompanyId, getSelectedWarehouseId } from "@/modules/reports/utils/company";

import { useCashSessionStore } from "../store/cashSession.store";
import { CashSessionCloseModal } from "./CashSessionCloseModal";
import { CashSessionOpenModal } from "./CashSessionOpenModal";

/**
 * Comprueba la caja al entrar a cualquier pantalla autenticada y mantiene
 * montados los modales de apertura y cierre para todo el layout protegido.
 */
export function CashSessionGuard() {
    const token = useAuthStore((state) => state.token);
    const userId = useAuthStore((state) => state.user?.id);
    const permissionsLoaded = usePermissionStore((state) => state.isLoaded);
    const checkSession = useCashSessionStore((state) => state.checkSession);
    const checkedKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!token || !userId) {
            checkedKeyRef.current = null;
            return;
        }

        if (!permissionsLoaded) return;

        const companyId = getSelectedCompanyId();
        const warehouseId = getSelectedWarehouseId();

        if (!companyId || !warehouseId) return;

        const key = `${userId}:${companyId}:${warehouseId}`;

        if (checkedKeyRef.current === key) return;

        checkedKeyRef.current = key;
        void checkSession("startup");
    }, [token, userId, permissionsLoaded, checkSession]);

    return (
        <>
            <CashSessionOpenModal />
            <CashSessionCloseModal />
        </>
    );
}
