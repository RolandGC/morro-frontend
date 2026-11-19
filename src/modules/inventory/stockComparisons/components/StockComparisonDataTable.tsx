"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

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
import { ClipboardList } from "lucide-react";
import SimpleSelector from "@/components/SimpleSelector";

import type {
    StockComparison,
    StockComparisonsQueryParams,
} from "../types/stockComparisons.type";

interface SelectOption {
    id: string;
    name: string;
}

interface StockComparisonDataTableProps {
    columns: ColumnDef<StockComparison, unknown>[];
    data: StockComparison[];
    filter: StockComparisonsQueryParams;
    handleFilter: <K extends keyof StockComparisonsQueryParams>(
        key: K,
        value: StockComparisonsQueryParams[K]
    ) => void;
    totalPages: number;
    totalRecords: number;
    warehouseOptions: SelectOption[];
    userOptions: SelectOption[];
    isFiltering?: boolean;
}

const ALL = "all";

export function StockComparisonDataTable({
    columns,
    data,
    filter,
    handleFilter,
    totalPages,
    totalRecords,
    warehouseOptions,
    userOptions,
    isFiltering = false,
}: StockComparisonDataTableProps) {
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
        handleFilter("created_by", undefined);
        handleFilter("date_from", undefined);
        handleFilter("date_to", undefined);
        handleFilter("page", 1);
    };

    const hasFilters = Boolean(
        filter.warehouse_id ||
            filter.created_by ||
            filter.date_from ||
            filter.date_to
    );

    return (
        <div>
            <div className="flex flex-col gap-3 py-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

                    <SimpleSelector
                        label="Creado por"
                        options={[
                            { id: ALL, name: "Todos los usuarios" },
                            ...userOptions,
                        ]}
                        value={filter.created_by ?? ALL}
                        onSelect={(id) =>
                            handleFilter(
                                "created_by",
                                id === ALL ? undefined : id
                            )
                        }
                    />

                    <div className="flex flex-col gap-1">
                        <label htmlFor="date_from" className="text-sm">
                            Desde
                        </label>
                        <Input
                            id="date_from"
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
                        <label htmlFor="date_to" className="text-sm">
                            Hasta
                        </label>
                        <Input
                            id="date_to"
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
                                        title="No hay comparaciones registradas"
                                        description="Ajusta los filtros o registra una nueva comparación de stock."
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
