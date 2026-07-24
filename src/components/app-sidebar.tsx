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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "../logoMorroHoriztl.png",
  },
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
      ],
    },
    {
      title: "Vender",
      url: "/sale",
      icon: (
        <BriefcaseIcon
        />
      ),
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
          url: "#",
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
          title: "General",
          url: "#",
        },
        {
          title: "Roles",
          url: "/security/roles",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/sales/sale/add">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Vender
            </Link>
          </Button>
        </div>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
