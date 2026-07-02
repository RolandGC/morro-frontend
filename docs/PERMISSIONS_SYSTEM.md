# Sistema de Roles y Permisos — Frontend

## Arquitectura

```
Backend (RBAC)                    Frontend
──────────────────────────────    ──────────────────────────────
Token JWT con usuario/rol         Store: authStore (token + user)
GET /users/{id}/permissions  ──►  permission.service.ts
                                  Store: permissionStore (permisos[])
                                  Hook: usePermission (can/canAny/canAll)
                                  Componente: RequirePermission
                                  Hook: useProtectedRoute (1 permiso)
                                  Hook: useRouteAccess (varios permisos)
```

### Ciclo de vida

1. Usuario se loguea → `authStore.login()` guarda token + user
2. `AuthProvider` detecta el token y `user.id` → `fetchPermissions(user.id)`
3. `permission.service.ts` hace `GET /api/users/{userId}/permissions` y extrae los nombres
4. `permissionStore` guarda el array ej: `["products.read", "products.create", "sales.read"]`
5. Cada hook/componente pregunta "¿tiene permiso X?" contra el store
6. Al cerrar sesión → `authStore.logout()` → `clearPermissions()`

---

## API del Store

### `usePermissionStore`

| Método | Descripción |
|---|---|
| `permissions: string[]` | Permisos asignados al usuario |
| `isLoaded: boolean` | true cuando ya se cargaron los permisos del usuario |
| `fetchPermissions(userId)` | Obtiene permisos del usuario |
| `fetchAllPermissions()` | Obtiene lista general de permisos |
| `hasPermission(p)` | ¿Tiene el permiso exacto? |
| `hasAnyPermission([...])` | ¿Tiene al menos uno de la lista? |
| `hasAllPermissions([...])` | ¿Tiene todos los de la lista? |
| `clearPermissions()` | Limpia los permisos (logout) |

### `usePermission()` — Hook de acceso rápido

```ts
const { can, canAny, canAll, permissions, isLoaded } = usePermission();

can('products.read')                          // true/false
canAny(['products.read', 'products.create'])  // true si al menos uno
canAll(['products.read', 'products.create'])  // true solo si todos
```

---

## Proteger una Página (1 permiso)

Usa `useProtectedRoute`:

```ts
'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const { isLoading } = useProtectedRoute('products.read');

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return <div>Lista de productos</div>;
}
```

- Si no está autenticado → redirige a `/auth/login`
- Si no tiene `products.read` → redirige a `/dashboard`
- Mientras verifica permisos → muestra skeleton

Sin `requiredPermission` funciona como antes (solo verifica auth):

```ts
useProtectedRoute(); // solo verifica autenticación
```

---

## Proteger una Página (varios permisos)

Usa `useRouteAccess`:

```ts
import { useRouteAccess } from '@/hooks/useRouteAccess';

// Debe tener AL MENOS UNO de estos:
useRouteAccess({ anyOf: ['sales.read', 'sales.create'] });

// Debe tener TODOS estos:
useRouteAccess({ allOf: ['products.read', 'products.update'] });

// Puede combinar ambos:
useRouteAccess({ anyOf: ['admin.access', 'super.access'], allOf: ['users.read'] });
```

Misma lógica de redirección que `useProtectedRoute`.

---

## Proteger UI (botones, secciones, columnas)

### Con componente `<RequirePermission>`

```tsx
import { RequirePermission } from '@/components/RequirePermission';

<RequirePermission permission="products.create">
  <Button onClick={abrirModal}>Nuevo Producto</Button>
</RequirePermission>

<RequirePermission permission="products.delete" fallback={<span>Sin acceso</span>}>
  <Button variant="destructive">Eliminar</Button>
</RequirePermission>
```

### Con hook `usePermission` para lógica condicional

```tsx
const { can, canAny, canAll } = usePermission();

<Button disabled={!can('products.delete')} onClick={handleDelete}>
  Eliminar
</Button>

// Columnas condicionales
const columns = [
  { accessorKey: 'name', header: 'Nombre' },
  ...(can('products.update')
    ? [{ accessorKey: 'actions', cell: () => <Button>Editar</Button> }]
    : []),
];
```

---

## Sidebar filtrado automáticamente

En `app-sidebar.tsx` cada item del menú declara su permiso requerido:

```ts
{ title: "Productos", url: "/inventory/products", permission: "products.read" }
{ title: "Marcas", url: "/inventory/brands", permission: "brands.read" }
```

Si el usuario no tiene ese permiso, el item no se renderiza. Si un grupo se queda sin items, el grupo completo se oculta.

### Agregar un nuevo item al sidebar

```ts
items: [
  { title: "Productos", url: "/inventory/products", permission: "products.read" },
  { title: "NuevoModulo", url: "/inventory/nuevo", permission: "nuevo.read" },
  //                          ↑ sin permission → siempre visible
]
```

---

## Convención de nombres de permisos

Formato `{modulo}.{accion}`:

| Acción | Permiso |
|---|---|
| Leer listado | `products.read` |
| Crear | `products.create` |
| Actualizar | `products.update` |
| Eliminar | `products.delete` |
| Acción custom | `sales.complete`, `sales.cancel`, `roles.assign` |

Módulos disponibles: `companies`, `warehouses`, `categories`, `brands`, `products`, `customers`, `suppliers`, `currencies`, `purchases`, `sales`, `vouchers`, `receivables`, `payment-accounts`, `cash-sessions`, `daily-closings`, `stock-movements`, `warehouse-stock`, `kardex`, `lots`, `notifications`, `roles`, `users`, `price-lists`, `sale-payments`.

---

## Flujo select-company + permisos

1. Login → `POST /auth/login` → token parcial + datos del usuario
2. Select company → `POST /auth/select-company` → **nuevo token**
3. `AuthProvider` detecta el nuevo token → `fetchPermissions(user.id)`
4. `GET /api/users/{userId}/permissions` devuelve los permisos en esa empresa
5. Store listo para todos los `can()` y `RequirePermission`

---

## Checklist al crear una nueva página/modulo

- [ ] Agregar endpoints en `src/config/endPoints.ts`
- [ ] Agregar servicio en `src/modules/{modulo}/services/`
- [ ] Crear page component con `useProtectedRoute('modulo.read')`
- [ ] Si requiere varios permisos, usar `useRouteAccess({ anyOf: [...] })`
- [ ] Agregar item al sidebar con su `permission`
- [ ] Usar `<RequirePermission>` para acciones (crear/editar/eliminar)
- [ ] Verificar que el backend tenga el permiso sembrado en `prisma/seed.ts`

---

## Archivos del sistema

| Archivo | Rol |
|---|---|
| `src/modules/auth/services/permission.service.ts` | Servicio que llama al endpoint y extrae permisos |
| `src/modules/auth/store/permission.store.ts` | Store Zustand de permisos del usuario |
| `src/hooks/usePermission.ts` | Hook de acceso a permisos |
| `src/hooks/useProtectedRoute.ts` | Protección de rutas (1 permiso opcional) |
| `src/hooks/useRouteAccess.ts` | Protección de rutas (varios permisos: anyOf / allOf) |
| `src/components/RequirePermission.tsx` | Componente condicional por permiso |
| `src/components/auth-provider.tsx` | Dispara fetch de permisos al autenticar |
| `src/modules/auth/store/authStore.ts` | Auth store (clear en logout) |
| `src/config/endPoints.ts` | Endpoints (PERMISSIONS.BY_USER) |
