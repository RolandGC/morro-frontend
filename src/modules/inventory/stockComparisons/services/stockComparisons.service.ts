import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import type { AxiosResponse } from "axios";
import type { PaginationResponse } from "@/types/types";
import type {
    StockComparison,
    StockComparisonsQueryParams,
} from "../types/stockComparisons.type";
import type { StockComparisonForm } from "../validators/stockComparisonsSchema";

class StockComparisonsService {
    async getAll(
        params?: StockComparisonsQueryParams
    ): Promise<AxiosResponse<PaginationResponse<StockComparison>>> {
        const response = await apiClient.get(
            endpoints.STOCK_COMPARISONS.GET_ALL,
            { params }
        );

        return response;
    }

    async create(
        stockComparison: StockComparisonForm
    ): Promise<AxiosResponse<StockComparison>> {
        const response = await apiClient.post(
            endpoints.STOCK_COMPARISONS.CREATE,
            stockComparison
        );

        return response;
    }

    async getById(id: string): Promise<AxiosResponse<StockComparison>> {
        const response = await apiClient.get(
            `${endpoints.STOCK_COMPARISONS.GET_BY_ID}/${id}`
        );

        return response;
    }
}

export const stockComparisonsService = new StockComparisonsService();
