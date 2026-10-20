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
    finance: "Finanzas",
    security: "Seguridad",
    inventory: "Inventario",
    purchases: "Compras",
    companies: "Empresas",
    users: "Usuarios",
    products: "Productos",
    reports: "Reportes",
    ventas: "Ventas",
    inventario: "Inventario",
    cobranzas: "Cobranzas",
    pagos: "Pagos",
};

export function AppBreadcrumb() {
    const pathname = usePathname();

    const segments = pathname.split("/").filter(Boolean);

    // Evitar duplicar Dashboard si ya forma parte de la ruta
    const remainingSegments =
        segments[0] === "dashboard" ? segments.slice(1) : segments;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* Dashboard siempre al inicio */}
                <BreadcrumbItem>
                    {remainingSegments.length === 0 ? (
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>

                {remainingSegments.map((segment, index) => {
                    const href = "/" + segments
                        .slice(0, segments.indexOf(segment) + 1)
                        .join("/");

                    const isLast = index === remainingSegments.length - 1;

                    const name =
                        routeNames[segment] ??
                        segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <div key={`${href}-${index}`} className="flex items-center gap-2">
                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{name}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={href}>{name}</Link>
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