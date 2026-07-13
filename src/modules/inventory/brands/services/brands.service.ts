import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { Brand, BrandQueryParams } from "../types/brand.types";
import { BrandForm,  } from "../validators/brandSchema";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";

class BrandService {
    async getAll(params?: BrandQueryParams): Promise<AxiosResponse<PaginationResponse<Brand>>> {
        const response = await apiClient.get(endpoints.BRANDS.GET_ALL,{
            params,
        });
        return response;
    }
    async create(brand: BrandForm): Promise<AxiosResponse<Brand>> {
        const response = await apiClient.post(endpoints.BRANDS.CREATE, brand);
        return response;
    }
    async update(id: string, brand: BrandForm): Promise<AxiosResponse<Brand>> {
        const response = await apiClient.patch(`${endpoints.BRANDS.UPDATE}/${id}`, brand)
        return response;
    }
    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.BRANDS.DELETE}/${id}`);
        return response;
    }
}

export const brandService = new BrandService();