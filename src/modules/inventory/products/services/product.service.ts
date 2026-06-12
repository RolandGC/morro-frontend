import apiClient from "@/hooks/useAxios";
import { Product } from "../types/produc.type";
import { endpoints } from "@/config/endPoints";
import { productSchema } from "../validators/productShema";

class ProductService {
    async findAll() {
        const response = await apiClient.get(endpoints.PRODUCTS.FIND_ALL);
        return response;
    }

    async create(product: Product) {
        //const payload = productSchema.parse(product);
        const response = await apiClient.post(endpoints.PRODUCTS.CREATE, product);
        return response;
    }
}

export const productService = new ProductService();