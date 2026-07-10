import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { WarehouseQueryParams } from "../types/warehouse.types";
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
}