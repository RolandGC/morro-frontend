import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";
import { ProductUnitForm } from "../validators/productUnitSchema";
import { ProductUnit } from "../types/produc.type";

class ProductUnitService {
    async getAll(productId: string): Promise<AxiosResponse<ProductUnit>> {
        const response = await apiClient.get(endpoints.PRODUCT_UNIT.GET_ALL(productId));
        return response;
    }

    async create(productId: string, productUnit: ProductUnitForm): Promise<AxiosResponse<ProductUnit>> {
        const response = await apiClient.post(endpoints.PRODUCT_UNIT.CREATE(productId), productUnit);
        return response;
    }

    async update(productId: string, id: string, productUnit: ProductUnitForm): Promise<AxiosResponse<ProductUnit>> {
        const response = await apiClient.patch(`${endpoints.PRODUCT_UNIT.UPDATE(productId, id)}`, productUnit);
        return response;
    }

    async delete(productId: string, id: string) {
        const response = await apiClient.delete(`${endpoints.PRODUCT_UNIT.DELETE(productId, id)}`);
        return response;
    }
}

export const productUnitService = new ProductUnitService();