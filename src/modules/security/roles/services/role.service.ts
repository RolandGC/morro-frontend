import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";
import { Role } from "../types/roles.types";
import { RoleForm } from "../validators/rolesSchema";

class RoleService {
    async getAll(): Promise<AxiosResponse<Role[]>> {
        const response = await apiClient.get(endpoints.ROLES.GET_ALL);
        return response;
    }

    async create(role: RoleForm): Promise<AxiosResponse<Role>> {
        const response = await apiClient.post(endpoints.ROLES.CREATE, role);
        return response;
    }

    async update(id: string, role: RoleForm): Promise<AxiosResponse<Role>> {
        const response = await apiClient.patch(`${endpoints.ROLES.UPDATE}/${id}`, role);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.ROLES.DELETE}/${id}`);
        return response;
    }
}

export const roleService = new RoleService();