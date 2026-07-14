import { AxiosResponse } from "axios";
import { Supplier, SupplierQueryParams } from "../types/suppliers.types";
import { PaginationResponse } from "@/types/types";
import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { SupplierForm } from "../validators/supplierSchema";

class SupplierService {
    async getAll(params?: SupplierQueryParams): Promise<AxiosResponse<PaginationResponse<Supplier>>>{
        const response = await apiClient.get(endpoints.SUPPLIERS.GET_ALL,{
            params,
        })
        return response;
    }
    async create(supplier: SupplierForm): Promise<AxiosResponse<Supplier>>{
        const response = await apiClient.post(endpoints.SUPPLIERS.CREATE, supplier);
        return response
    }
    async update(id: string, brand: SupplierForm): Promise<AxiosResponse<Supplier>> {
        const response = await apiClient.patch(`${endpoints.SUPPLIERS.UPDATE}/${id}`, brand)
        return response;
    }
    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.SUPPLIERS.DELETE}/${id}`);
        return response;
    } 
}
export const supplierService = new SupplierService();