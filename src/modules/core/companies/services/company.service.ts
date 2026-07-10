import { apiClient } from '@/hooks/useAxios';
import { endpoints } from '@/config/endPoints';
import { AxiosResponse } from 'axios';
import { PaginationResponse } from '@/types/types';
import { LoginResponse, User } from '@/modules/auth/types/auth.types';
import { Company, CompanyQueryParams } from '../types/company.type';
import { CompanyForm } from '../validators/companySchema';

class CompanyService {
    async getAllCompanies(params?: CompanyQueryParams):Promise<AxiosResponse<PaginationResponse<Company>>> {
        const response = await apiClient.get(endpoints.COMPANIES.GET_ALL,{
            params,
        });
        return response;
    }
    async create(company: CompanyForm): Promise<AxiosResponse<Company>>{
        const response = await apiClient.post(endpoints.COMPANIES.CREATE, company);
        return response;
    }
    async update(id: string, company: Partial<CompanyForm>): Promise<AxiosResponse<Company>>{
        const response = await apiClient.patch(`${endpoints.COMPANIES.UPDATE}/${id}`, company);
        return response
    }
    async delete(id: string){
        const response = await apiClient.delete(`${endpoints.COMPANIES.DELETE}/${id}`);
    }
    async getAllCompaniesUser():Promise<AxiosResponse<PaginationResponse<Company>>> {
        const response = await apiClient.get(endpoints.USER_COMPANIES.GET_ALL);
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