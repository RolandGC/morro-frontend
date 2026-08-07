import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseUrl } from '@/config/environment';
import { removeAuthToken } from '@/modules/auth/helpers';
import { showToast } from '@/hooks/useToast';

// Crear instancia de axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las solicitudes
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token de cookies
    const token = getCookieValue('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        window.location.href = '/auth/login';
        const token = getCookieValue('access_token');
        //const isAuthPage = window.location.pathname.startsWith('/');
        removeAuthToken();
      }

      if (error.response?.status === 403) {
        showToast('No tienes permiso para realizar esta accion', 'error', 4000);
        import('@/modules/auth/store/permission.store').then(({ usePermissionStore }) => {
          usePermissionStore.getState().clearPermissions();
        });
      }
    }

    return Promise.reject(error);
  }
);

// Función auxiliar para obtener valor de cookie
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

export default apiClient;
