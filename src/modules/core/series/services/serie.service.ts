import { AxiosResponse } from "axios";
import apiClient from "@/hooks/useAxios";
import { Serie, SerieQueryParams } from "../types/serie.types";
import { PaginationResponse } from "@/types/types";
import { endpoints } from "@/config/endPoints";
import { SerieForm } from "../validators/serieSchema";

class SerieService {
    async getAll(params?: SerieQueryParams): Promise<AxiosResponse<PaginationResponse<Serie>>> {
        const response = await apiClient.get(endpoints.SERIES.GET_ALL, {
            params,
        });
        return response;
    }

    async create(serie: SerieForm): Promise<AxiosResponse<Serie>> {
        const response = await apiClient.post(endpoints.SERIES.CREATE, serie);
        return response;
    }

    async update(id: string, serie: SerieForm): Promise<AxiosResponse<Serie>> {
        const response = await apiClient.patch(`${endpoints.SERIES.UPDATE}/${id}`, serie);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.SERIES.DELETE}/${id}`);
        return response;
    }
}
export const serieService = new SerieService();