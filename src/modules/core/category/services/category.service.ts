import apiClient from "@/hooks/useAxios";
import Axiosresponse, { AxiosResponse } from "axios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";
import { Category } from "../types/category.types";
import { CategoryForm } from "../validators/categorySchema";
class CategoryService {
    async getAll():Promise<AxiosResponse<PaginationResponse<Category>>> {
        const response = await apiClient.get(endpoints.CATEGORIES.GET_ALL);
        return response;
    }
    async create(category: CategoryForm): Promise<AxiosResponse<any>> {
        const response = await apiClient.post(endpoints.CATEGORIES.CREATE, category);
        return response;
    }
}

export const categoryService = new CategoryService();