import { endpoints } from "@/config/endPoints";
import { apiClient } from "@/hooks/useAxios";
import { User, UserQueryParams } from "../types/user.types";
import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { UserForm } from "../validators/userShema";

class UserService {
    async findAll(params: UserQueryParams): Promise<AxiosResponse<PaginationResponse<User>>> {
        const response = await apiClient.get(endpoints.USERS.FIND_ALL,{
            params
        });
        return response;
    }
    async create(user: UserForm): Promise<AxiosResponse<User>> {
        const response = await apiClient.post(endpoints.USERS.CREATE, user);
        return response;
    }
    async update(id: string, user: Partial<UserForm>): Promise<AxiosResponse<User>> {
        const response = await apiClient.patch(`${endpoints.USERS.UPDATE}/${id}`, user);
        return response;
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.USERS.DELETE}/${id}`);
        return response;
    }
}

export const userService = new UserService();