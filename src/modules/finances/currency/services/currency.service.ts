import { AxiosResponse } from "axios";
import { Currency, CurrencyQueryParams } from "../types/currency.types";
import { PaginationResponse } from "@/types/types";
import { endpoints } from "@/config/endPoints";
import { CurrencyForm } from "../validators/currencySchema";
import apiClient from "@/hooks/useAxios";

class CurrencyService {
    async getAll(params?: CurrencyQueryParams): Promise<AxiosResponse<PaginationResponse<Currency>>> {
        const response = await apiClient.get(endpoints.CURRENCIES.GET_ALL, {
            params,
        });
        return response;
    }

    async create(currency: CurrencyForm): Promise<AxiosResponse<Currency>> {
        const response = await apiClient.post(endpoints.CURRENCIES.CREATE, currency);
        return response;
    }

    async update(id: string, currency: CurrencyForm): Promise<AxiosResponse<Currency>> {
        const response = await apiClient.patch(`${endpoints.CURRENCIES.UPDATE}/${id}`, currency);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.CURRENCIES.DELETE}/${id}`);
        return response;
    }
}
export const currencyService = new CurrencyService();