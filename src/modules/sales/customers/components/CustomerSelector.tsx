"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InputSearch from "@/components/InputSearch";
import { Customer } from "../../customers/types/customer.type";
import { customerService } from "../../customers/services/customer.service";
import { X } from "lucide-react";

interface CustomerSelectorProps {
    currentCustomerId?: string;
    onSelect: (customer: Customer) => void;
    onCancel?: () => void;
}

export default function CustomerSelector({
    currentCustomerId,
    onSelect,
    onCancel,
}: CustomerSelectorProps) {
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCustomers = async (search = "") => {
        try {
            setLoading(true);

            const value = search.trim();
            const isDocument = /^\d+$/.test(value);

            const response = await customerService.getAll({
                full_name: isDocument ? "" : value,
                doc_number: isDocument ? value : "",
                is_active: true,
                page: 1,
                limit: 10,
            });

            if (response.status === 200) {
                setCustomerResults(
                    (response.data?.data ?? []).filter(
                        (customer: Customer) =>
                            customer.id !== currentCustomerId
                    )
                );
            } else {
                setCustomerResults([]);
            }
        } catch (error) {
            console.error("Error obteniendo clientes:", error);
            setCustomerResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const value = customerSearch.trim();

        if (!value) {
            setCustomerResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetchCustomers(value);
        }, 300);

        return () => clearTimeout(timeout);
    }, [customerSearch]);

    const results = customerResults.map((customer) => ({
        id: customer.id,
        label: `${customer.full_name} - ${customer.doc_number ?? "Sin documento"}`,
    }));

    const handleSelect = (customer: { id: string }) => {
        const selected = customerResults.find(
            (result) => result.id === customer.id
        );

        if (!selected) return;

        onSelect(selected);
        setCustomerSearch("");
        setCustomerResults([]);
    };

    return (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3">
                <p className="font-semibold">Cambiar cliente</p>

                <p className="text-sm text-muted-foreground">
                    Busca al cliente por nombre o número de documento.
                </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                    <InputSearch
                        placeholder={
                            loading
                                ? "Buscando clientes..."
                                : "Buscar por nombre o documento..."
                        }
                        value={customerSearch}
                        results={results}
                        onChange={setCustomerSearch}
                        onSelect={handleSelect}
                    />
                </div>

                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                )}
            </div>
        </div>
    );
}