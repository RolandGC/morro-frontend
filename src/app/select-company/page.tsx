
'use client';

import React, { useEffect, useState } from 'react';
import { companyService } from '@/modules/core/companies/services/company.service';
import { saveAuthToken } from '@/modules/auth/helpers';
import { useRouter } from 'next/navigation';
import { Company } from '@/modules/core/companies/types/company.type';

export default function CompaniesPage() {
    const router = useRouter();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getAllCompanies();
                const data: Company[] = response.data.data;

                // Solo considerar empresas activas
                const activeCompanies = data.filter(
                    (company) => company.is_active
                );

                setCompanies(activeCompanies);

                if (activeCompanies.length === 0) {
                    setError('No tienes empresas activas disponibles.');
                    return;
                }

                // Si solo tiene una empresa, seleccionarla automáticamente
                if (activeCompanies.length === 1) {
                    await handleSelectCompany(activeCompanies[0]);
                }
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar las empresas');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleSelectCompany = async (company: Company) => {
        setSelecting(true);
        setError('');

        try {
            const response = await companyService.selectCompany(company.id);

            if (response.status === 200 || response.status === 201) {
                localStorage.setItem(
                    'selected_company',
                    JSON.stringify(company)
                );

                saveAuthToken(response.data.access_token);

                router.replace('/dashboard');
                return;
            }

            setError('No se pudo seleccionar la empresa');
        } catch (err) {
            console.error('Error al seleccionar empresa:', err);
            setError('No se pudo seleccionar la empresa');
        } finally {
            setSelecting(false);
        }
    };

    if (loading || selecting) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">
                    {selecting
                        ? 'Ingresando a la empresa...'
                        : 'Cargando empresas...'}
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
                        Seleccionar empresa
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Tienes varias empresas. Selecciona una para continuar.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => handleSelectCompany(company)}
                            disabled={selecting}
                            className="
                                bg-white rounded-2xl border border-gray-200
                                p-6 text-left shadow-sm transition-all
                                hover:shadow-xl hover:-translate-y-1
                                hover:border-blue-500 group
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="
                                    w-14 h-14 rounded-xl bg-blue-100
                                    flex items-center justify-center
                                    text-blue-600 text-xl font-bold
                                ">
                                    {company.name.charAt(0).toUpperCase()}
                                </div>

                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    Activo
                                </span>
                            </div>

                            <h2 className="
                                text-xl font-semibold text-gray-800
                                group-hover:text-blue-600 transition-colors
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
                                    <span className="font-medium">Dirección:</span>{' '}
                                    {company.address}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center text-blue-600 font-medium">
                                Seleccionar
                                <span className="ml-2 transition-transform group-hover:translate-x-1">
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