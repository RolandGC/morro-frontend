"use client"
import * as React from "react"
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
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { SaleQueryParams } from "../types/sale.types"
import InputSearch from "@/components/InputSearch"
import { Customer } from "../../customers/types/customer.type"
import { customerService } from "../../customers/services/customer.service"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filter: SaleQueryParams
    handleFilter: <K extends keyof SaleQueryParams>(
        key: K,
        value: SaleQueryParams[K]
    ) => void;
    totalPages: number;
}

export function SaleDataTable<TData, TValue>({
    columns,
    data,
    filter,
    handleFilter,
    totalPages
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})

    const [rowSelection, setRowSelection] = React.useState({})
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
    })
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState("")
        useState<Customer | null>(null)

    const fetchCustomers = async () => {
        try {

            const response = await customerService.getAll({is_active: true});

            if (response.status === 200) {
                setCustomerResults(response.data.data);
            } else {
                console.error(
                    "Error fetching Customers:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error fetching Customers:", error);
        } finally {
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleClearCustomer = () => {
        setSelectedCustomer(null)

        // Quitamos el customer_id del filtro
        handleFilter("customer_id", "")

        // Volvemos a la primera página
        handleFilter("page", 1)
    }
    return (
        <div>
            <div className="flex items-center py-4">
                {/* <Input
                    placeholder="Filtrar por cliente..."
                    value={filter.customer_id}
                    onChange={(event) => handleFilter("customer_id", event.target.value)}
                    className="max-w-sm"
                /> */}
                <div className="flex items-center gap-2">
                    <InputSearch
                        placeholder="Buscar cliente..."
                        value={customerSearch}
                        results={customerResults
                            .filter((customer) =>
                                customer.full_name
                                    .toLowerCase()
                                    .includes(customerSearch.toLowerCase())
                            )
                            .map((customer) => ({
                                id: customer.id,
                                label: customer.full_name,
                            }))
                        }
                        onChange={(value) => {
                            setCustomerSearch(value)
                        }}
                        onSelect={(customer) => {
                            const selected = customerResults.find(
                                (result) => result.id === customer.id
                            )

                            if (!selected) return

                            setSelectedCustomer(selected)
                            setCustomerSearch(selected.full_name)

                            // AQUÍ recién se filtra
                            handleFilter("customer_id", selected.id)
                            handleFilter("page", 1)
                        }}
                    />

                    {selectedCustomer && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedCustomer(null)
                                setCustomerSearch("")

                                // Eliminamos el filtro
                                handleFilter("customer_id", undefined)
                                handleFilter("page", 1)
                            }}
                        >
                            Borrar
                        </Button>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columnas
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
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
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-white ">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="bg-gray-100 font-bold">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
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
                        handleFilter(
                            "page",
                            (filter.page ?? 1) + 1
                        )
                    }
                    disabled={(filter.page ?? 1) >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}