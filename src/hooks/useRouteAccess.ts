import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { usePermission } from './usePermission';

type AccessRule = {
  anyOf?: string[];
  allOf?: string[];
};

export function useRouteAccess(required: AccessRule) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { canAny, canAll, isLoaded: permissionsLoaded } = usePermission();

  const anyOf = required.anyOf ?? [];
  const allOf = required.allOf ?? [];

  const hasAny = anyOf.length > 0 ? canAny(anyOf) : true;
  const hasAll = allOf.length > 0 ? canAll(allOf) : true;
  const hasAccess = hasAny && hasAll;
  const needsPermissions = anyOf.length > 0 || allOf.length > 0;
  const isLoading = authLoading || (isAuthenticated && needsPermissions && !permissionsLoaded);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (needsPermissions && permissionsLoaded && !hasAccess) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, needsPermissions, permissionsLoaded, hasAccess, router]);

  return { isLoading, hasAccess };
}
