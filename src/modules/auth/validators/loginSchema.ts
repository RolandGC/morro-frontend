import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Ingrese un correo electrónico válido" })
    .min(1, "El email es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .min(1, "La contraseña es requerida")
    .max(100, "La contraseña no puede superar los 100 caracteres"),
});

export type LoginForm = z.infer<typeof loginSchema>;