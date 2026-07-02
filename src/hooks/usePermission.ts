import { usePermissionStore } from "@/modules/auth/store/permission.store";

export function usePermission() {
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const hasAnyPermission = usePermissionStore((s) => s.hasAnyPermission);
  const hasAllPermissions = usePermissionStore((s) => s.hasAllPermissions);
  const permissions = usePermissionStore((s) => s.permissions);
  const isLoaded = usePermissionStore((s) => s.isLoaded);

  return {
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
    permissions,
    isLoaded,
  };
}
