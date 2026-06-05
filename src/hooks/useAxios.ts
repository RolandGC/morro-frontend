import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseUrl } from '@/config/environment';
import { removeAuthToken } from '@/modules/auth/helpers';

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
    // Solo redirigir si había sesión (token expirado o inválido)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const token = getCookieValue('access_token');
      const isAuthPage = window.location.pathname.startsWith('/auth/');

      if (token && !isAuthPage) {
        removeAuthToken();
        window.location.href = '/auth/login';
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
