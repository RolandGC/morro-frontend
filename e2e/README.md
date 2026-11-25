# E2E con Playwright

## Requisitos

- Backend y frontend levantados.
- Usuario con acceso a las pantallas a probar.
- Datos mínimos para el flujo de ventas:
  - un producto con stock;
  - un cliente;
  - una cuenta de pago;
  - series asignadas al vendedor (`order_note`, `boleta_general`, etc.).

## Configurar credenciales

1. Copiar el archivo de ejemplo:

```bash
cp .env.e2e.example .env.e2e
```

2. Completar `.env.e2e` con un usuario real de pruebas.

3. Ejecutar:

```bash
npm run test:e2e
```

Playwright carga `.env.e2e` automáticamente al arrancar. El archivo está
ignorado por git. También se pueden pasar las variables directamente por
entorno o definir `E2E_ENV_FILE` con otra ruta.

## Variables de entorno

```env
E2E_BASE_URL=http://localhost:3000
E2E_API_URL=http://localhost:4000/api

E2E_EMAIL=admin@elmorro.com
E2E_PASSWORD=...

# Opcional: si no se indica, se usa la primera empresa activa.
E2E_COMPANY_ID=uuid
# E2E_COMPANY_NAME=El Morro

# Flujos que modifican datos. Desactivados por defecto.
E2E_MUTATIONS=0
E2E_SALES_FLOW=0

# Solo para el flujo de venta.
E2E_PRODUCT_NAME=Producto de prueba
E2E_CUSTOMER_DOC=12345678
E2E_PAYMENT_ACCOUNT_NAME=Efectivo
E2E_SALE_AMOUNT=118
```

## Comandos

```bash
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:ui
```

Si el frontend no está levantado:

```bash
E2E_WEB_SERVER_COMMAND="npm run dev" npm run test:e2e
```

## Qué se prueba

- Login/API y selección de empresa mediante `global-setup`.
- Dashboard sin errores de runtime.
- Navegación a ventas, caja, cierre diario, series y configuración de facturación.
- Caja: carga de historial y acciones.
- Caja: apertura y cierre, solo con `E2E_MUTATIONS=1`.
- Series: filtros de ambiente/régimen.
- Ventas: listado y nueva venta.
- Venta + boleta local, solo con `E2E_SALES_FLOW=1` y datos configurados.

## Notas

- El estado de autenticación se genera en `e2e/.auth/state.json` y no se versiona.
- Los tests que modifican datos están desactivados por defecto para no contaminar producción.
- El flujo de venta con `E2E_SALES_FLOW=1` crea una venta real y emite una boleta local; ejecutarlo en un entorno de pruebas.
- El envío a SUNAT no se automatiza todavía porque requiere comprobantes y configuración APISPERU de prueba.
