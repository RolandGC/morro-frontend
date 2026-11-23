# Análisis de contradicciones — Módulo de Caja

Documento de trabajo generado antes de modificar el código. Referencia normativa:
`docs/modulo-cierre-cajas.md`. Código revisado: frontend `morro-frontend` y backend
`elmorro-backend` (módulos `cash-sessions`, `daily-closings`, ventas, cobros y
permisos).

## Contradicciones detectadas y decisión

| # | Documento | Código real | Decisión |
|---|-----------|-------------|----------|
| 1 | Permisos `cash-sessions.create` y `daily-closings.create` (tablas de endpoints). | Guards y seed usan `cash-sessions.open` / `daily-closings.open`; `create` también está sembrado pero no se usa. | Aceptar **ambos** nombres en el backend para las operaciones de apertura: `create` (documentado) y `open` (compatibilidad). El frontend acepta cualquiera de los dos. No se elimina ningún permiso existente. |
| 2 | DTO de apertura con `expected_amount`. | Columna y DTO reales usan `opening_amount`; `expected_amount` es calculado en el cierre. | El backend acepta `expected_amount` como alias de `opening_amount` y valida que coincidan si llegan ambos. El frontend envía ambos campos con el mismo valor. No se renombra la columna de BD. |
| 3 | `details` debe tener al menos 1 item en apertura y cierre. | DTOs no tenían `@ArrayMinSize(1)`; el cierre frontal permitía `details: []`. | Aplicar mínimo 1 en backend y frontend. Para sesiones antiguas sin detalles, la UI genera filas desde cuentas de efectivo activas y desde cuentas con movimientos, todas con importe declarado editable. |
| 4 | Respuesta con `payment_account` (singular). | Prisma/backend devuelven `payment_accounts` (plural). | El frontend acepta ambas formas. No se cambia la respuesta del backend para no romper otros consumidores. |
| 5 | Flujo sugerido: apertura/cierre manuales, cierre diario opcional. | Implementación previa del frontend: apertura automática al entrar y cierre obligatorio antes del logout. | Se conserva el comportamiento ya validado del logout (decisión previa del proyecto), pero se separa “cerrar caja” de “finalizar logout” para permitir cierre manual desde Caja sin cerrar sesión. |
| 6 | `PATCH /daily-closings/:id/close`. | Backend expone `POST /daily-closings/:id/close`. | Agregar alias `PATCH` respetando el documento y conservar `POST` por compatibilidad. El frontend usa `PATCH`. |
| 7 | Solo ventas `status = 'completed'`. | El enum real `sale_status` no contiene `completed`; estados finales son `paid` / `delivered`, y `pending` es borrador. | No inventar un estado. Interpretar “no canceladas, no borrador” como `status IN ('paid','delivered')` en el cierre diario. En Cash Sessions se excluyen pagos de ventas canceladas, porque el dinero de una venta anulada no debe contarse como caja. |
| 8 | `summary_json` con `payment_summary: [{ payment_account_name, count, total }]`. | Backend devuelve `by_currency`, `by_payment_method`, etc. | Agregar `payment_summary` con la forma documentada, conservando los campos existentes para no romper consumidores actuales. |
| 9 | `closing_date` se trunca a inicio de día en UTC. | DTO acepta fecha con hora y el servicio construye fechas inválidas si recibe ISO completo; la ventana horaria es fija `-05:00`. | Exigir `YYYY-MM-DD` y usar esa fecha tanto para la unicidad como para el cálculo. Se mantiene la zona horaria real del sistema (`America/Lima`) ya configured en el backend. |
| 10 | `cash_session_details` del documento no incluye `collected_amount` / `expected_amount`. | Existen en Prisma y son necesarios para el cálculo documentado (`expected = opening + collected`). | Mantener los campos y mostrarlos en la UI; el documento está desactualizado en ese punto. Al abrir se inicializan `collected_amount = 0` y `expected_amount = opening_amount`; al cerrar se recalculan. |
| 11 | No se describen ingresos/egresos manualesni retiros de caja. | No existen endpoints ni tablas para ellos. | No inventarlos. Los “movimientos” son pagos de ventas y cobros de crédito vinculados por `cash_session_id`, que es lo que el sistema registra hoy. Se documenta como limitación. |
| 12 | El documento no exige cerrar caja para hacer logout. | Decisión previa del proyecto: cierre obligatorio antes del logout. | Se conserva por ser una decisión ya acordada, pero se permite cerrar caja desde la pantalla de Caja sin salir del sistema. |

## Causas raíz principales

1. **Contrato dividido**: el documento, el seed, los DTOs y el frontend usaban nombres
   distintos para la misma operación (`create`/`open`, `expected`/`opening`), lo que
   produce 403/400 y montos en cero.
2. **Movimientos sin vincular**: el POS no enviaba `cash_session_id`; solo las cuentas
   de efectivo se autoasignaban en backend. Los pagos con otras cuentas quedaban
   fuera del cierre.
3. **Cierre incompleto**: la UI construía las filas solo desde `cash_session_details`,
   sin incluir cuentas con movimientos ni detalles de pagos, y permitía `details: []`.
4. **Cierres diarios ausentes en frontend**: solo existían constantes de endpoints;
   no había servicio, página, validaciones ni menú.
5. **Concurrencia parcial**: Cash Sessions ya tenía claim atómico al cerrar, pero
   Daily Closings no; la creación duplicada y el doble cierre podían competir.
6. **UI de historial incompleta**: columnas comentadas, botón “Crear cierre” sin
   modal, filtros que no recargaban y mensajes de error copiados de otro módulo.

## Principios aplicados

- No crear reglas de negocio nuevas: solo adaptar las reglas documentadas a los
  estados/campos reales del sistema y conservar compatibilidad.
- No eliminar funcionalidades existentes: los alias y campos antiguos se conservan.
- Mantener integridad financiera: importes en moneda base, exclusión de operaciones
  anuladas, cierres atómicos y validación de cuentas.
- No tocar otros módulos salvo lo estrictamente necesario (POS: solo inyección del
  `cash_session_id` en los pagos; navegación: solo alta del item de Cierre Diario).
