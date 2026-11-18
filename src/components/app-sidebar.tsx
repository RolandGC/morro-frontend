"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { CompanySwitcher } from "@/components/company-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Banknote, Truck, BriefcaseIcon, Store, Package, Shield, ChartColumn } from "lucide-react"
import { useAuthStore } from "@/modules/auth/store/authStore"

const data = {
  navMain: [
    {
      title: "Administración",
      url: "#",
      icon: <BriefcaseIcon />,
      items: [
        {
          title: "Empresas",
          url: "/core/companies",
          permission: "companies.read",
        },
        {
          title: "Almacenes",
          url: "/core/warehouses",
          permission: "warehouses.read",
        },
        {
          title: "Usuarios",
          url: "/core/users",
          permission: "users.read",
        },
        {
          title: "Series",
          url: "/core/series",
          permission: "companies.read",
        },
      ],
    },

    {
      title: "Ventas",
      url: "#",
      icon: <Store />,
      items: [
        {
          title: "Ventas",
          url: "/sales/sale",
          permission: "sales.read",
        },
        {
          title: "Clientes",
          url: "/sales/customers",
          permission: "customers.read",
        },
      ],
    },

    {
      title: "Compras",
      url: "#",
      icon: <Truck />,
      items: [
        {
          title: "Compras",
          url: "/purchases/purchase",
          permission: "purchases.read",
        },
        {
          title: "Proveedores",
          url: "/purchases/suppliers",
          permission: "suppliers.read",
        },
      ],
    },

    {
      title: "Inventario",
      url: "#",
      icon: <Package />,
      items: [
        {
          title: "Productos",
          url: "/inventory/products",
          permission: "products.read",
        },
        {
          title: "Marcas",
          url: "/inventory/brands",
          permission: "brands.read",
        },
        {
          title: "Categorías",
          url: "/inventory/category",
          permission: "categories.read",
        },
        {
          title: "Inventario físico",
          url: "/inventory/physical_inventory",
          permission: "brands.read",
        },
        {
          title: "Unidad de productos",
          url: "/inventory/product_unit",
          permission: "product-units.read",
        },
        {
          title: "Ajuste Stock",
          url: "#",
          permission: "stock-adjustments.read",
        },
      ],
    },

    {
      title: "Finanzas",
      url: "#",
      icon: <Banknote />,
      items: [
        {
          title: "Monedas",
          url: "/finance/currencies",
          permission: "currencies.read",
        },
        {
          title: "Caja",
          url: "/finance/cashbox",
          permission: "cash-sessions.read",
        },
        {
          title: "Cuentas",
          url: "/finance/account",
          permission: "payment-accounts.read",
        },
      ],
    },
    {
      title: "Reportes",
      url: "#",
      icon: (
        <ChartColumn
        />
      ),
      items: [
        {
          title: "Ventas",
          url: "/reports/ventas",
          permission: "reports.read",
        },
        {
          title: "Inventario",
          url: "/reports/inventario",
          permission: "reports.read",
        },
        {
          title: "Cobranzas",
          url: "/reports/cobranzas",
          permission: "reports.read",
        },
        {
          title: "Pagos",
          url: "/reports/pagos",
          permission: "reports.export",
        },
      ],
    },
    {
      title: "Seguridad",
      url: "#",
      icon: <Shield />,
      items: [
        {
          title: "Roles y permisos",
          url: "/security/roles",
          permission: "roles.read",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <CompanySwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
