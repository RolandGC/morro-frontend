import apiClient from "@/hooks/useAxios";
import { Purchase, PurchaseQueryParams } from "../types/purchase.types";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import { PaginationResponse } from "@/types/types";
import { PurchaseForm } from "../validators/purchaseSchema";

class PurchaseService {
    async getAll(params?: PurchaseQueryParams): Promise<AxiosResponse<PaginationResponse<Purchase>>> {
        const response = await apiClient.get(endpoints.PURCHASES.GET_ALL, {
            params,
        });
        return response;
    }
    async create(purchase: PurchaseForm): Promise<AxiosResponse<Purchase>> {
        const response = await apiClient.post(endpoints.PURCHASES.CREATE, purchase);
        return response;
    }

    async update(id: string, purchase: PurchaseForm): Promise<AxiosResponse<Purchase>> {
        const response = await apiClient.patch(`${endpoints.PURCHASES.UPDATE}/${id}`, purchase);
        return response;
    }

    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.PURCHASES.DELETE}/${id}`);
        return response;
    }
}

export const purchaseService = new PurchaseService();