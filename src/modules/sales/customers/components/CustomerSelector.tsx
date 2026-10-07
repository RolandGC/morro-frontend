"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import InputSearch from "@/components/InputSearch";
import { Customer } from "../../customers/types/customer.type";
import { customerService } from "../../customers/services/customer.service";
import { Check, Loader2, X } from "lucide-react";

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

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            const response = await customerService.getAll({
                is_active: true,
            });

            if (response.status === 200) {
                setCustomerResults(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching Customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const results = customerResults
        .filter((customer) =>
            customer.full_name
                .toLowerCase()
                .includes(customerSearch.toLowerCase())
        )
        .map((customer) => ({
            id: customer.id,
            label: customer.full_name,
        }));

    return (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3">
                <p className="font-semibold">
                    Cambiar cliente
                </p>

                <p className="text-sm text-muted-foreground">
                    Busca y selecciona el cliente que deseas asociar
                    a esta boleta.
                </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                    <InputSearch
                        placeholder={
                            loading
                                ? "Cargando clientes..."
                                : "Buscar cliente..."
                        }
                        value={customerSearch}
                        results={results}
                        onChange={(value) => {
                            setCustomerSearch(value);
                        }}
                        onSelect={(customer) => {
                            const selected = customerResults.find(
                                (result) => result.id === customer.id
                            );

                            if (!selected) return;

                            onSelect(selected);
                        }}
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