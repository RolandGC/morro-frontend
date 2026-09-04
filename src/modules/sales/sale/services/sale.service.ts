import apiClient from "@/hooks/useAxios";
import { Sale, SaleQueryParams } from "../types/sale.types";
import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { endpoints } from "@/config/endPoints";
import { SaleForm, TicketForm } from "../validators/saleSchema";

class SaleService {
    async getAll(params?: SaleQueryParams): Promise<AxiosResponse<PaginationResponse<Sale>>> {
        const response = await apiClient.get(endpoints.SALES.GET_ALL, {
            params,
        });
        return response;
    }
    async create(sale: SaleForm): Promise<AxiosResponse<Sale>> {
        const response = await apiClient.post(endpoints.SALES.CREATE, sale);
        return response;
    }
    async getById(id: string) {
        const response = await apiClient.get(`${endpoints.SALES.GET_BY_ID}/${id}`);
        return response;
    }
    async update(id: string, sale: SaleForm): Promise<AxiosResponse<Sale>> {
        const response = await apiClient.patch(`${endpoints.SALES.UPDATE}/${id}`, sale);
        return response;
    }
    async delete(id: string) {
        const response = await apiClient.delete(`${endpoints.SALES.DELETE}/${id}`);
        return response;
    }
    async complete(id: string) {
        const response = await apiClient.post(endpoints.SALES.COMPLETE(id));
        return response;
    }
    async cancel(id: string) {
        const response = await apiClient.post(endpoints.SALES.CANCEL(id));
        return response;
    }
    async getNoteById(id: string) {
        const response = await apiClient.get(`${endpoints.ORDER_NOTE.GET_BY_ID}/${id}`);
        return response;
    }
    async createTicket(ticket: TicketForm): Promise<AxiosResponse<any>> {
        const response = await apiClient.post(endpoints.TICKETS.CREATE, ticket);
        return response;
    }
}

export const saleService = new SaleService();