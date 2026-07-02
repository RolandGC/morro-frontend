import { create } from "zustand";
import { permissionService } from "../services/permission.service";

interface PermissionStore {
  permissions: string[];
  isLoaded: boolean;
  fetchPermissions: (userId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  isLoaded: false,

  fetchPermissions: async (userId: string) => {
    try {
      const res = await permissionService.getPermissionsByUser(userId);
      set({ permissions: res.data, isLoaded: true });
    } catch {
      set({ permissions: [], isLoaded: true });
    }
  },

  hasPermission: (permission) => {
    const perms = get().permissions;
    return Array.isArray(perms) && perms.includes(permission);
  },

  hasAnyPermission: (permissions) => {
    const perms = get().permissions;
    return Array.isArray(perms) && permissions.some((p) => perms.includes(p));
  },

  hasAllPermissions: (permissions) => {
    const perms = get().permissions;
    return Array.isArray(perms) && permissions.every((p) => perms.includes(p));
  },

  clearPermissions: () => set({ permissions: [], isLoaded: false }),
}));
