import { AxiosResponse } from "axios";
import { Cashbox, CashboxQueryParams } from "../types/cashbox.types";
import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";

class CashboxService {
    async getAll(params: CashboxQueryParams): Promise<AxiosResponse<PaginationResponse<Cashbox>>>{
        const response = await apiClient.get(endpoints.CASHBOX.GET_ALL, {
            params,
        });
        return response;
    }
    
}

export const cashboxService = new CashboxService();