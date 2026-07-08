import apiClient from "@/hooks/useAxios";
import { Product, ProductQueryParams} from "../types/produc.type";
import { endpoints } from "@/config/endPoints";
import { ProductForm, productSchema } from "../validators/productSchema";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";

class ProductService {
    async getAll(params?: ProductQueryParams): Promise<AxiosResponse<PaginationResponse<Product>>> {
        const response = await apiClient.get(endpoints.PRODUCTS.GET_ALL, {
            params,
        });
        return response;
    }

    async create(product: ProductForm): Promise<AxiosResponse<Product>> {
        const response = await apiClient.post(endpoints.PRODUCTS.CREATE, product);
        return response;
    }

    async update(id: string, product: ProductForm): Promise<AxiosResponse<Product>> {
        const response = await apiClient.patch(`${endpoints.PRODUCTS.UPDATE}/${id}`, product);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.PRODUCTS.DELETE}/${id}`);
        return response;
    }
}

export const productService = new ProductService();