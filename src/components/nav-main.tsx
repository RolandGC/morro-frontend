"use client"

import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { usePermission } from "@/hooks/usePermission"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
      permission?: string
    }[]
  }[]
}) {
  const { can, canAny } = usePermission();
  const pathname = usePathname();

  const isGroupActive = (group: (typeof items)[number]) =>
    group.items?.some(
      (subItem) => subItem.url !== "#" && pathname.startsWith(subItem.url)
    ) ?? false;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Vender"
            isActive={pathname.startsWith("/sales/sale/add")}
            className={cn(
              "h-9 font-semibold shadow-sm",
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            )}
          >
            <Link href="/sales/sale/add">
              <ShoppingCart />
              <span>Vender</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {items.map((item) => {
          const active = isGroupActive(item);

          return (
            canAny(
              item.items
                ?.map((i) => i?.permission)
                .filter((permission): permission is string =>
                  Boolean(permission),
                ) ?? [],
            ) && (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive || active}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active}
                      className="data-[active=true]:font-medium"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        if (!subItem.permission || !can(subItem.permission)) {
                          return null;
                        }

                        const subActive =
                          subItem.url !== "#" &&
                          pathname.startsWith(subItem.url);

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={subActive}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
