import { endpoints } from "@/config/endPoints";
import { apiClient } from "@/hooks/useAxios";
import { User, UserQueryParams } from "../types/user.types";
import { PaginationResponse } from "@/types/types";
import { AxiosResponse } from "axios";
import { FormUserDto } from "../validators/userShema";

class UserService {
    async findAll(params: UserQueryParams): Promise<AxiosResponse<PaginationResponse<User>>> {
        const response = await apiClient.get(endpoints.USERS.FIND_ALL,{
            params
        });
        return response;
    }
    async create(user: FormUserDto): Promise<AxiosResponse<User>> {
        const response = await apiClient.post(endpoints.USERS.CREATE, user);
        return response;
    }
    async update(id: string, user: FormUserDto): Promise<AxiosResponse<User>> {
        const response = await apiClient.put(endpoints.USERS.UPDATE, user);
        return response;
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.USERS.DELETE}/${id}`);
        return response;
    }
}

export const userService = new UserService();