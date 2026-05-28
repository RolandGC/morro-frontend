import { apiClient } from '@/hooks/useAxios';
import { endpoints } from '@/config/endPoints';
import { AxiosResponse } from 'axios';
import { PaginationResponse } from '@/types/types';
import { User } from '@/modules/auth/types/auth.types';
import { UserCompany } from '@/modules/userCompany/types/userCompany.types';

export default class CompanyService {
    async getAllCompanies():Promise<AxiosResponse<PaginationResponse<UserCompany>>> {
        const response = await apiClient.get(endpoints.USER_COMPANIES.FIND_ALL);
        return response;
    
    }       
}