import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import type { PaginationResponse } from "@/types/types";
import type { AxiosResponse } from "axios";

import type {
    DailyClosing,
    DailyClosingQueryParams,
} from "../types/dailyClosing.types";
import type { DailyClosingForm } from "../validators/dailyClosingSchema";

class DailyClosingService {
    async getAll(
        params: DailyClosingQueryParams
    ): Promise<AxiosResponse<PaginationResponse<DailyClosing>>> {
        return apiClient.get(endpoints.DAILY_CLOSINGS.GET_ALL, { params });
    }

    async getById(id: string): Promise<AxiosResponse<DailyClosing>> {
        return apiClient.get(`${endpoints.DAILY_CLOSINGS.GET_BY_ID}/${id}`);
    }

    async open(payload: DailyClosingForm): Promise<AxiosResponse<DailyClosing>> {
        return apiClient.post(endpoints.DAILY_CLOSINGS.OPEN, payload);
    }

    async close(id: string): Promise<AxiosResponse<DailyClosing>> {
        return apiClient.patch(`${endpoints.DAILY_CLOSINGS.CLOSE}/${id}/close`);
    }
}

export const dailyClosingService = new DailyClosingService();
