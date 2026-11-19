"use client";

import * as React from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ClipboardList, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import SimpleSelector from "@/components/SimpleSelector";

import type {
    StockAdjustment,
    StockAdjustmentQueryParams,
} from "../types/stockAdjustment.type";

interface SelectOption {
    id: string;
    name: string;
}

interface StockAdjustmentDataTableProps {
    columns: ColumnDef<StockAdjustment, unknown>[];
    data: StockAdjustment[];
    filter: StockAdjustmentQueryParams;
    handleFilter: <K extends keyof StockAdjustmentQueryParams>(
        key: K,
        value: StockAdjustmentQueryParams[K]
    ) => void;
    totalPages: number;
    totalRecords: number;
    warehouseOptions: SelectOption[];
    isFiltering?: boolean;
}

const ALL = "all";

export function StockAdjustmentDataTable({
    columns,
    data,
    filter,
    handleFilter,
    totalPages,
    totalRecords,
    warehouseOptions,
    isFiltering = false,
}: StockAdjustmentDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const clearFilters = () => {
        handleFilter("warehouse_id", undefined);
        handleFilter("date_from", undefined);
        handleFilter("date_to", undefined);
        handleFilter("page", 1);
    };

    const hasFilters = Boolean(
        filter.warehouse_id || filter.date_from || filter.date_to
    );

    return (
        <div>
            <div className="flex flex-col gap-3 py-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                    <SimpleSelector
                        label="Almacén"
                        options={[
                            { id: ALL, name: "Todos los almacenes" },
                            ...warehouseOptions,
                        ]}
                        value={filter.warehouse_id ?? ALL}
                        onSelect={(id) =>
                            handleFilter(
                                "warehouse_id",
                                id === ALL ? undefined : id
                            )
                        }
                    />

                    <div className="flex flex-col gap-1">
                        <label htmlFor="adjustment_date_from" className="text-sm">
                            Desde
                        </label>
                        <Input
                            id="adjustment_date_from"
                            type="date"
                            value={filter.date_from ?? ""}
                            onChange={(event) =>
                                handleFilter(
                                    "date_from",
                                    event.target.value || undefined
                                )
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="adjustment_date_to" className="text-sm">
                            Hasta
                        </label>
                        <Input
                            id="adjustment_date_to"
                            type="date"
                            value={filter.date_to ?? ""}
                            onChange={(event) =>
                                handleFilter(
                                    "date_to",
                                    event.target.value || undefined
                                )
                            }
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                        >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            Limpiar
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Columnas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isFiltering && (
                <p className="mb-2 text-xs text-muted-foreground">
                    Actualizando resultados...
                </p>
            )}

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="font-bold"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <EmptyState
                                        compact
                                        icon={ClipboardList}
                                        title="No hay ajustes registrados"
                                        description="Ajusta los filtros o registra un nuevo ajuste de stock."
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col items-center justify-end gap-2 py-4 sm:flex-row">
                <span className="mr-2 text-sm text-muted-foreground">
                    Total: {totalRecords.toLocaleString("es-PE")} registros
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        handleFilter("page", (filter.page ?? 1) - 1)
                    }
                    disabled={(filter.page ?? 1) <= 1}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        handleFilter("page", (filter.page ?? 1) + 1)
                    }
                    disabled={(filter.page ?? 1) >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
