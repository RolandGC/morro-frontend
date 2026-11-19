import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import type { AxiosResponse } from "axios";
import type { PaginationResponse } from "@/types/types";
import type {
    StockAdjustment,
    StockAdjustmentQueryParams,
} from "../types/stockAdjustment.type";
import type { StockAdjustmentForm } from "../validators/stockAdjustment";

class StockAdjustmentService {
    async getAll(
        params?: StockAdjustmentQueryParams
    ): Promise<AxiosResponse<PaginationResponse<StockAdjustment>>> {
        const response = await apiClient.get(
            endpoints.STOCK_ADJUSTMENTS.GET_ALL,
            { params }
        );

        return response;
    }

    async create(
        stockAdjustment: StockAdjustmentForm
    ): Promise<AxiosResponse<StockAdjustment>> {
        const response = await apiClient.post(
            endpoints.STOCK_ADJUSTMENTS.CREATE,
            stockAdjustment
        );

        return response;
    }

    async getById(id: string): Promise<AxiosResponse<StockAdjustment>> {
        const response = await apiClient.get(
            `${endpoints.STOCK_ADJUSTMENTS.GET_BY_ID}/${id}`
        );

        return response;
    }
}

export const stockAdjustmentService = new StockAdjustmentService();
