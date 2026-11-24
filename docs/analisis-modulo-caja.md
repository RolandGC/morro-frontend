# Análisis final — Módulo de Caja y Cierre Diario

## Decisión tomada

El documento normativo `docs/modulo-cierre-cajas.md` describe un contrato que no coincide con el backend original. Después de verificar controladores, DTOs, servicios, guards y respuestas reales, se eligió **mantener el backend intacto y adaptar el frontend**.

Este documento reemplaza las decisiones anteriores que proponían aliases o cambios de backend (`create`/`open`, `expected_amount`/`opening_amount`, `PATCH` para cierre diario, `payment_summary`, exclusión de pagos de ventas anuladas, etc.). Ninguna de esas modificaciones se aplicó.

## Estado del backend

- No hay cambios versionados en `C:\RolandDev\elmorro-backend`.
- Los únicos archivos `untracked` son los SQL de productos ajenos a este módulo (`sql/productos-lote-*.sql`, `sql/referencia-insert-productos.sql`), presentes antes de este trabajo y no tocados.
- El backend original quedó ejecutándose desde `dist` (`node --enable-source-maps ...\dist\src\main.js`).

## Contratos reales verificados

| Tema | Documento | Backend original | Adaptación en el frontend |
|---|---|---|---|
| Permiso de apertura de caja | `cash-sessions.create` | `cash-sessions.open` | Se usa sólo `cash-sessions.open`; se eliminó el alias `create` de constantes y validaciones. |
| Permiso de generación de cierre diario | `daily-closings.create` | `daily-closings.open` | Se usa sólo `daily-closings.open`. |
| Campo de fondo inicial | `expected_amount` | `opening_amount` (DTO con whitelist; `expected_amount` produce 400) | La apertura envía únicamente `opening_amount`. |
| Sesión abierta | No se documenta | `GET /cash-sessions/active` devuelve la sesión del usuario/empresa/almacén con movimientos | El store usa ese endpoint para verificar y precargar detalle. |
| Detalle con movimientos | `GET /cash-sessions/:id` | El listado `GET /cash-sessions` no incluye pagos; `GET /cash-sessions/:id` sí | “Ver detalle” carga el detalle bajo demanda. |
| Cierre diario | `PATCH /daily-closings/:id/close` | `POST /daily-closings/:id/close` (`PATCH` responde 404) | El servicio usa `POST`. |
| `summary_json` | `payment_summary: [...]` | `by_payment_method`, `collections_by_payment_method`, `by_currency`, `total_sales_count`, `total_cash`, etc. | Se normalizan las tablas reales; `payment_summary` queda sólo como fallback de presentación. |
| Estados de venta considerados | `status = 'completed'` | El enum real no tiene `completed`; se usan ventas con `status != 'cancelled'` | No se inventa un estado; la UI respeta lo que calcula el backend. |
| Pagos de ventas anuladas en caja | Deben excluirse | El backend sí los cuenta | La UI los muestra como “Pago de venta anulada” para no divergir del saldo guardado. |
| Propietario de la sesión | Solo el creador puede cerrar | El servicio valida `user_id === user.id` | El botón de cierre sólo aparece habilitado para la sesión propia; las demás muestran icono deshabilitado con tooltip. |

### Endpoints finales usados por el frontend

**Cash sessions**

- `GET /cash-sessions` — listado paginado, sin pagos.
- `GET /cash-sessions/active?company_id=...&warehouse_id=...` — sesión abierta del usuario con detalle completo.
- `GET /cash-sessions/:id` — detalle con `sale_payments` y `receivable_payments`.
- `POST /cash-sessions` con `{ warehouse_id, company_id, notes?, details: [{ payment_account_id, opening_amount }] }`.
- `POST /cash-sessions/:id/close` con `{ details: [{ payment_account_id, declared_amount }], notes? }`.

**Daily closings**

- `GET /daily-closings`
- `GET /daily-closings/:id`
- `POST /daily-closings` con `{ company_id, closing_date: "YYYY-MM-DD" }`.
- `POST /daily-closings/:id/close` sin body.

## Cambios aplicados en el frontend

- `src/config/endPoints.ts`: agregado `CASH_SESSIONS.ACTIVE`.
- `src/modules/finances/cashbox/services/cashbox.service.ts`:
  - nuevo `getActive()`;
  - `open()` envía sólo `opening_amount`.
- `src/modules/finances/cashbox/constants/cashSession.constants.ts`: eliminado `cash-sessions.create`.
- `src/modules/finances/cashbox/store/cashSession.store.ts`:
  - permisos reales `read/open/close`;
  - verificación con `/cash-sessions/active`;
  - precarga de `sessionDetail` desde la respuesta activa;
  - guard de propietario antes de cerrar;
  - limpieza de `sessionDetail` al cerrar.
- `src/modules/finances/cashbox/utils/cashSessionMovements.ts`: cálculo alineado al backend original.
- `src/app/(protected)/finance/cashbox/page.tsx`: “Ver detalle” llama a `GET /cash-sessions/:id` y evita sobrescribir un detalle más reciente.
- `src/app/(protected)/finance/cashbox/columns.tsx`: cierre habilitado únicamente para sesiones propias.
- Modales de caja: `aria-describedby={undefined}` para eliminar warnings de Radix/Dialog.
- `src/modules/finances/dailyClosings/services/dailyClosing.service.ts`: cierre con `POST`.
- `src/modules/finances/dailyClosings/utils/dailyClosingSummary.ts` (nuevo): normalizador de las tablas reales del `summary_json`.
- `src/modules/finances/dailyClosings/types/dailyClosing.types.ts`: tipos alineados al resumen real, conservando `payment_summary` como opcional.
- `src/app/(protected)/finance/daily-closings/page.tsx`:
  - permiso real `daily-closings.open`;
  - espera `permissionsLoaded` antes de mostrar el aviso de permiso o habilitar “Generar cierre”;
  - lectura de empresa en `useEffect` para evitar desajuste de hidratación;
  - guard de cierre duplicado por fecha en la página actual;
  - tarjetas con `total_cash` y `total_sales_count`;
  - tres tablas: “Ventas por método de pago”, “Cobranzas por cuenta/método” y “Ventas por moneda”.

## Cálculos de presentación alineados al backend

### Sesión de caja

Los movimientos mostrados son los mismos que el backend usa para calcular `collected_amount`:

- se usa `amount_base` (no `amount`);
- se excluyen pagos de ventas de crédito;
- se excluyen cobros con `reversed_at`;
- se excluyen cobros cuyo `cash_session_id` no corresponde a la sesión;
- se respeta la ventana `opened_at <= payment_date <= ahora`;
- **no** se excluyen pagos de ventas canceladas, porque el backend original los contabiliza; se etiquetan como “Pago de venta anulada”.

El resumen por cuenta mantiene la fórmula del servidor: `expected = opening + collected` y `difference = declared - expected`.

### Cierre diario

El detalle se construye desde:

- `by_payment_method` → “Ventas por método de pago”;
- `collections_by_payment_method` → “Cobranzas por cuenta/método”;
- `by_currency` → “Ventas por moneda”;
- `total_cash` y `total_sales_count` → tarjetas adicionales.

`payment_summary` sólo se utiliza si una respuesta antigua lo trae; no es el contrato principal.

## Validaciones realizadas

### Estáticas

- `npx tsc --noEmit`: sin errores.
- ESLint del módulo: **0 errores**, 1 warning preexistente en `CashboxDataTable.tsx:62` (TanStack Table incompatible con React Compiler).
- `npm run build`: correcto.

### API (solo lectura / validación de contrato, sin crear datos)

- `GET /cash-sessions/active` → 200 con detalle.
- `GET /cash-sessions/:id` → 200 con `sale_payments` y `receivable_payments`.
- `GET /daily-closings` → 200 con las claves reales de `summary_json`.
- `POST /cash-sessions` con `expected_amount` → 400: `details.0.property expected_amount should not exist`.
- `PATCH /daily-closings/:id/close` → 404: `Cannot PATCH ...`.
- `POST /daily-closings/:id/close` → 404: `Cierre diario no encontrado` (la ruta existe).
- `POST /cash-sessions/:id/close` → 404: `Sesión de caja no encontrada` (la ruta existe).
- `POST /daily-closings` duplicado → 400: `Ya existe un cierre para esta fecha y compañía`.

### Visual

- Login con `admin@elmorro.com` / `admin123`.
- `/finance/cashbox`: tabla cargada, “Ver detalle” dispara `GET /cash-sessions/:id`, sin errores ni warnings en consola.
- `/finance/daily-closings`: tabla cargada, resumen con las tres tablas reales, consola limpia y “Generar cierre” habilitado después de cargar permisos.

## Limitaciones del backend original que NO se corrigieron

Se listan para el informe final; ninguna fue modificada por restricción explícita del trabajo.

1. **Permisos documentados incorrectos.** El documento usa `cash-sessions.create` y `daily-closings.create`, pero los guards exigen `.open`. El frontend se adaptó; el backend sigue sin reconocer `create` como permiso de estas operaciones.
2. **DTO de apertura estricto.** `expected_amount` es rechazado por whitelist. El contrato real es `opening_amount`.
3. **Método de cierre diario distinto.** No existe `PATCH /daily-closings/:id/close`; sólo `POST`. El documento está desactualizado.
4. **`summary_json` distinto al documentado.** No se genera `payment_summary`; se generan buckets por método, moneda y cobranza. El frontend sólo normaliza la forma real.
5. **Estados de venta inconsistentes con el documento.** No existe `completed`. El backend considera `status != 'cancelled'`, por lo que ventas en estados borrador/pendientes también pueden entrar en el cálculo.
6. **Pagos de ventas anuladas se contabilizan en caja.** El backend no los excluye al calcular `collected_amount`. La UI los identifica, pero no puede corregir el total guardado sin cambiar la lógica del servidor.
7. **El listado de sesiones no trae movimientos.** Es necesario un segundo request (`GET /cash-sessions/:id`) para mostrar pagos; el backend no incluye esas relaciones en `findAll`.
8. **Los endpoints de lectura no declaran `@RequirePermissions(...read)`.** Aunque el documento indica `cash-sessions.read` y `daily-closings.read`, los `GET` del backend sólo están protegidos por JWT. El frontend aplica el guard visual, pero no sustituye la autorización del servidor.
9. **Detalles de apertura/cierre sin mínimo real.** Los DTOs no imponen `@ArrayMinSize(1)`; la UI genera al menos una fila, pero el backend no garantiza esa regla documentada.
10. **Unicidad de cierre diario dependiente de verificación previa.** El servicio busca y luego crea; la restricción de BD evita duplicados, pero una carrera puede terminar en error 500 sin un mensaje de negocio controlado. El guard frontend reduce el caso, no lo elimina.
11. **Cierre diario no atómico.** No hay un `claim` como en cash sessions; dos cierres concurrentes podrían pasar la validación de estado.
12. **Fechas con hora no normalizadas.** `closing_date` acepta ISO completo por `@IsDateString()`; el frontend siempre envía `YYYY-MM-DD`, pero otro consumidor podría provocar desplazamientos de día por `toISOString()`.
13. **No existen ingresos/egresos/retiros manuales.** No hay endpoints ni modelos para esos movimientos; no se inventaron en la UI.
14. **Zona horaria fija.** El agregado de cierre diario usa `-05:00` fijo; no es configurable desde el frontend.

## Recomendaciones para el backend (sólo si se autorizara en el futuro)

No aplicadas en este trabajo:

- corregir el documento o los guards/permisos para un único nombre de permiso;
- aceptar un único campo de fondo inicial, o un alias real en el DTO;
- exponer `PATCH` o actualizar la documentación a `POST`;
- generar `payment_summary` o actualizar la documentación al formato real;
- definir y usar un estado de venta “final” coherente con el enum;
- decidir si los pagos de ventas anuladas deben contarse y aplicarlo en el servicio;
- incluir relaciones de pago en el listado o documentar la necesidad del detalle;
- agregar `@RequirePermissions(...read)` a los `GET`;
- reforzar mínimos de `details` y atomicidad de cierre/creación de cierres diarios.
