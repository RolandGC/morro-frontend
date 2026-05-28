'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/authStore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Verificar si hay token en cookies o localStorage al montar
    const checkAuth = () => {
      const authToken = 
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('auth_token='))
          ?.split('=')[1] || 
        localStorage.getItem('auth_token');
      
      if (authToken && !token) {
        useAuthStore.setState({ token: authToken });
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
