'use client'

import { companyService } from "@/modules/core/companies/services/company.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/modules/core/companies/store/company.store";
import CompanyForm from "@/modules/core/companies/components/CompanyForm";

export default function CompaniesPage() {
    const [data, setData] = useState<Company[]>([]);
    const { openCreate, company} = useCompanyStore();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getAllCompanies();
                if (response.status === 200) {
                    setData(response.data.data);
                } else {
                    console.error("Error fetching companies:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };

        fetchCompanies();
    }, []);

    return (
        <div className="container mx-auto py-4 px-2">
            <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Empresas</h1>
            <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Empresa</Button>
            </div>
            <DataTable columns={columns} data={data} />
            <CompanyForm onSuccess={() => close()}/>
        </div>
    );
}