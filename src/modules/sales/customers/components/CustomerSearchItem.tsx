import React from "react";
import { Check, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import { Customer } from "../types/customer.type";

interface CustomerSearchItemProps {
    customer: Customer;
    selected?: boolean;
    onSelect: (customer: Customer) => void;
}

export function CustomerSearchItem({
    customer,
    selected = false,
    onSelect,
}: CustomerSearchItemProps) {
    const subtitle =
        customer.doc_number || customer.phone || customer.email || "Sin documento";

    return (
        <button
            type="button"
            onClick={() => onSelect(customer)}
            aria-pressed={selected}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15",
                selected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
            )}
        >
            <span
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                )}
            >
                {selected ? (
                    <UserRound className="size-4" aria-hidden="true" />
                ) : (
                    getInitials(customer.full_name)
                )}
            </span>

            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        "block truncate text-sm font-medium",
                        selected ? "text-primary" : "text-foreground"
                    )}
                >
                    {customer.full_name}
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {subtitle}
                </span>
            </span>

            {selected && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={3} />
                </span>
            )}
        </button>
    );
}
