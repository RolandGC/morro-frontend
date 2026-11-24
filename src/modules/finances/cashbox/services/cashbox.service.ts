import { AxiosResponse } from "axios";
import { Cashbox, CashboxQueryParams } from "../types/cashbox.types";
import {
    CashboxForm,
    CashSessionCloseForm,
} from "../validators/cashboxSchema";
import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";

interface ActiveCashSessionParams {
    company_id: string;
    warehouse_id?: string;
}

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

    async getActive(
        params: ActiveCashSessionParams
    ): Promise<AxiosResponse<Cashbox | null>> {
        const response = await apiClient.get(endpoints.CASH_SESSIONS.ACTIVE, {
            params,
        });
        return response;
    }

    async open(payload: CashboxForm): Promise<AxiosResponse<Cashbox>> {
        // El backend original valida el DTO con whitelist y
        // forbidNonWhitelisted: sólo acepta `opening_amount`. Enviar
        // `expected_amount` provoca un 400 antes de crear la sesión.
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
