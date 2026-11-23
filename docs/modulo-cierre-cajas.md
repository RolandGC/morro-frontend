# Módulo Cierre de Cajas — El Morro Backend

## Arquitectura

El módulo de cierre de cajas se compone de dos subsistemas que trabajan juntos:

```
┌─────────────────────────────────────────────────────┐
│                Cash Sessions (Sesiones)              │
│  Sesión de caja por usuario/almacén/día.             │
│  Registra el dinero esperado vs. declarado por cada  │
│  cuenta de pago.                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Daily Closings (Cierres por día)        │
│  Cierre global del día por empresa.                  │
│  Calcula total de ventas, créditos, y resumen.       │
└─────────────────────────────────────────────────────┘
```

### Flujo típico diario

```
1. Usuario abre sesión de caja (POST /cash-sessions)
   → status = "open"
   → registra montos esperados por cuenta de pago

2. Durante el día se realizan ventas, pagos, etc.

3. Usuario cierra sesión de caja (POST /cash-sessions/:id/close)
   → declara montos reales por cuenta
   → calcula diferencias (expected vs declared)
   → status = "closed"

4. (Opcional) Al final del día se genera el cierre diario
   → POST /daily-closings
   → calcula total_ventas, total_credito, summary_json
   → status = "open"

5. Se cierra el día (PATCH /daily-closings/:id/close)
   → recalcula todo
   → status = "closed"
```

---

## 1. Cash Sessions (Sesiones de Caja)

### Concepto

Una sesión de caja representa el **inicio y fin de la jornada** de un usuario en un almacén específico. Al abrir la sesión se registra el dinero esperado en cada cuenta de pago (ej. "Caja Soles", "Caja Dólares"). Al cerrar, el usuario declara cuánto hay realmente y el sistema calcula diferencias.

### Endpoints

| Método | Endpoint | Descripción | Permiso |
|--------|----------|-------------|---------|
| `GET` | `/cash-sessions` | Listar sesiones (paginado, filtros) | `cash-sessions.read` |
| `GET` | `/cash-sessions/:id` | Detalle con cuentas y diferencias | `cash-sessions.read` |
| `POST` | `/cash-sessions` | Abrir sesión de caja | `cash-sessions.create` |
| `POST` | `/cash-sessions/:id/close` | Cerrar sesión de caja | `cash-sessions.close` |

### Filtros de listado

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 20) |
| `status` | `open \| closed` | Filtrar por estado |
| `user_id` | UUID | Filtrar por usuario |
| `warehouse_id` | UUID | Filtrar por almacén |
| `company_id` | UUID | Filtrar por empresa |

### Reglas de negocio

- **Apertura**: No se permite abrir una sesión si el mismo usuario ya tiene una sesión `open` en el mismo almacén
- **Cierre**: Solo el usuario que abrió la sesión puede cerrarla
- **Cierre**: Verifica que todas las cuentas declaradas existan en los detalles de la sesión (si no, las crea)
- **Detalles**: Se usa `upsert` en `cash_session_details`: si ya existe un registro para esa cuenta se actualiza, si no se crea
- **Estados**: `open` → `closed` (no se puede reabrir)

### DTOs

**Apertura (`POST /cash-sessions`)**:

```json
{
  "warehouse_id": "uuid",
  "company_id": "uuid",
  "notes": "opcional",
  "details": [
    {
      "payment_account_id": "uuid",
      "expected_amount": 100.00
    }
  ]
}
```

- `details` debe tener al menos 1 item
- `expected_amount` debe ser >= 0

**Cierre (`POST /cash-sessions/:id/close`)**:

```json
{
  "details": [
    {
      "payment_account_id": "uuid",
      "declared_amount": 150.00
    }
  ],
  "notes": "opcional"
}
```

- `details` debe tener al menos 1 item
- `declared_amount` debe ser >= 0
- El sistema calcula `difference = declared_amount - expected_amount`

### Respuesta típica

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "warehouse_id": "uuid",
  "company_id": "uuid",
  "status": "closed",
  "opened_at": "2026-07-07T08:00:00Z",
  "closed_at": "2026-07-07T18:00:00Z",
  "notes": null,
  "user": { "id": "uuid", "name": "Juan Pérez" },
  "warehouse": { "id": "uuid", "name": "Almacén Principal" },
  "cash_session_details": [
    {
      "payment_account_id": "uuid",
      "expected_amount": 100,
      "declared_amount": 150,
      "difference": 50,
      "payment_account": { "id": "uuid", "name": "Caja Soles" }
    }
  ]
}
```

---

## 2. Daily Closings (Cierres por Día)

### Concepto

El cierre diario es un **resumen financiero del día** a nivel de empresa. Calcula automáticamente el total de ventas del día (excluyendo canceladas), el total de ventas al crédito, y genera un resumen JSON con detalles por tipo de pago.

### Endpoints

| Método | Endpoint | Descripción | Permiso |
|--------|----------|-------------|---------|
| `GET` | `/daily-closings` | Listar cierres (paginado, filtros) | `daily-closings.read` |
| `GET` | `/daily-closings/:id` | Obtener detalle del cierre | `daily-closings.read` |
| `POST` | `/daily-closings` | Crear cierre del día (open) | `daily-closings.create` |
| `PATCH` | `/daily-closings/:id/close` | Cerrar el cierre del día | `daily-closings.close` |

### Filtros de listado

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 20) |
| `status` | `open \| closed` | Filtrar por estado |
| `company_id` | UUID | Filtrar por empresa |
| `date_from` | date (ISO) | Fecha inicio (inclusive) |
| `date_to` | date (ISO) | Fecha fin (inclusive) |

### Reglas de negocio

- **Unique**: Solo puede existir un cierre por `(company_id, closing_date)` — si ya existe, devuelve error
- **Apertura**: Calcula `total_sales`, `total_credit` y `summary_json` automáticamente desde las ventas del día
- **Cierre**: Recalcula las ventas al momento del cierre (para reflejar cambios del día, como cancelaciones tardías)
- **Ventas consideradas**: Solo ventas con `status = 'completed'` (no canceladas, no borrador)
- **summary_json**: Estructura que agrupa ventas por método de pago:
  ```json
  {
    "payment_summary": [
      {
        "payment_account_name": "Efectivo",
        "count": 15,
        "total": 1250.00
      },
      {
        "payment_account_name": "Tarjeta",
        "count": 5,
        "total": 800.00
      }
    ]
  }
  ```

### DTOs

**Creación (`POST /daily-closings`)**:

```json
{
  "company_id": "uuid",
  "closing_date": "2026-07-07"
}
```

- `closing_date`: fecha ISO (se trunca a inicio del día en UTC)

**Cierre (`PATCH /daily-closings/:id/close`)**:
- No requiere body
- Recalcula totales al momento del cierre
- Marca `status = "closed"` y `closed_at = now()`

---

## 3. Modelo de Datos

### cash_sessions

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | Usuario que abrió la sesión |
| warehouse_id | UUID (FK → warehouses) | Almacén donde se abre caja |
| company_id | UUID (FK → companies) | Empresa |
| status | cash_session_status enum | `open` \| `closed` |
| opened_at | DateTime | Fecha/hora de apertura |
| closed_at | DateTime? | Fecha/hora de cierre |
| notes | String? | Notas opcionales |

### cash_session_details

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| cash_session_id | UUID (FK → cash_sessions) | Sesión padre |
| payment_account_id | UUID (FK → payment_accounts) | Cuenta de pago |
| expected_amount | Decimal | Monto esperado al abrir |
| declared_amount | Decimal? | Monto declarado al cerrar |
| difference | Decimal? | Diferencia (declared - expected) |

### daily_closings

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | |
| company_id | UUID (FK → companies) | Empresa |
| closing_date | DateTime | Fecha del cierre (unique con company_id) |
| closed_by | UUID (FK → users) | Usuario que cerró |
| total_sales | Decimal | Total ventas del día |
| total_credit | Decimal | Total ventas al crédito |
| summary_json | Json | Resumen por método de pago |
| status | daily_closing_status enum | `open` \| `closed` |
| closed_at | DateTime? | Fecha/hora de cierre |

---

## 4. Permisos

| Permiso | Descripción |
|---------|-------------|
| `cash-sessions.read` | Ver sesiones de caja |
| `cash-sessions.create` | Abrir sesión |
| `cash-sessions.close` | Cerrar sesión (acción extra) |
| `cash-sessions.delete` | Eliminar sesión |
| `daily-closings.read` | Ver cierres diarios |
| `daily-closings.create` | Generar cierre del día |
| `daily-closings.close` | Cerrar cierre del día (acción extra) |
| `daily-closings.delete` | Eliminar cierre |

### Seed de permisos extra

En `prisma/seed.ts` ya existen:

```ts
const EXTRA = [
  { module: 'cash-sessions', action: 'close' },
  // ...
];
```

Para `daily-closings.close` se debe agregar al seed:

```ts
const EXTRA = [
  { module: 'daily-closings', action: 'close' },
  // ...
];
```

---

## 5. Flujo Frontend Sugerido

### Pantalla de Sesión de Caja

```
┌─────────────────────────────────────────────────────┐
│  SESIÓN DE CAJA                                      │
│  Almacén: Principal  |  Usuario: Juan Pérez          │
│                                                      │
│  Estado: ○ Abierta desde 08:00                       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Cuenta         │ Esperado │ Declarado │ Diff  │   │
│  ├──────────────────────────────────────────────┤   │
│  │ Caja Soles     │ 100.00   │ 150.00    │ +50  │   │
│  │ Caja Dólares   │ 0.00     │ 0.00      │ 0    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Abrir Sesión]  [Cerrar Sesión]                     │
└─────────────────────────────────────────────────────┘
```

### Pantalla de Cierre Diario

```
┌─────────────────────────────────────────────────────┐
│  CIERRE DEL DÍA — 07/07/2026                         │
│  Empresa: El Morro SAC                               │
│                                                      │
│  Total Ventas:    S/ 2,050.00                        │
│  Total Crédito:   S/ 500.00                          │
│                                                      │
│  ── Resumen por pago ──                              │
│  Efectivo:     15 ventas  → S/ 1,250.00             │
│  Tarjeta:       5 ventas  → S/ 800.00                │
│                                                      │
│  Estado: ● Abierto                                   │
│                                                      │
│  [Generar Cierre]  [Cerrar Día]                      │
└─────────────────────────────────────────────────────┘
```

---

## 6. SQL de migración

Los modelos ya existen en `prisma/schema.prisma`. La migración SQL debe ser ejecutada por el desarrollador:

```sql
-- Ver docs/sql/queries.md para migración completa
```

---

## 7. Ejemplos de uso con curl

### Abrir sesión de caja

```bash
curl -X POST http://localhost:3000/api/cash-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouse_id": "uuid-almacen",
    "company_id": "uuid-empresa",
    "details": [
      { "payment_account_id": "uuid-cuenta", "expected_amount": 100 }
    ]
  }'
```

### Cerrar sesión de caja

```bash
curl -X POST http://localhost:3000/api/cash-sessions/<session-id>/close \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "details": [
      { "payment_account_id": "uuid-cuenta", "declared_amount": 150 }
    ]
  }'
```

### Generar cierre del día

```bash
curl -X POST http://localhost:3000/api/daily-closings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "uuid-empresa",
    "closing_date": "2026-07-07"
  }'
```

### Cerrar cierre del día

```bash
curl -X PATCH http://localhost:3000/api/daily-closings/<closing-id>/close \
  -H "Authorization: Bearer <token>"
```
