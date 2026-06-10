import apiClient from "@/hooks/useAxios";
import Axiosresponse, { AxiosResponse } from "axios";
import { endpoints } from "@/config/endPoints";
import { PaginationResponse } from "@/types/types";
import { Category } from "../types/category.types";
import { CategoryFormData } from "../validators/categoryShema";

class CategoryService {
    async findAll():Promise<AxiosResponse<PaginationResponse<Category>>> {
        const response = await apiClient.get(endpoints.CATEGORIES.FIND_ALL);
        return response;
    }
    async create(category: CategoryFormData): Promise<AxiosResponse<any>> {
        const response = await apiClient.post(endpoints.CATEGORIES.CREATE, category);
        return response;
    }
}

export const categoryService = new CategoryService();