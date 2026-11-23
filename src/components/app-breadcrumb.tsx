"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeNames: Record<string, string> = {
    dashboard: "Dashboard",
    core: "Administración",
    sales: "Ventas",
    sale: "Ventas",
    add: "Nueva venta",
    payments: "Pago",
    customers: "Clientes",
    finance: "Finanzas",
    security: "Seguridad",
    inventory: "Inventario",
    purchases: "Compras",
    companies: "Empresas",
    users: "Usuarios",
    products: "Productos",
    brands: "Marcas",
    category: "Categorías",
    product_unit: "Unidades",
    reports: "Reportes",
    billing: "Facturación",
    sunat: "Facturación electrónica",
    settings: "Configuración de facturación",
    ventas: "Ventas",
    inventario: "Inventario",
    cobranzas: "Cobranzas",
    pagos: "Pagos",
    warehouses: "Almacenes",
    series: "Series",
    suppliers: "Proveedores",
    purchase: "Compras",
    currencies: "Monedas",
    cashbox: "Caja",
    "daily-closings": "Cierre diario",
    account: "Cuentas",
    roles: "Roles y permisos",
};

function humanize(segment: string) {
    if (routeNames[segment]) return routeNames[segment];

    // Evita mostrar ids (uuid, números) en la ruta
    if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
        return "Detalle";
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppBreadcrumb() {
    const pathname = usePathname();

    const segments = pathname.split("/").filter(Boolean);

    const items = segments
        .map((segment, index) => ({
            segment,
            name: humanize(segment),
            href: "/" + segments.slice(0, index + 1).join("/"),
        }))
        // "sales/sale" y similares producen dos veces el mismo nombre
        .filter(
            (item, index, list) =>
                index === 0 || item.name !== list[index - 1].name
        );

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    {items.length === 0 ? (
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <div
                            key={`${item.href}-${index}`}
                            className="flex items-center gap-2"
                        >
                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
