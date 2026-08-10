'use client';

import { Button } from "@/components/ui/button";
import { CustomerDataTable } from "@/modules/sales/customers/components/CustomerDataTable";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { useCustomerStore } from "@/modules/sales/customers/store/customer.store";
import { Customer, CustomerQueryParams } from "@/modules/sales/customers/types/customer.type";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import CustomerFormModal from "@/modules/sales/customers/components/CustomerFormModal";
import { Spinner } from "@/components/Spinner";

export default function Clients() {
    const [data, setData] = useState<Customer[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const {openCreate} = useCustomerStore()

    const [customerFilter, setCustomerFilter] = useState<CustomerQueryParams>({
        full_name: '',
        email: '',
        is_active: true,
        page: 1,
        limit: 10,
        //order: "asc",
    });
    const handleFilter = <K extends keyof CustomerQueryParams>(
        key: K,
        value: CustomerQueryParams[K]
    ) => {
        setCustomerFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const fetchData = async () => {
        const isInitial = loading;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setFilterLoading(true);
            }
            const response = await customerService.getAll(customerFilter);
            if (response.status === 200) {
                setData(response.data.data);
                setPages(response.data.meta);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setFilterLoading(false);
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [customerFilter?.full_name, customerFilter?.page]);

    if (loading) {
        return (
            <div className="container mx-auto py-4 px-2">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Clientes</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Cliente</Button>
            </div>
                <CustomerDataTable
                    columns={getColumns({fetchData})}
                    data={data}
                    filter={customerFilter}
                    handleFilter={handleFilter}
                    totalPages={pages?.totalPages ?? 1}
                />
            <CustomerFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />
        </div>
    );
}