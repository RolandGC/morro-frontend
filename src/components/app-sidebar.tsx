"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, Banknote, Truck, AudioLinesIcon, TerminalIcon, BriefcaseIcon, Store, Package, Shield, FrameIcon, PieChartIcon, MapIcon, ChartColumn, ShoppingCart } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { useAuthStore } from "@/modules/auth/store/authStore"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
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
          title: "Usuarios",
          url: "/core/users",
          permission: "users.read",
        },
        {
          title: "Almacenes",
          url: "/core/warehouses",
          permission: "warehouses.read",
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
          permission: "accounts.read",
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
          url: "#",
          permission: "accounts.read",
        },
        {
          title: "Compras",
          url: "#",
          permission: "accounts.read",
        },
        {
          title: "Caja",
          url: "#",
          permission: "accounts.read",
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
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <TeamSwitcher teams={data.teams} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
