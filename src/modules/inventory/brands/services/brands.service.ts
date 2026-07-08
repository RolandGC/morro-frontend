import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { Brand } from "../types/brand.types";
import { BrandFormData } from "../validators/brandSchema";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";

class BrandService {
    async getAll(): Promise<AxiosResponse<PaginationResponse<Brand>>> {
        const response = await apiClient.get(endpoints.BRANDS.GET_ALL);
        return response;
    }
    async create(brand: BrandFormData): Promise<AxiosResponse<any>> {
        const response = await apiClient.post(endpoints.BRANDS.CREATE, brand);
        return response;
    }   
}

export const brandService = new BrandService();