# Sistema de Roles y Permisos — El Morro Backend

## Arquitectura General

El sistema implementa **RBAC (Role-Based Access Control)** con los siguientes componentes:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Request Pipeline                            │
├─────────────────────────────────────────────────────────────────────┤
│ 1. JwtAuthGuard (PassportStrategy) → valida token JWT              │
│ 2. PermissionGuard → verifica permisos del usuario                 │
│ 3. Controller → ejecuta la lógica del endpoint                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Flujo de autorización

1. El cliente envía `Authorization: Bearer <token>` en cada request
2. `JwtAuthGuard` extrae el payload JWT, busca el usuario en BD y lo inyecta en `request.user`
3. `PermissionGuard` verifica los permisos:
   - Si el endpoint tiene `@SkipPermissions()` → permite el acceso
   - Si `user.is_superadmin === true` → permite el acceso (bypass total)
   - Si tiene `@RequirePermissions(...)` → verifica que el usuario tenga TODOS esos permisos
   - Si no tiene decorador explícito → **deriva automáticamente** el permiso desde la URL y el método HTTP
4. Si no tiene los permisos requeridos → responde `403 Forbidden`

---

## Cómo se definen los permisos

### Seed de permisos (`prisma/seed.ts`)

Cada módulo del sistema tiene 4 permisos CRUD base:

```ts
const MODULES = [
  'companies', 'warehouses', 'categories', 'brands', 'products',
  'customers', 'suppliers', 'currencies', 'purchases', 'sales',
  'vouchers', 'receivables', 'payment-accounts', 'cash-sessions',
  'daily-closings', 'stock-movements', 'warehouse-stock', 'kardex',
  'lots', 'notifications', 'roles', 'users',
  'price-lists', 'sale-payments',
];

const ACTIONS = ['read', 'create', 'update', 'delete'];
```

Esto genera permisos como: `brands.read`, `brands.create`, `brands.update`, `brands.delete`, `sales.read`, etc.

Además hay **acciones extra** para operaciones no-CRUD:

```ts
const EXTRA = [
  { module: 'sales', action: 'complete' },
  { module: 'sales', action: 'cancel' },
  { module: 'sales', action: 'generate-voucher' },
  { module: 'sales', action: 'payments' },
  { module: 'purchases', action: 'complete' },
  { module: 'purchases', action: 'cancel' },
  { module: 'stock-movements', action: 'approve' },
  { module: 'stock-movements', action: 'complete' },
  { module: 'cash-sessions', action: 'close' },
  { module: 'warehouse-stock', action: 'adjust' },
  { module: 'vouchers', action: 'send' },
  { module: 'vouchers', action: 'check-status' },
  { module: 'roles', action: 'assign' },
];
```

### Convención de nombres

Los nombres de permisos siguen el formato **`{modulo}.{accion}`**, donde:
- `modulo` coincide con el segmento de la URL (ej. `payment-accounts`, `stock-movements`)
- `accion` coincide con el método HTTP para CRUD, o con el nombre de la acción para endpoints custom

> Ejemplos: `payment-accounts.read`, `sales.complete`, `roles.assign`

---

## Cómo proteger un endpoint

### Opción 1: Auto-derivación (implícita)

Si el endpoint usa el `PermissionGuard` y **no** tiene decorador, el guard deriva el permiso desde la URL:

| Ruta | Método | Permiso derivado |
|---|---|---|
| `/api/brands` | GET | `brands.read` |
| `/api/brands` | POST | `brands.create` |
| `/api/brands/:id` | PATCH | `brands.update` |
| `/api/brands/:id` | DELETE | `brands.delete` |
| `/api/sales/:id/complete` | POST | `sales.complete` |

Esto funciona automáticamente para la mayoría de controllers CRUD.

### Opción 2: Decorador explícito (recomendado para acciones custom)

```ts
@Post(':id/complete')
@RequirePermissions('sales.complete')
complete(@Param('id', ParseUUIDPipe) id: string) { ... }
```

### Opción 3: Saltar verificación de permisos

Para endpoints que cualquier usuario autenticado debe poder acceder:

```ts
@Get('permissions')
@SkipPermissions()
findAllPermissions() { ... }
```

---

## Modo superadmin

Los usuarios con `is_superadmin = true` **pasan por alto toda verificación de permisos**. Esto se usa para el seed de desarrollo (`admin@elmorro.com / admin123`) y para administradores del sistema.

---

## Cómo usar los guards en un controller

Todos los controllers protegidos siguen este patrón:

```ts
@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('brands')
export class BrandsController { ... }
```

- **`JwtAuthGuard`** debe ir **primero**: autentica al usuario
- **`PermissionGuard`** debe ir **segundo**: autoriza los permisos
- `@ApiBearerAuth()` es requerido para que Swagger muestre el campo de token

---

## Lista de controllers protegidos

| Controller | Guards | Estado |
|---|---|---|
| AuthController | JwtAuthGuard (parcial) | Solo endpoints protegidos |
| BrandsController | JwtAuthGuard + PermissionGuard | ✅ |
| CategoriesController | JwtAuthGuard + PermissionGuard | ✅ |
| CompaniesController | JwtAuthGuard + PermissionGuard | ✅ |
| CurrenciesController | JwtAuthGuard + PermissionGuard | ✅ |
| CustomersController | JwtAuthGuard + PermissionGuard | ✅ |
| PriceListsController | JwtAuthGuard + PermissionGuard | ✅ |
| ProductUnitsController | JwtAuthGuard + PermissionGuard | ✅ |
| ProductsController | JwtAuthGuard + PermissionGuard | ✅ |
| PurchasesController | JwtAuthGuard + PermissionGuard | ✅ |
| RolesPermissionsController | JwtAuthGuard + PermissionGuard | ✅ |
| SalesController | JwtAuthGuard + PermissionGuard | ✅ |
| SuppliersController | JwtAuthGuard + PermissionGuard | ✅ |
| UserCompaniesController | JwtAuthGuard + PermissionGuard | ✅ |
| UsersController | JwtAuthGuard + PermissionGuard | ✅ |
| WarehousesController | JwtAuthGuard + PermissionGuard | ✅ |

---

## Cómo implementar del lado del Frontend

### 1. Estructura del JWT

Cuando el usuario inicia sesión, el backend devuelve:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@elmorro.com",
    "is_superadmin": true,
    "users_companies": [...]
  }
}
```

El token JWT contiene: `sub` (user id), `email`, `company_id` (después de seleccionar empresa).

### 2. Flujo frontend

```
Login → obtiene token → almacena en localStorage/sessionStorage
  → incluye en cada request como Authorization: Bearer <token>
  → si 401 → redirigir a login
  → si 403 → mostrar "no tienes permisos"
```

### 3. Obtener permisos del usuario

Endpoint: `GET /api/users/:userId/roles`

Respuesta:
```json
[
  {
    "roles": {
      "name": "admin",
      "role_permissions": [
        { "permissions": { "id": "uuid", "name": "sales.read" } },
        { "permissions": { "id": "uuid", "name": "sales.create" } }
      ]
    }
  }
]
```

### 4. Hook/Utilidad para verificar permisos en Frontend

```ts
// utils/permissions.ts
interface UserPermissions {
  is_superadmin: boolean;
  permissions: Set<string>;
}

let userPerms: UserPermissions = { is_superadmin: false, permissions: new Set() };

export function setUserPermissions(
  isSuperadmin: boolean,
  perms: string[],
) {
  userPerms = {
    is_superadmin: isSuperadmin,
    permissions: new Set(perms),
  };
}

export function can(permission: string): boolean {
  if (userPerms.is_superadmin) return true;
  return userPerms.permissions.has(permission);
}

export function canAll(...permissions: string[]): boolean {
  if (userPerms.is_superadmin) return true;
  return permissions.every((p) => userPerms.permissions.has(p));
}
```

### 5. Uso en componentes (React)

```tsx
function ProductList() {
  const { can } = usePermissions();

  return (
    <div>
      <h1>Productos</h1>
      {can('products.create') && (
        <button onClick={() => navigate('/products/new')}>
          Nuevo Producto
        </button>
      )}
    </div>
  );
}
```

### 6. Protección de rutas (React Router)

```tsx
function RequireAuth({ permission, children }: {
  permission: string;
  children: React.ReactNode;
}) {
  const { can, isAuthenticated } = usePermissions();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!can(permission)) return <Navigate to="/unauthorized" />;

  return <>{children}</>;
}

// Uso:
<Route
  path="/sales"
  element={
    <RequireAuth permission="sales.read">
      <SalesPage />
    </RequireAuth>
  }
/>
```

### 7. Carga inicial de permisos

Al hacer login o al cargar la app:

```ts
async function loadUserPermissions(userId: string) {
  const { data } = await api.get(`/users/${userId}/roles`);
  const permissions: string[] = [];

  for (const ur of data) {
    for (const rp of ur.roles.role_permissions) {
      permissions.push(rp.permissions.name);
    }
  }

  setUserPermissions(
    user.is_superadmin,
    [...new Set(permissions)], // deduplicar
  );
}
```

### 8. Consideraciones importantes

| Situación | Acción frontend |
|---|---|
| 401 Unauthorized | Redirigir a login (token expiró o es inválido) |
| 403 Forbidden | Mostrar mensaje "No tienes permisos" |
| Superadmin | Mostrar todos los botones/rutas (no necesita verificación) |
| Sin permisos específicos | Ocultar/deshabilitar acciones (crear, editar, eliminar) |

---

## Resumen de permisos por módulo

| Módulo | Permisos CRUD | Acciones extra |
|---|---|---|
| brands | `brands.read/create/update/delete` | — |
| categories | `categories.read/create/update/delete` | — |
| companies | `companies.read/create/update/delete` | — |
| currencies | `currencies.read/create/update/delete` | — |
| customers | `customers.read/create/update/delete` | — |
| price-lists | `price-lists.read/create/update/delete` | — |
| products | `products.read/create/update/delete` | — |
| purchases | `purchases.read/create/update/delete` | `purchases.complete`, `purchases.cancel` |
| roles | `roles.read/create/update/delete` | `roles.assign` |
| sales | `sales.read/create/update/delete` | `sales.complete`, `sales.cancel`, `sales.generate-voucher`, `sales.payments` |
| suppliers | `suppliers.read/create/update/delete` | — |
| users | `users.read/create/update/delete` | — |
| warehouses | `warehouses.read/create/update/delete` | — |
| vouchers | `vouchers.read/create/update/delete` | `vouchers.send`, `vouchers.check-status` |
| receivables | `receivables.read/create/update/delete` | — |
| payment-accounts | `payment-accounts.read/create/update/delete` | — |
| cash-sessions | `cash-sessions.read/create/update/delete` | `cash-sessions.close` |
| daily-closings | `daily-closings.read/create/update/delete` | — |
| stock-movements | `stock-movements.read/create/update/delete` | `stock-movements.approve`, `stock-movements.complete` |
| warehouse-stock | `warehouse-stock.read/create/update/delete` | `warehouse-stock.adjust` |
| kardex | `kardex.read/create/update/delete` | — |
| lots | `lots.read/create/update/delete` | — |
| notifications | `notifications.read/create/update/delete` | — |
| sale-payments | `sale-payments.read/create/update/delete` | — |
