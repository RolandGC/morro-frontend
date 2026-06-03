// app/(protected)/layout.tsx

import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}