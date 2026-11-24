"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/hooks/dateFormat";
import { usePermission } from "@/hooks/usePermission";
import { showToast } from "@/hooks/useToast";
import { getSelectedCompany } from "@/modules/reports/utils/company";
import { dailyClosingService } from "@/modules/finances/dailyClosings/services/dailyClosing.service";
import type {
    DailyClosing,
    DailyClosingQueryParams,
} from "@/modules/finances/dailyClosings/types/dailyClosing.types";
import { getDailyClosingErrorMessage } from "@/modules/finances/dailyClosings/utils/dailyClosingError";
import {
    dailyClosingSchema,
    type DailyClosingForm,
} from "@/modules/finances/dailyClosings/validators/dailyClosingSchema";
import { formatCurrency } from "@/lib/format";
import {
    getDailyClosingCollectionsByMethod,
    getDailyClosingCurrencies,
    getDailyClosingSalesByMethod,
    type DailyClosingSummaryRow,
} from "@/modules/finances/dailyClosings/utils/dailyClosingSummary";
import { daily_closing_status, PaginationMeta } from "@/types/types";

function todayLocal(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function SummaryTable({
    title,
    rows,
    emptyMessage,
}: {
    title: string;
    rows: DailyClosingSummaryRow[];
    emptyMessage: string;
}) {
    return (
        <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Método / cuenta</TableHead>
                                <TableHead className="text-right">
                                    Cantidad
                                </TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.label}>
                                    <TableCell>{row.label}</TableCell>
                                    <TableCell className="text-right">
                                        {row.count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(row.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    );
}

export default function DailyClosingsPage() {
    const { can, isLoaded: permissionsLoaded } = usePermission();
    // La empresa se lee de localStorage: hacerlo durante el render provoca un
    // desajuste de hidratación (SSR no tiene acceso a localStorage).
    const [company, setCompany] = useState<ReturnType<typeof getSelectedCompany>>(
        null
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompany(getSelectedCompany());
    }, []);

    const [rows, setRows] = useState<DailyClosing[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selected, setSelected] = useState<DailyClosing | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<DailyClosingQueryParams>({
        page: 1,
        limit: 10,
    });
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = useForm<DailyClosingForm>({
        resolver: zodResolver(dailyClosingSchema),
        defaultValues: {
            company_id: company?.id ?? "",
            closing_date: todayLocal(),
        },
    });

    useEffect(() => {
        reset({
            company_id: company?.id ?? "",
            closing_date: todayLocal(),
        });
    }, [company?.id, reset]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await dailyClosingService.getAll({
                ...filter,
                status: status || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            });
            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al listar los cierres diarios");
            }
            setRows(response.data.data ?? []);
            setMeta(response.data.meta ?? null);
        } catch (error) {
            showToast(
                getDailyClosingErrorMessage(error, "No se pudieron cargar los cierres diarios"),
                "error",
                4000
            );
        } finally {
            setLoading(false);
        }
    }, [filter, status, dateFrom, dateTo]);

    useEffect(() => {
        // Carga inicial desde la API: el estado se actualiza de forma
        // asíncrona, no sincrónicamente dentro del effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchData();
    }, [fetchData]);

    const onSubmit = handleSubmit(async (form) => {
        if (!company?.id) {
            showToast("No hay una empresa seleccionada", "error");
            return;
        }

        const selectedDate = getValues("closing_date");
        const duplicate = rows.some(
            (row) =>
                row.company_id === company.id &&
                row.closing_date?.slice(0, 10) === selectedDate
        );

        if (duplicate) {
            showToast(
                "Ya existe un cierre para esta fecha y empresa",
                "info",
                4000
            );
            return;
        }

        setSubmitting(true);
        try {
            const response = await dailyClosingService.open({
                ...form,
                company_id: company.id,
            });
            showToast("Cierre diario generado correctamente", "success");
            setSelected(response.data);
            await fetchData();
        } catch (error) {
            showToast(
                getDailyClosingErrorMessage(error, "No se pudo generar el cierre diario"),
                "error",
                5000
            );
        } finally {
            setSubmitting(false);
        }
    });

    const handleClose = async (id: string) => {
        setSubmitting(true);
        try {
            const response = await dailyClosingService.close(id);
            showToast("Cierre del día finalizado correctamente", "success");
            setSelected(response.data);
            await fetchData();
        } catch (error) {
            showToast(
                getDailyClosingErrorMessage(error, "No se pudo cerrar el día"),
                "error",
                5000
            );
        } finally {
            setSubmitting(false);
        }
    };

    // El guard del backend original exige `daily-closings.open`.
    const canOpen = can("daily-closings.open");
    const canClose = can("daily-closings.close");
    const selectedSummary = selected?.summary_json;

    const salesByMethod = useMemo(
        () => getDailyClosingSalesByMethod(selectedSummary),
        [selectedSummary]
    );
    const collectionsByMethod = useMemo(
        () => getDailyClosingCollectionsByMethod(selectedSummary),
        [selectedSummary]
    );
    const currencies = useMemo(
        () => getDailyClosingCurrencies(selectedSummary),
        [selectedSummary]
    );

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold dark:text-yellow-300">
                        Cierre diario
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen de ventas, créditos y cobros por empresa y fecha.
                    </p>
                </div>
                <Button variant="outline" onClick={() => void fetchData()} disabled={loading}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualizar
                </Button>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                <form
                    onSubmit={onSubmit}
                    className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-5"
                >
                    <div>
                        <h2 className="text-sm font-semibold">Generar cierre</h2>
                        <p className="text-xs text-muted-foreground">
                            {company?.name ?? "No hay empresa seleccionada"}
                        </p>
                    </div>

                    <input type="hidden" {...register("company_id")} />

                    <div className="flex flex-col gap-1">
                        <label htmlFor="closing_date" className="text-sm">
                            Fecha del cierre
                        </label>
                        <input
                            id="closing_date"
                            type="date"
                            {...register("closing_date")}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        />
                        {errors.closing_date && (
                            <p className="text-[13px] text-red-500">
                                {errors.closing_date.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            submitting ||
                            !company?.id ||
                            !permissionsLoaded ||
                            !canOpen
                        }
                    >
                        <CalendarDays className="mr-2 size-4" />
                        {submitting ? "Generando..." : "Generar cierre"}
                    </Button>

                    {!company?.id && (
                        <p className="text-xs text-amber-600">
                            Selecciona una empresa para generar el cierre.
                        </p>
                    )}
                    {permissionsLoaded && !canOpen && (
                        <p className="text-xs text-red-600">
                            No tienes permiso para generar cierres diarios.
                        </p>
                    )}
                </form>

                <section className="rounded-2xl border bg-card">
                    <div className="flex flex-wrap items-end gap-3 border-b px-5 py-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="daily-status" className="text-xs text-muted-foreground">
                                Estado
                            </label>
                            <select
                                id="daily-status"
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setFilter((prev) => ({ ...prev, page: 1 }));
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value={daily_closing_status.open}>Abierto</option>
                                <option value={daily_closing_status.closed}>Cerrado</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="date-from" className="text-xs text-muted-foreground">
                                Desde
                            </label>
                            <input
                                id="date-from"
                                type="date"
                                value={dateFrom}
                                onChange={(event) => {
                                    setDateFrom(event.target.value);
                                    setFilter((prev) => ({ ...prev, page: 1 }));
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="date-to" className="text-xs text-muted-foreground">
                                Hasta
                            </label>
                            <input
                                id="date-to"
                                type="date"
                                value={dateTo}
                                onChange={(event) => {
                                    setDateTo(event.target.value);
                                    setFilter((prev) => ({ ...prev, page: 1 }));
                                }}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead className="text-right">Ventas</TableHead>
                                    <TableHead className="text-right">Crédito</TableHead>
                                    <TableHead className="text-right">Cobrado</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No hay cierres para los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{formatDate(row.closing_date)}</TableCell>
                                            <TableCell>
                                                {row.companies?.name ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(row.total_sales)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(row.total_credit)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(row.total_collected)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                        row.status === daily_closing_status.closed
                                                            ? "bg-muted text-muted-foreground"
                                                            : "bg-emerald-500/15 text-emerald-700"
                                                    }`}
                                                >
                                                    {row.status === daily_closing_status.closed
                                                        ? "Cerrado"
                                                        : "Abierto"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelected(row)}
                                                    >
                                                        Ver
                                                    </Button>
                                                    {row.status === daily_closing_status.open && canClose && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={submitting}
                                                            onClick={() => void handleClose(row.id)}
                                                        >
                                                            Cerrar día
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end gap-2 px-5 py-3 text-sm">
                        <span className="mr-2 text-muted-foreground">
                            Página {filter.page ?? 1} de {meta?.totalPages ?? 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(filter.page ?? 1) <= 1}
                            onClick={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    page: (prev.page ?? 1) - 1,
                                }))
                            }
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(filter.page ?? 1) >= (meta?.totalPages ?? 1)}
                            onClick={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    page: (prev.page ?? 1) + 1,
                                }))
                            }
                        >
                            Siguiente
                        </Button>
                    </div>
                </section>
            </div>

            {selected && (
                <section className="rounded-2xl border bg-card p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Resumen del cierre {formatDate(selected.closing_date)}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {selected.companies?.name ?? "—"} · {selected.users?.name ?? "—"}
                            </p>
                        </div>
                        {selected.status === daily_closing_status.closed && (
                            <span className="flex items-center gap-1 text-sm text-emerald-600">
                                <CheckCircle2 className="size-4" /> Cerrado
                            </span>
                        )}
                    </div>

                    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Total ventas</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(selected.total_sales)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Total crédito</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(selected.total_credit)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Total cobrado</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(selected.total_collected)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Ventas al contado</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(selectedSummary?.total_cash)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">N.º de ventas</p>
                            <p className="text-lg font-semibold">
                                {selectedSummary?.total_sales_count ?? 0}
                            </p>
                        </div>
                    </div>

                    {salesByMethod.length === 0 &&
                    collectionsByMethod.length === 0 &&
                    currencies.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No hay resumen de pagos registrado.
                        </p>
                    ) : (
                        <>
                            <SummaryTable
                                title="Ventas por método de pago"
                                rows={salesByMethod}
                                emptyMessage="No hay ventas con método de pago registrado."
                            />
                            <SummaryTable
                                title="Cobranzas por cuenta/método"
                                rows={collectionsByMethod}
                                emptyMessage="No hay cobranzas registradas."
                            />
                            <SummaryTable
                                title="Ventas por moneda"
                                rows={currencies}
                                emptyMessage="No hay ventas por moneda registradas."
                            />
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
