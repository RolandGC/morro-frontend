import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";
import { StockAdjustmentQueryParams } from "../types/stockAdjustment.type";

class StockAdjustmentService {
    async getAll(params?: StockAdjustmentQueryParams): Promise<AxiosResponse<PaginationResponse<Product>>> {
        const response = await apiClient.get(endpoints.SOTK_ADJUSTMENTS.GET_ALL, {
            params,
        });
        return response;
    }

    async create(product: ProductForm): Promise<AxiosResponse<Product>> {
        const response = await apiClient.post(endpoints.SOTK_ADJUSTMENTS.CREATE, product);
        return response;
    }

    async getById(id: string, product: ProductForm): Promise<AxiosResponse<Product>> {
        const response = await apiClient.patch(`${endpoints.SOTK_ADJUSTMENTS.GET_BY_ID}/${id}`, product);
        return response;
    }

}

export const stockAdjustmentService = new StockAdjustmentService();