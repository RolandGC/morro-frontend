import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';

/**
 * Hook para proteger rutas en cliente
 * Redirige a login si no está autenticado
 * 
 * @example
 * export default function DashboardPage() {
 *   useProtectedRoute();
 *   return <div>Dashboard</div>;
 * }
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Si terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Retornar si está cargando para evitar flash de contenido
  return { isLoading };
}
