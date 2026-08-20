import React from "react";
import { Check, Package } from "lucide-react";
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
    return (
        <button
            type="button"
            onClick={() => onSelect(customer)}
            className="w-full text-left"
        >
            <div
                className={`
                    flex items-center gap-3 rounded-xl border px-3 py-2.5
                    transition
                    ${selected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }
                `}
            >
                {/* Icono */}
                <div
                    className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                        ${selected
                            ? "bg-primary/10"
                            : "bg-orange-50"
                        }
                    `}
                >
                    <Package
                        size={20}
                        className={
                            selected
                                ? "text-primary"
                                : "text-orange-500"
                        }
                    />
                </div>

                {/* Información */}
                <div className="min-w-0 flex-1">
                    <div
                        className={`
                            truncate text-sm font-semibold
                            ${selected
                                ? "text-primary"
                                : "text-gray-800"
                            }
                        `}
                    >
                        {customer.full_name}
                    </div>

                    <div className="mt-0.5 truncate text-xs text-gray-400">
                        {customer.email ?? "Sin correo"}
                    </div>
                </div>

                {/* Check */}
                {selected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={16} strokeWidth={3} />
                    </div>
                )}
            </div>
        </button>
    );
}