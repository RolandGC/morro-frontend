import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { Customer, CustomerQueryParams } from "../types/customer.type";
import { endpoints } from "@/config/endPoints";
import apiClient from "@/hooks/useAxios";
import { CustomerForm } from "../validators/customerSchema";

class CustomerService{
    async getAll(params: CustomerQueryParams): Promise<AxiosResponse<PaginationResponse<Customer>>> {
        const response = await apiClient.get(endpoints.CUSTOMERS.GET_ALL,{
            params
        });
        return response;
    }
    async create(customer: CustomerForm): Promise<AxiosResponse<Customer>> {
        const response = await apiClient.post(endpoints.CUSTOMERS.CREATE, customer);
        return response;
    }
    async update(id: string, customer: Partial<CustomerForm>): Promise<AxiosResponse<Customer>> {
        const response = await apiClient.patch(`${endpoints.CUSTOMERS.UPDATE}/${id}`, customer);
        return response;
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.CUSTOMERS.DELETE}/${id}`);
        return response;
    }
}

export const customerService = new CustomerService();