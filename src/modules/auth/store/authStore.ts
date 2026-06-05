import { create } from "zustand";
import { authService } from "../services/auth.service";
import { LoginResponse } from "../types/auth.types";
import { removeAuthToken, saveAuthToken, getAuthToken } from "../helpers";
import { Axios, AxiosResponse } from "axios";

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
  login: (email: string, password: string) => Promise<AxiosResponse<LoginResponse>>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}


export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login({ email, password });

      const { access_token, user } = result.data;

      // Guardar token en cookies
      saveAuthToken(access_token);

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
      throw error;
    }
  },

  logout: () => {
    removeAuthToken();
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
  const token = getAuthToken();
  if (token) {
    useAuthStore.setState({ token });
  }
}
