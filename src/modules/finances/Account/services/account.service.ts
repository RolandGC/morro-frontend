import { endpoints } from "@/config/endPoints";
import { apiClient } from "@/hooks/useAxios";
import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { Account, AccountQueryParams } from "../types/account.types";
import { AccountForm } from "../validators/accountSchema";

class AccountService {
    async getAll(params: AccountQueryParams): Promise<AxiosResponse<PaginationResponse<Account>>> {
        const response = await apiClient.get(endpoints.ACCOUNTS.GET_ALL,{
            params
        });
        return response;
    }
    async create(account: AccountForm): Promise<AxiosResponse<Account>> {
        const response = await apiClient.post(endpoints.ACCOUNTS.CREATE, account);
        return response;
    }
    async update(id: string, account: Partial<AccountForm>): Promise<AxiosResponse<Account>> {
        const response = await apiClient.patch(`${endpoints.ACCOUNTS.UPDATE}/${id}`, account);
        return response;
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.ACCOUNTS.DELETE}/${id}`);
        return response;
    }
}

export const accountService = new AccountService();