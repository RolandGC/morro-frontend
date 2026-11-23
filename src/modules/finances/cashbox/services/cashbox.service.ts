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
        // El documento usa `expected_amount`; el esquema real usa
        // `opening_amount`. Se envían ambos con el mismo valor para que la
        // apertura funcione con cualquier versión del backend.
        const body = {
            ...payload,
            details: payload.details.map((detail) => ({
                payment_account_id: detail.payment_account_id,
                opening_amount: detail.opening_amount,
                expected_amount: detail.opening_amount,
            })),
        };

        const response = await apiClient.post(
            endpoints.CASH_SESSIONS.OPEN,
            body
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
