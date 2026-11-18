"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Building2, ChevronsUpDown } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SelectedCompany = {
  name?: string;
  trade_name?: string;
  ruc?: string;
};

const STORAGE_KEY = "selected_company";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

/**
 * Muestra la empresa activa guardada al iniciar sesión.
 * Reemplaza el selector de equipos de ejemplo que traía la plantilla.
 */
export function CompanySwitcher() {
  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  let company: SelectedCompany | null = null;

  if (raw) {
    try {
      company = JSON.parse(raw) as SelectedCompany;
    } catch {
      company = null;
    }
  }

  const name = company?.trade_name || company?.name || "Seleccionar empresa";
  const detail = company?.ruc ? `RUC ${company.ruc}` : "Empresa activa";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          tooltip={name}
          className="data-[state=open]:bg-sidebar-accent"
        >
          <Link href="/select-company">
            <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="size-4" aria-hidden="true" />
            </span>

            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {detail}
              </span>
            </span>

            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
