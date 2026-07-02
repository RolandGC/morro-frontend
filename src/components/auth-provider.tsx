'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { usePermissionStore } from '@/modules/auth/store/permission.store';
import { authService } from '@/modules/auth/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const fetchPermissions = usePermissionStore((s) => s.fetchPermissions);
  const isPermissionsLoaded = usePermissionStore((s) => s.isLoaded);

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = 
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('access_token='))
          ?.split('=')[1] || 
        localStorage.getItem('auth_token');
      
      if (authToken && !token) {
        useAuthStore.setState({ token: authToken });
      }

      if (authToken && useAuthStore.getState().user === null) {
        try {
          const res = await authService.getCurrentUser();
          if (res.ok && res.data) {
            useAuthStore.setState({
              user: { id: res.data.id, email: res.data.email, name: res.data.name },
            });
          }
        } catch {
          // si falla al obtener usuario, forzar logout
          useAuthStore.getState().logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (token && user?.id && !isPermissionsLoaded) {
      fetchPermissions(user.id);
    }
  }, [token, user?.id, isPermissionsLoaded, fetchPermissions]);

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
