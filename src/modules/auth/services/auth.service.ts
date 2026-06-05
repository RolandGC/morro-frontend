import { apiClient } from '@/hooks/useAxios';
import { LoginFormData } from '../validators/loginSchema';
import { LoginResponse } from '../types/auth.types';
import { AxiosResponse } from 'axios';
import { endpoints } from '@/config/endPoints';

class AuthService {
  /**
   * Login con email y contraseña
   */
  async login(data: LoginFormData): Promise<AxiosResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(endpoints.AUTH.LOGIN, data);
    return response
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh');
      return {
        ok: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return {
        ok: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}

export const authService = new AuthService();