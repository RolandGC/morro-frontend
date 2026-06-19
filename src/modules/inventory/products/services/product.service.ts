import apiClient from "@/hooks/useAxios";
import { ProductSend } from "../types/produc.type";
import { endpoints } from "@/config/endPoints";
import { productSchema } from "../validators/productShema";

class ProductService {
    async findAll() {
        const response = await apiClient.get(endpoints.PRODUCTS.FIND_ALL);
        return response;
    }

    async create(product: ProductSend) {
        //const payload = productSchema.parse(product);
        const response = await apiClient.post(endpoints.PRODUCTS.CREATE, product);
        return response;
    }

    async update(id: string, product: ProductSend) {
        const response = await apiClient.patch(`${endpoints.PRODUCTS.UPDATE}/${id}`, product);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.PRODUCTS.DELETE}/${id}`);
        return response;
    }
}

export const productService = new ProductService();