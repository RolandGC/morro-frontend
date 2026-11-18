import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";
import { StockComparison, StockComparisonsQueryParams } from "../types/stockComparisons.type";
import { StockComparisonForm } from "../validators/sctockComparisonsSchema";

class StockComparisonsService {
    async getAll(params?: StockComparisonsQueryParams): Promise<AxiosResponse<PaginationResponse<StockComparison>>> {
        const response = await apiClient.get(endpoints.STOCK_COMPARISONS.GET_ALL, {
            params,
        });
        return response;
    }

    async create(stockComparison: StockComparisonForm): Promise<AxiosResponse<StockComparison>> {
        const response = await apiClient.post(endpoints.STOCK_COMPARISONS.CREATE, stockComparison);
        return response;
    }

    async getById(id: string, stockComparison: StockComparisonForm): Promise<AxiosResponse<StockComparison>> {
        const response = await apiClient.patch(`${endpoints.STOCK_COMPARISONS.GET_BY_ID}/${id}`, stockComparison);
        return response;
    }

}

export const stockComparisonsService = new StockComparisonsService();