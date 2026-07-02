import { apiClient } from '@/hooks/useAxios';
import { endpoints } from '@/config/endPoints';
import { AxiosResponse } from 'axios';
import { PaginationResponse } from '@/types/types';
import { LoginResponse, User } from '@/modules/auth/types/auth.types';
import { Company } from '../types/company.type';

class CompanyService {
    async getAllCompanies():Promise<AxiosResponse<PaginationResponse<Company>>> {
        const response = await apiClient.get(endpoints.USER_COMPANIES.FIND_ALL);
        return response;
    
    }
    
    async selectCompany(companyId: string): Promise<AxiosResponse<LoginResponse>> {
        const response = await apiClient.post(endpoints.AUTH.SELECT_COMPANY,
            {
                company_id: companyId,
            }
        );
        return response;
    }
}
export const companyService = new CompanyService();