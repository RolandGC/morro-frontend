"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currentMonthRange,
  last7DaysRange,
  last30DaysRange,
  previousMonthRange,
  todayRange,
  type DateRange,
} from "../utils/date";

export interface ReportFilterValue {
  from: string;
  to: string;
  warehouseId?: string;
}

interface ReportFiltersProps {
  value: ReportFilterValue;
  onChange: (value: ReportFilterValue) => void;
  warehouses?: { id: string; name: string }[];
  showDates?: boolean;
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: "Hoy", range: todayRange },
  { label: "7 días", range: last7DaysRange },
  { label: "30 días", range: last30DaysRange },
  { label: "Mes actual", range: currentMonthRange },
  { label: "Mes anterior", range: previousMonthRange },
];

export default function ReportFilters({
  value,
  onChange,
  warehouses = [],
  showDates = true,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        {showDates ? (
          <>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="report-from"
              >
                Desde
              </label>
              <Input
                id="report-from"
                type="date"
                className="w-40"
                value={value.from}
                onChange={(event) =>
                  onChange({ ...value, from: event.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor="report-to"
              >
                Hasta
              </label>
              <Input
                id="report-to"
                type="date"
                className="w-40"
                value={value.to}
                onChange={(event) =>
                  onChange({ ...value, to: event.target.value })
                }
              />
            </div>
          </>
        ) : null}

        {warehouses.length > 0 ? (
          <div className="flex w-56 flex-col gap-1">
            <label className="text-xs text-muted-foreground">Almacén</label>
            <Select
              value={value.warehouseId ?? "all"}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  warehouseId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los almacenes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los almacenes</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {showDates ? (
          <div className="ml-auto flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...value, ...preset.range() })}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
