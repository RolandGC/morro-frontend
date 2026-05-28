import { apiClient } from '@/hooks/useAxios';
import { AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Servicio base para hacer llamadas API
 * Proporciona métodos genéricos para GET, POST, PUT, DELETE
 */
export class BaseApiService {
  protected baseUrl: string = '';

  /**
   * GET request
   */
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<T>(url);
      return {
        ok: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<T>(url, data);
      return {
        ok: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<T>(url, data);
      return {
        ok: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<T>(url, data);
      return {
        ok: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<T>(url);
      return {
        ok: true,
        data: response.data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  protected handleError(error: any): ApiResponse {
    const axiosError = error as AxiosError;
    
    const errorMessage =
      (axiosError.response?.data as any)?.message ||
      axiosError.message ||
      'Error desconocido';

    return {
      ok: false,
      error: errorMessage,
      statusCode: axiosError.response?.status,
    };
  }
}
