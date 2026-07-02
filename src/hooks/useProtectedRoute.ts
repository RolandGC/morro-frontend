import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { usePermission } from './usePermission';

export function useProtectedRoute(requiredPermission?: string) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { can, isLoaded: permissionsLoaded } = usePermission();

  const isLoading = authLoading || (isAuthenticated && requiredPermission && !permissionsLoaded);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (requiredPermission && permissionsLoaded && !can(requiredPermission)) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, requiredPermission, permissionsLoaded, can, router]);

  return { isLoading };
}
