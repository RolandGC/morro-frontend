import { create } from "zustand";
import { authService, AuthServiceResponse } from "../services/auth.service";
import { LoginResponse } from "../types/auth.types";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthServiceResponse<LoginResponse>>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

// Funciones auxiliares para manejo de cookies
export const setAuthCookie = (token: string) => {
  if (typeof document === 'undefined') return;
  
  // Cookie válida por 7 días
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000));

  const expires = `expires=${expiryDate.toUTCString()}`;
  document.cookie = `access_token=${token}; ${expires}; path=/; SameSite=Strict`;
};

export const removeAuthCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const getAuthCookie = () => {
  if (typeof document === 'undefined') return null;
  const name = 'access_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login({ email, password });

      if (!result.ok || !result.data) {
        const errorMsg = result.error || 'Error en el login';
        set({
          error: errorMsg,
          isLoading: false,
        });
        return result;
      }

      const { access_token, user } = result.data;

      // Guardar token en cookies
      setAuthCookie(access_token);

      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: access_token,
        isLoading: false,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return {
        ok: false,
        error: errorMessage,
      };
    }
  },

  logout: () => {
    removeAuthCookie();
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  clearError: () => set({ error: null }),
}));

// Restaurar token de cookies al inicializar
if (typeof window !== "undefined") {
  const token = getAuthCookie();
  if (token) {
    useAuthStore.setState({ token });
  }
}
