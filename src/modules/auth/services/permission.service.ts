import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";

function extractPermissions(data: unknown): string[] {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    if (typeof data[0] === "string") return data as string[];
    if (typeof data[0] === "object" && data[0] !== null) {
      return data.map((item: Record<string, unknown>) => item.name as string).filter(Boolean);
    }
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.permissions)) return extractPermissions(obj.permissions);
    if (Array.isArray(obj.data)) return extractPermissions(obj.data);
    if (obj.data && typeof obj.data === "object") return extractPermissions(obj.data);
  }
  return [];
}

class PermissionService {
  async getPermissionsByUser(userId: string): Promise<AxiosResponse<string[]>> {
    const response = await apiClient.get(endpoints.PERMISSIONS.BY_USER(userId));
    return {
      ...response,
      data: extractPermissions(response.data),
    };
  }
}

export const permissionService = new PermissionService();
