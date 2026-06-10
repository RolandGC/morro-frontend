import apiClient from "@/hooks/useAxios";
import { Product } from "../types/produc.type";
import { endpoints } from "@/config/endPoints";

class ProductService {
    async findAll() {
        const response = await apiClient.get(endpoints.PRODUCTS.FIND_ALL);
        return response.data;
    }

    async create(product: Product) {
        const response = await apiClient.post(endpoints.PRODUCTS.CREATE, product);
        return response.data;
    }
}

export const productService = new ProductService();