"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LockKeyhole, RefreshCw, UnlockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { showToast } from "@/hooks/useToast";
import { CashboxDataTable } from "@/modules/finances/cashbox/components/CashboxDataTable";
import { CashSessionDetailModal } from "@/modules/finances/cashbox/components/CashSessionDetailModal";
import { CASH_SESSION_PERMISSIONS } from "@/modules/finances/cashbox/constants/cashSession.constants";
import { cashboxService } from "@/modules/finances/cashbox/services/cashbox.service";
import { useCashSessionStore } from "@/modules/finances/cashbox/store/cashSession.store";
import type {
    Cashbox,
    CashboxQueryParams,
} from "@/modules/finances/cashbox/types/cashbox.types";
import { getCashSessionErrorMessage } from "@/modules/finances/cashbox/utils/cashSessionError";
import { cash_session_status } from "@/types/types";

import { getColumns } from "./columns";

export default function CashboxPage() {
    const [data, setData] = useState<Cashbox[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSession, setSelectedSession] = useState<Cashbox | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [cashboxFilter, setCashboxFilter] = useState<CashboxQueryParams>({
        page: 1,
        limit: 10,
    });

    const { can } = usePermission();
    const session = useCashSessionStore((state) => state.session);
    const checking = useCashSessionStore((state) => state.checking);
    const requestOpen = useCashSessionStore((state) => state.requestOpen);
    const requestClose = useCashSessionStore((state) => state.requestClose);

    const canClose = can(CASH_SESSION_PERMISSIONS.close);
    const hasOpenSession = session?.status === cash_session_status.open;

    const handleFilter = useCallback(
        <K extends keyof CashboxQueryParams>(
            key: K,
            value: CashboxQueryParams[K]
        ) => {
            setCashboxFilter((prev) => ({
                ...prev,
                [key]: value,
                ...(key === "page" ? {} : { page: 1 }),
            }));
        },
        []
    );

    const fetchData = useCallback(async () => {
        try {
            const response = await cashboxService.getAll(cashboxFilter);
            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al listar las sesiones");
            }
            setData(response.data.data ?? []);
            setTotalPages(response.data.meta?.totalPages ?? 1);
        } catch (error) {
            showToast(
                getCashSessionErrorMessage(error, "No se pudieron cargar las sesiones de caja"),
                "error",
                4000
            );
        }
    }, [cashboxFilter]);

    useEffect(() => {
        // Carga inicial desde la API: el estado se actualiza de forma
        // asíncrona, no sincrónicamente dentro del effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchData();
    }, [fetchData]);

    const handleView = useCallback((item: Cashbox) => {
        setSelectedSession(item);
        setDetailOpen(true);
    }, []);

    const handleClose = useCallback(
        (item: Cashbox) => {
            void requestClose(item);
        },
        [requestClose]
    );

    const columns = useMemo(
        () => getColumns({ onView: handleView, onClose: handleClose, canClose }),
        [handleView, handleClose, canClose]
    );

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold dark:text-yellow-300">
                        Caja
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Apertura, movimientos, saldo esperado e historial de sesiones.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => void fetchData()}
                        disabled={checking}
                    >
                        <RefreshCw className="mr-2 size-4" />
                        Actualizar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => void requestOpen()}
                        disabled={checking || hasOpenSession}
                        title={
                            hasOpenSession
                                ? "Ya tienes una sesión de caja abierta"
                                : undefined
                        }
                    >
                        <UnlockKeyhole className="mr-2 size-4" />
                        Abrir caja
                    </Button>
                    <Button
                        onClick={() => void requestClose()}
                        disabled={checking || !hasOpenSession || !canClose}
                        title={
                            !hasOpenSession
                                ? "No hay una sesión abierta"
                                : !canClose
                                  ? "Sin permiso para cerrar caja"
                                  : undefined
                        }
                    >
                        <LockKeyhole className="mr-2 size-4" />
                        Cerrar caja
                    </Button>
                </div>
            </div>

            <CashboxDataTable
                filter={cashboxFilter}
                columns={columns}
                data={data}
                totalPages={totalPages}
                handleFilter={handleFilter}
            />

            <CashSessionDetailModal
                session={selectedSession}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
