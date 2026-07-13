import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { Warehouse, WarehouseQueryParams } from "../types/warehouse.types";
import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { WarehouseForm } from "../validators/warehouseSchema";

class WarehouseService {
    async getAll(params: WarehouseQueryParams): Promise<AxiosResponse<PaginationResponse<Warehouse>>>{
        const response = await apiClient.get(endpoints.WAREHOUSES.GET_ALL, {
            params
        });
        return response;
    }
    async create(warehouse: WarehouseForm): Promise<AxiosResponse<Warehouse>>{
        const response = await apiClient.post(endpoints.WAREHOUSES.CREATE, warehouse);
        return response;
    }
    async update(id: string, warehouse: WarehouseForm): Promise<AxiosResponse<Warehouse>>{
        const response = await apiClient.patch(`${endpoints.WAREHOUSES.UPDATE}/${id}`, warehouse);
        return response;
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.WAREHOUSES.DELETE}/${id}`);
        return response;
    }
}

export const warehouseService = new WarehouseService();