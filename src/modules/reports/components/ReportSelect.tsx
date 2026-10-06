"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ReportSelectOption {
  value: string;
  label: string;
}

interface ReportSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReportSelectOption[];
  allLabel?: string;
  placeholder?: string;
}

export default function ReportSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  placeholder,
}: ReportSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allLabel ? <SelectItem value="all">{allLabel}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
