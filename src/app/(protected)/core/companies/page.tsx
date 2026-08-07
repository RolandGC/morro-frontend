'use client'

import { companyService } from "@/modules/core/companies/services/company.service";
import { Company, CompanyQueryParams } from "@/modules/core/companies/types/company.type";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/modules/core/companies/store/company.store";
import CompanyForm from "@/modules/core/companies/components/CompanyForm";
import { PaginationMeta } from "@/types/types";
import { CompanyDataTable } from "@/modules/core/companies/components/CompanyDataTable";
import { Spinner } from "@/components/Spinner";

export default function CompaniesPage() {
    const [data, setData] = useState<Company[]>([]);
    const { openCreate, company, setCompanies } = useCompanyStore();
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);

    const [companyFilter, setCompanyFilter] = useState<CompanyQueryParams>({
        name: '',
        trade_name: '',
        ruc: '',
        phone: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof CompanyQueryParams>(
        key: K,
        value: CompanyQueryParams[K]
    ) => {
        setCompanyFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };


    const fetchCompanies = async () => {
        const isInitial = initialLoading;

        try {
            if (isInitial) {
                setInitialLoading(true);
            } else {
                setFilterLoading(true);
            }

            const response = await companyService.getAllCompanies(companyFilter);

            if (response.status === 200) {
                setPages(response.data.meta);
                setData(response.data.data);
                setCompanies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            if (isInitial) {
                setInitialLoading(false);
            } else {
                setFilterLoading(false);
            }
        }
    };

    // Primera carga y cambio de página
    useEffect(() => {
        fetchCompanies();
    }, [companyFilter.page]);

    // Búsqueda por nombre con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompanies();
        }, 350);

        return () => clearTimeout(timer);
    }, [companyFilter.name]);

    if (initialLoading) {
        return (
            <div className="container mx-auto py-4 px-2">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 px-2">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Empresas</h1>
                <Button onClick={() => openCreate()}>
                    Crear Empresa
                </Button>
            </div>
            <CompanyDataTable
                columns={getColumns({ fetchCompanies })}
                data={data}
                filter={companyFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
            <CompanyForm
                onSuccess={() => close()}
                fetchCompanies={() => fetchCompanies()}
            />
        </div>
    );
}