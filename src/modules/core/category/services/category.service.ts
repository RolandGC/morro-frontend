import apiClient from "@/hooks/useAxios";
import Axiosresponse, { AxiosResponse } from "axios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";
import { Category, CategoryQueryParams } from "../types/category.types";
import { CategoryForm } from "../validators/categorySchema";
class CategoryService {
    async getAll(params?: CategoryQueryParams):Promise<AxiosResponse<PaginationResponse<Category>>> {
        const response = await apiClient.get(endpoints.CATEGORIES.GET_ALL, {
            params,
        });
        return response;
    }
    async create(category: CategoryForm): Promise<AxiosResponse<Category>> {
        const response = await apiClient.post(endpoints.CATEGORIES.CREATE, category);
        return response;
    }
    async update(id: string, category: CategoryForm): Promise<AxiosResponse<Category>> {
        const response = await apiClient.patch(`${endpoints.CATEGORIES.UPDATE}/${id}`, category)
        return response;
    }
    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.CATEGORIES.DELETE}/${id}`);
        return response;
    }
}

export const categoryService = new CategoryService();