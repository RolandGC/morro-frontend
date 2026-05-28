'use client';

import React, { useEffect, useState } from 'react';
import CompanyService from '@/modules/companies/services/company.service';
import { UserCompany } from '@/modules/userCompany/types/userCompany.types';

export default function CompaniesPage() {
    const companyService = new CompanyService();

    const [companies, setCompanies] = useState<UserCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getAllCompanies();

                console.log(response.data);

                // 👇 Aquí está la corrección
                setCompanies(response.data.data);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar las empresas');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleSelectCompany = (company: UserCompany) => {
        console.log('Empresa seleccionada:', company);

        // router.push(`/dashboard/${company.id}`)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">
                    Cargando empresas...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Seleccionar Empresa
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Selecciona una empresa para continuar
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => handleSelectCompany(company)}
                            className="
                                bg-white
                                rounded-2xl
                                border border-gray-200
                                p-6
                                text-left
                                shadow-sm
                                transition-all
                                hover:shadow-xl
                                hover:-translate-y-1
                                hover:border-blue-500
                                group
                            "
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="
                                    w-14 h-14
                                    rounded-xl
                                    bg-blue-100
                                    flex items-center justify-center
                                    text-blue-600
                                    text-xl
                                    font-bold
                                ">
                                    {company.name.charAt(0).toUpperCase()}
                                </div>

                                <span className={`
                                    text-xs px-2 py-1 rounded-full
                                    ${company.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'}
                                `}>
                                    {company.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <h2 className="
                                text-xl font-semibold text-gray-800
                                group-hover:text-blue-600
                                transition-colors
                            ">
                                {company.name}
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                {company.trade_name}
                            </p>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">RUC:</span>{' '}
                                    {company.ruc}
                                </p>

                                <p>
                                    <span className="font-medium">Tel:</span>{' '}
                                    {company.phone}
                                </p>

                                <p className="line-clamp-2">
                                    <span className="font-medium">
                                        Dirección:
                                    </span>{' '}
                                    {company.address}
                                </p>
                            </div>

                            <div className="
                                mt-6
                                flex items-center
                                text-blue-600
                                font-medium
                            ">
                                Seleccionar
                                <span className="
                                    ml-2
                                    transition-transform
                                    group-hover:translate-x-1
                                ">
                                    →
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}