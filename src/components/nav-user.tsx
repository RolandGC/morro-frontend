"use client"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore, User } from "@/modules/auth/store/authStore"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getInitials } from "@/lib/format";
import { useCashSessionStore } from "@/modules/finances/cashbox/store/cashSession.store";


type NavUserProps = {
  user?: User | null
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter();
  const { isLoading } = useAuthStore();
  const requestLogout = useCashSessionStore((state) => state.requestLogout);
  const [isCheckingCash, setIsCheckingCash] = useState(false);

  const handleLogout = async () => {
    setIsCheckingCash(true);

    // Solo se redirige cuando no hay caja que cerrar o cuando el cierre terminó.
    const redirect = () => {
      router.replace("/auth/login");
      router.refresh();
    };

    try {
      await requestLogout(redirect);
    } catch (error) {
      console.error("Error al verificar la caja antes de cerrar sesión:", error);
    } finally {
      setIsCheckingCash(false);
    }
  };

  const { isMobile } = useSidebar()

  const initials = getInitials(user?.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? "Usuario"}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoading || isCheckingCash}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              {isCheckingCash
                ? "Verificando caja..."
                : isLoading
                  ? "Cerrando sesión..."
                  : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
