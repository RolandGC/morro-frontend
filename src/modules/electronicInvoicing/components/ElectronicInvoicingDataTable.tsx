"use client";

import * as React from "react";
import {
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
import { ClipboardList, RotateCcw, Search, Send } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SimpleSelector from "@/components/SimpleSelector";

import { getElectronicInvoicingColumns } from "./columns";
import type {
  ElectronicDocument,
  ElectronicDocumentQueryParams,
} from "../types/electronicInvoicing.types";
import {
  formatDocumentNumber,
  getDocumentTypeLabel,
} from "../utils/electronicInvoicingFormat";

const ALL = "all";
export const MAX_BATCH_SELECTION = 50;

interface ElectronicInvoicingDataTableProps {
  data: ElectronicDocument[];
  filter: ElectronicDocumentQueryParams;
  handleFilter: <K extends keyof ElectronicDocumentQueryParams>(
    key: K,
    value: ElectronicDocumentQueryParams[K]
  ) => void;
  totalPages: number;
  totalRecords: number;
  isFiltering?: boolean;
  canSend: boolean;
  sendingId: string | null;
  onDetail: (id: string) => void;
  onSend: (document: ElectronicDocument) => void;
  sendingBatch: boolean;
  onSendBatch: (ids: string[]) => Promise<boolean>;
}

export function ElectronicInvoicingDataTable({
  data,
  filter,
  handleFilter,
  totalPages,
  totalRecords,
  isFiltering = false,
  canSend,
  sendingId,
  onDetail,
  onSend,
  sendingBatch,
  onSendBatch,
}: ElectronicInvoicingDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [localSearch, setLocalSearch] = React.useState("");

  const filteredData = React.useMemo(() => {
    const query = localSearch.trim().toLocaleLowerCase("es-PE");
    if (!query) return data;

    return data.filter((document) => {
      const values = [
        document.series,
        String(document.number ?? ""),
        formatDocumentNumber(document.series, document.number),
        document.document_type,
        getDocumentTypeLabel(document.document_type),
        document.customer?.name,
        document.customer?.doc_number,
        document.voucher?.series,
        document.voucher?.number === null || document.voucher?.number === undefined
          ? ""
          : String(document.voucher.number),
      ];

      return values.some((value) =>
        value?.toLocaleLowerCase("es-PE").includes(query)
      );
    });
  }, [data, localSearch]);

  const columns = React.useMemo(
    () =>
      getElectronicInvoicingColumns({
        canSend,
        sendingId,
        onDetail,
        onSend,
      }),
    [canSend, sendingId, onDetail, onSend]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => {
      if (!row.original.sendable) return false;
      if (row.getIsSelected()) return true;
      const selectedCount = Object.values(rowSelection).filter(Boolean).length;
      return selectedCount < MAX_BATCH_SELECTION;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  React.useEffect(() => {
    setRowSelection({});
  }, [data, filter.page, localSearch]);

  const clearFilters = () => {
    setLocalSearch("");
    handleFilter("kind", "all");
    handleFilter("status", "all");
    handleFilter("date_from", undefined);
    handleFilter("date_to", undefined);
    handleFilter("page", 1);
  };

  const hasFilters = Boolean(
    localSearch.trim() ||
      (filter.kind && filter.kind !== ALL) ||
      (filter.status && filter.status !== ALL) ||
      filter.date_from ||
      filter.date_to
  );

  const handleSendBatch = async () => {
    if (!canSend || selectedIds.length === 0 || sendingBatch) return;
    const success = await onSendBatch(selectedIds);
    if (success) setRowSelection({});
  };

  return (
    <div>

        <div className="flex min-w-0 flex-col gap-4 py-4">
          {/* FILTROS */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {/* Búsqueda */}
            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
              <label htmlFor="electronic_local_search" className="text-sm">
                Búsqueda local
              </label>

              <div className="relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="electronic_local_search"
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                  placeholder="Serie/número, cliente o RUC/DNI"
                  className="w-full min-w-0 pl-8"
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                Filtra solo los registros de la página actual.
              </p>
            </div>

            {/* Tipo */}
            <div className="min-w-0">
              <SimpleSelector
                label="Tipo de comprobante"
                options={[
                  { id: ALL, name: "Todos los tipos" },
                  { id: "boleta", name: "Boleta" },
                  { id: "factura", name: "Factura" },
                ]}
                value={filter.kind ?? ALL}
                onSelect={(id) =>
                  handleFilter(
                    "kind",
                    id === ALL ? "all" : (id as "boleta" | "factura")
                  )
                }
              />
            </div>

            {/* Estado */}
            <div className="min-w-0">
              <SimpleSelector
                label="Estado SUNAT"
                options={[
                  { id: ALL, name: "Todos los estados" },
                  { id: "not_sent", name: "Sin enviar" },
                  { id: "pending", name: "En proceso" },
                  { id: "accepted", name: "Aceptado" },
                  { id: "rejected", name: "Rechazado" },
                  { id: "contingency", name: "Contingencia" },
                ]}
                value={filter.status ?? ALL}
                onSelect={(id) =>
                  handleFilter(
                    "status",
                    id === ALL
                      ? "all"
                      : (id as ElectronicDocumentQueryParams["status"])
                  )
                }
              />
            </div>

            {/* Fechas */}
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2 xl:col-span-1">
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor="electronic_date_from" className="text-sm">
                  Desde
                </label>

                <Input
                  id="electronic_date_from"
                  type="date"
                  value={filter.date_from ?? ""}
                  onChange={(event) =>
                    handleFilter("date_from", event.target.value || undefined)
                  }
                  className="w-full min-w-0"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor="electronic_date_to" className="text-sm">
                  Hasta
                </label>

                <Input
                  id="electronic_date_to"
                  type="date"
                  value={filter.date_to ?? ""}
                  onChange={(event) =>
                    handleFilter("date_to", event.target.value || undefined)
                  }
                  className="w-full min-w-0"
                />
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="mr-1.5 size-3.5" />
                Limpiar
              </Button>
            )}

            {canSend && (
              <Button
                size="sm"
                disabled={selectedIds.length === 0 || sendingBatch}
                onClick={() => void handleSendBatch()}
                className="max-w-full"
              >
                <Send className="mr-1.5 size-3.5 shrink-0" />
                <span className="truncate">
                  {sendingBatch
                    ? "Enviando..."
                    : `Enviar seleccionados (${selectedIds.length})`}
                </span>
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


      {canSend ? (
        <p className="mb-2 text-xs text-muted-foreground">
          Selecciona hasta {MAX_BATCH_SELECTION} comprobantes enviables por lote.
        </p>
      ) : null}

      {isFiltering ? (
        <p className="mb-2 text-xs text-muted-foreground">
          Actualizando resultados...
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold">
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
                  data-state={row.getIsSelected() && "selected"}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyState
                    compact
                    icon={ClipboardList}
                    title="No hay comprobantes"
                    description="Ajusta los filtros o la búsqueda local para ver otros resultados."
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
          onClick={() => handleFilter("page", (filter.page ?? 1) - 1)}
          disabled={(filter.page ?? 1) <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilter("page", (filter.page ?? 1) + 1)}
          disabled={(filter.page ?? 1) >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
