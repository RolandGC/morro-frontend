'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel, } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { loginSchema, LoginForm } from '@/modules/auth/validators/loginSchema';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';

export function LoginFormData({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { success, error } = useToast();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await login(data.email, data.password);

      console.log('Login result:', response);

      if (response.status === 201) {
        success('¡Login exitoso!');
        router.push('/select-company');
      } 
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log('Status:', err.response?.status);
        console.log('Data:', err.response?.data);
        console.log('Message API:', err.response?.data?.message);
      } else {
        console.log('Error desconocido:', err);
      }
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <img src="/logo-morro.png" alt="" />
          </div>
          <CardTitle className="text-xl">Bienvenido</CardTitle>
          <CardDescription>Ingrese sus credenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Cargando...' : 'Ingresar'}
                </Button>
                <FieldDescription className="text-center">
                  ¿No tienes cuenta? <a href="/auth/register" className="underline">Regístrate</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptas nuestros{' '}
        <a href="#" className="underline">
          Términos de Servicio
        </a>{' '}
        y{' '}
        <a href="#" className="underline">
          Política de Privacidad
        </a>
        .
      </FieldDescription>
    </div>
  );
}
