'use client'

import { companyService } from "@/modules/core/companies/services/company.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/features/data-table"; 

export default function CompaniesPage() {
    const [data, setData] = useState<Company[]>([]);

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
            <h1 className="text-2xl font-bold">Empresas</h1>
            <DataTable columns={columns} data={data} />
            
        </div>
    );
}