import { AxiosResponse } from "axios";
import { Cashbox, CashboxQueryParams } from "../types/cashbox.types";
import {
    CashboxForm,
    CashSessionCloseForm,
} from "../validators/cashboxSchema";
import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";

class CashboxService {
    async getAll(
        params: CashboxQueryParams
    ): Promise<AxiosResponse<PaginationResponse<Cashbox>>> {
        const response = await apiClient.get(endpoints.CASH_SESSIONS.GET_ALL, {
            params,
        });
        return response;
    }

    async getById(id: string): Promise<AxiosResponse<Cashbox>> {
        const response = await apiClient.get(
            `${endpoints.CASH_SESSIONS.GET_BY_ID}/${id}`
        );
        return response;
    }

    async open(payload: CashboxForm): Promise<AxiosResponse<Cashbox>> {
        const response = await apiClient.post(
            endpoints.CASH_SESSIONS.OPEN,
            payload
        );
        return response;
    }

    async close(
        id: string,
        payload: CashSessionCloseForm
    ): Promise<AxiosResponse<Cashbox>> {
        const response = await apiClient.post(
            `${endpoints.CASH_SESSIONS.CLOSE}/${id}/close`,
            payload
        );
        return response;
    }
}

export const cashboxService = new CashboxService();
