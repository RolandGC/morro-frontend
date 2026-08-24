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
      icon: (
        <BriefcaseIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Empresas",
          url: "/core/companies",
        },
        {
          title: "Usuarios",
          url: "/core/users",
        },
        {
          title: "Almacenes",
          url: "/core/warehouses",
        },
        {
          title: "Series",
          url: "/core/series",
        },
      ],
    },
    {
      title: "Ventas",
      url: "#",
      icon: (
        <Store />
      ),
      items: [
         {
           title: "Ventas",
           url: "/sales/sale",
         },
        {
          title: "Clientes",
          url: "/sales/customers",
        },
      ],
    },
    {
      title: "Compras",
      url: "#",
      icon: (
        <Truck
        />
      ),
      items: [
        {
          title: "Proveedores",
          url: "/purchases/suppliers",
        },
        {
          title: "Compras",
          url: "/purchases/purchase",
        },
      ],
    },
    {
      title: "Inventario",
      url: "#",
      icon: (
        <Package
        />
      ),
      items: [
        {
          title: "Productos",
          url: "/inventory/products",
        },
        {
          title: "Marcas",
          url: "/inventory/brands",
        },
        {
          title: "Categorías",
          url: "/inventory/category",
        },
        {
          title: "Unidad de productos",
          url: "/inventory/product_unit",
        },
        {
          title: "Ajuste Stock",
          url: "#",
        },
      ],
    },
    {
      title: "Finanzas",
      url: "#",
      icon: (
        <Banknote
        />
      ),
      items: [
        {
          title: "Monedas",
          url: "/finance/currencies",
        },
        {
          title: "Caja",
          url: "/finance/cashbox",
        },
        {
          title: "Cuentas",
          url: "/finance/account",
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
        },
        {
          title: "Compras",
          url: "#",
        },
        {
          title: "Caja",
          url: "#",
        },
      ],
    },
    {
      title: "Seguridad",
      url: "#",
      icon: (
        <Shield
        />
      ),
      items: [
        {
          title: "Roles y permisos",
          url: "/security/roles",
        },
        {
          title: "General",
          url: "#",
        },
        {
          title: "Notificaciones",
          url: "#",
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
  const {user} = useAuthStore()
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
