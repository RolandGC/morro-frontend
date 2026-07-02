"use client";

import { usePermission } from "@/hooks/usePermission";

export function RequirePermission({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermission();
  if (!can(permission)) return fallback;
  return <>{children}</>;
}
