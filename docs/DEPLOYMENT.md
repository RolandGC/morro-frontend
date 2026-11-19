# Manual de despliegue en VPS Ubuntu (con CI/CD)

Guía paso a paso para desplegar **El Morro Frontend** (Next.js 16) en un VPS con
Ubuntu, usando **Nginx** como reverse proxy, **PM2** para mantener el proceso vivo,
**Let's Encrypt** para HTTPS y **GitHub Actions** para el despliegue automático de
la rama `main`.

## Antes de empezar

- Esta guía asume que **ya estás conectado al VPS por SSH como `root`**.
- Todos los comandos se ejecutan **en el servidor**, salvo los marcados `[LOCAL]`,
  que debes ejecutar en **tu computadora**.
- Usa `root` en todo el servidor para simplificar.

> Reemplaza estos valores de ejemplo por los tuyos:
>
> | Variable | Valor de ejemplo |
> |---|---|
> | Dominio | `app.midominio.com` |
> | IP del VPS | `203.0.113.10` |
> | Ruta de la app | `/var/www/morro-frontend` |
> | Repositorio | `https://github.com/RolandGC/morro-frontend.git` |
> | Puerto interno Next.js | `3002` |

---

## Índice

1. [Arquitectura del despliegue](#1-arquitectura-del-despliegue)
2. [Paso 1 - Preparar el servidor](#paso-1---preparar-el-servidor)
3. [Paso 2 - Instalar dependencias del sistema](#paso-2---instalar-dependencias-del-sistema)
4. [Paso 3 - Clonar el proyecto](#paso-3---clonar-el-proyecto)
5. [Paso 4 - Variables de entorno](#paso-4---variables-de-entorno)
6. [Paso 5 - Primer build y arranque con PM2](#paso-5---primer-build-y-arranque-con-pm2)
7. [Paso 6 - Configurar Nginx](#paso-6---configurar-nginx)
8. [Paso 7 - HTTPS con Let's Encrypt](#paso-7---https-con-lets-encrypt)
9. [Paso 8 - CI/CD con GitHub Actions](#paso-8---cicd-con-github-actions)
10. [Paso 9 - Probar la canalización](#paso-9---probar-la-canalización)
11. [Operación y mantenimiento](#operación-y-mantenimiento)
12. [Solución de problemas](#solución-de-problemas)
13. [Checklist final](#checklist-final)

---

## 1. Arquitectura del despliegue

```
 Internet
    │  HTTPS (443)
    ▼
 ┌─────────┐        ┌──────────────┐        ┌─────────────────────┐
 │  Nginx  │───────▶│  Next.js     │        │  API Backend        │
 │ (proxy) │  :3002 │  (PM2 root)  │───────▶│  (local :4000 o     │
 └─────────┘        └──────────────┘        │   api.midominio.com)│
                                            └─────────────────────┘
```

- **Nginx** recibe el tráfico público en los puertos 80/443 y lo redirige a
  `127.0.0.1:3002`.

> **Puerto libre obligatorio.** El frontend debe escuchar en un puerto que **no esté
> ocupado** por otro servicio del mismo VPS (por ejemplo el backend). Si compartes
> servidor con la API y esta usa `3000`, elige otro puerto para Next.js (`3002` en
> esta guía). Si no, `next start` fallará con `EADDRINUSE` y Nginx terminará
> mostrando el otro servicio (síntoma típico: un 404 JSON de la API en una ruta del
> front). Verifica puertos ocupados con `ss -ltnp`.
- **PM2** (ejecutado por root) mantiene `next start` activo y lo reinicia tras fallos.
- **GitHub Actions** se conecta por SSH como root en cada push a `main`, actualiza el
  código, compila y recarga PM2 sin intervención manual.

---

## Paso 1 - Preparar el servidor

Actualiza el sistema e instala utilidades básicas:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential ufw
```

Configura el firewall:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## Paso 2 - Instalar dependencias del sistema

### Node.js 22 LTS

> Next.js 16 requiere Node.js 20.9 o superior. Se recomienda la versión LTS 22.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v      # debe mostrar v22.x
npm -v
```

### PM2

```bash
npm install -g pm2
pm2 -v
```

### Nginx y Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx
```

Comprueba que Nginx responde:

```bash
# [LOCAL]
curl -I http://app.midominio.com
```

---

## Paso 3 - Clonar el proyecto

`git clone` crea la carpeta `/var/www/morro-frontend` automáticamente; no la
crees antes.

```bash
cd /var/www
git clone https://github.com/RolandGC/morro-frontend.git morro-frontend
cd morro-frontend
git checkout main
```

> Si el repositorio es privado, configura una **Deploy Key** en GitHub
> (repo → Settings → Deploy keys) con una llave SSH generada en el servidor.

---

## Paso 4 - Variables de entorno

### 4.1 Corregir la URL del backend (en tu repositorio)

`src/config/environment.ts` tiene la URL del backend **hardcodeada**:

```ts
export const baseUrl = 'http://localhost:4000/api'
```

Esto **no funciona en producción**: el navegador del usuario resolverá `localhost`
como su propia máquina. El cambio debe hacerse en tu repositorio local y subirse a
`main`; no lo edites directamente en el servidor, porque el script de despliegue
hace `git reset --hard` y lo sobrescribiría.

Edita el archivo en tu equipo y déjalo así:

```ts
export const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'
```

Sube el cambio:

```bash
# [LOCAL]
git add src/config/environment.ts
git commit -m "fix: usar NEXT_PUBLIC_API_URL para el backend"
git push origin main
```

Y actualiza el servidor:

```bash
git pull origin main
```

> Las variables `NEXT_PUBLIC_*` se incrustan en el bundle **en tiempo de build**, por
> lo que deben existir antes de ejecutar `npm run build`.

### 4.2 Crear `.env.production` en el servidor

`.env*` está en `.gitignore`, así que este archivo vive **solo en el servidor** y
nunca se sube al repositorio. El repo incluye una plantilla
`.env.production.example` que puedes copiar como base:

```bash
cd /var/www/morro-frontend
cp .env.production.example .env.production
nano .env.production
```

Contenido esperado:

```env
NEXT_PUBLIC_API_URL=https://api.midominio.com/api
NEXT_PUBLIC_APIS_PERU_BASE_URL=https://dniruc.apisperu.com/api/v1
NEXT_PUBLIC_APIS_PERU_TOKEN=tu_token_aqui
NODE_ENV=production
PORT=3002
```

Ajusta `NEXT_PUBLIC_API_URL` a la URL real de tu backend. El token de APIS Perú solo
se usa en el cliente para autocompletar formularios; si no lo defines, esas
consultas de DNI/RUC fallarán.

### 4.3 Nota de seguridad

El token de APIS Perú (`APIS_PERU_TOKEN`) está hardcodeado en
`src/config/environment.ts` y quedará expuesto en el bundle cliente. Se recomienda
mover esa llamada al backend o usar un proxy, y rotar el token actual.

---

## Paso 5 - Primer build y arranque con PM2

### 5.1 Verificar `ecosystem.config.js`

El proyecto ya incluye `ecosystem.config.js` versionado, así que el clonado lo trae
al servidor. Para revisarlo o editarlo, hazlo siempre en tu repositorio local y
súbelo a `main`; no lo edites solo en el servidor, porque `deploy.sh` hace
`git reset --hard` y restauraría la versión del repositorio.

Contenido de referencia:

```js
module.exports = {
  apps: [
    {
      name: 'morro-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/morro-frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
}
```

> Se usa `fork` con 1 instancia porque Next.js en modo `start` gestiona su propio
> servidor. Si más adelante migras a `output: 'standalone'`, ajusta `script`.

### 5.2 Instalar dependencias y compilar

```bash
cd /var/www/morro-frontend
npm ci
npm run build
```

### 5.3 Arrancar con PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

Configura el arranque automático con el sistema:

```bash
pm2 startup systemd
```

El comando imprime una línea que empieza con `env PATH=... pm2 startup systemd
-u root ...`. Cópiala y ejecútala tal cual, luego:

```bash
pm2 save
pm2 status
```

Verifica que la app responde en el servidor:

```bash
curl -I http://127.0.0.1:3002
```

> **Verifica que el proceso escucha en el puerto correcto.** Si PM2 arranca pero
> `curl` a `127.0.0.1:3002` falla, revisa qué puerto está usando realmente. Un
> desajuste de puerto entre `ecosystem.config.js`, `next start -p` y el
> `proxy_pass` de Nginx produce `502 Bad Gateway` aunque la app esté viva:
>
> ```bash
> ss -ltnp | grep -E ':3000|:3001|:3002'   # confirma que algo escucha en 3002
> pm2 logs morro-frontend --lines 40        # busca EADDRINUSE (puerto ocupado)
> pm2 describe morro-frontend               # revisa args/exec cwd/script
> ```

---

## Paso 6 - Configurar Nginx

```bash
nano /etc/nginx/sites-available/morro-frontend
```

Contenido:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.midominio.com;

    # Tamaño máximo de subida (ajusta si subes archivos)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;

        # Soporte de WebSocket / HMR y streaming de Next.js
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 60s;
    }
}
```

> **Alternativa para el backend:** si no quieres exponerlo en un subdominio,
> déjalo en `127.0.0.1:4000` y añade un bloque `location /api/` con
> `proxy_pass http://127.0.0.1:4000/api/;`, usando
> `NEXT_PUBLIC_API_URL=https://app.midominio.com/api`.

Activa el sitio y recarga Nginx:

```bash
ln -s /etc/nginx/sites-available/morro-frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Comprueba que el dominio sirve la app:

```bash
# [LOCAL]
curl -I http://app.midominio.com
```

---

## Paso 7 - HTTPS con Let's Encrypt

```bash
certbot --nginx -d app.midominio.com
```

Certbot modificará el bloque de Nginx para agregar el puerto 443 y la redirección
desde HTTP. Elige **redirigir todo el tráfico a HTTPS** cuando lo pregunte.

Verifica la renovación automática:

```bash
certbot renew --dry-run
systemctl list-timers | grep certbot
```

Comprueba el certificado:

```bash
# [LOCAL]
curl -I https://app.midominio.com
```

---

## Paso 8 - CI/CD con GitHub Actions

El objetivo es que cada push a `main` despliegue automáticamente.

### 8.1 Generar una llave SSH para el despliegue

```bash
# [LOCAL]
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/morro_deploy -N ""
```

Esto genera dos archivos:
- `~/.ssh/morro_deploy` (llave **privada**) → se copia en el secret `VPS_SSH_KEY`.
- `~/.ssh/morro_deploy.pub` (llave **pública**) → se agrega al servidor.

### 8.2 Autorizar la llave pública en el servidor

La llave nueva aún **no** está autorizada en el servidor, así que para copiarla debes
autenticarte con una llave que **ya funcione** (con la que entras normalmente).

**Paso 1.** En tu equipo local, muestra la llave pública y cópiala (es una sola
línea que empieza con `ssh-ed25519`):

```bash
# [LOCAL]
cat ~/.ssh/morro_deploy.pub
```

**Paso 2.** En el servidor, abre una sesión SSH como root (con tu llave habitual) y
crea la carpeta:

```bash
# [VPS] como root
mkdir -p /root/.ssh && chmod 700 /root/.ssh
nano /root/.ssh/authorized_keys
```

**Paso 3.** Dentro de `nano`: baja con la flecha hasta el final del archivo, pega la
línea copiada (`Ctrl+Shift+V`) asegurándote de que quede en **una línea nueva**
(no pegada a una existente), guarda con `Ctrl+O` + `Enter` y sal con `Ctrl+X`.

**Paso 4.** Ajusta permisos:

```bash
# [VPS] como root
chmod 600 /root/.ssh/authorized_keys
```

**Paso 5.** Prueba desde tu equipo local (debe entrar sin pedir contraseña):

```bash
# [LOCAL]
ssh -i ~/.ssh/morro_deploy -o IdentitiesOnly=yes root@203.0.113.10 "echo OK"
```

> **Si sale `Too many authentication failures`:** tu cliente SSH ofrece demasiadas
> llaves y el servidor corta. El flag `-o IdentitiesOnly=yes` (incluido arriba)
> obliga a usar solo la llave indicada con `-i`. Úsalo siempre en estas pruebas y
> en la conexión del pipeline.
>
> **Alternativa por comando** (sin editar a mano), autenticándote con tu llave que
> ya funciona:
>
> ```bash
> # [LOCAL]
> cat ~/.ssh/morro_deploy.pub | ssh -i ~/.ssh/TU_LLAVE_ACTUAL -o IdentitiesOnly=yes root@203.0.113.10 \
>   "mkdir -p /root/.ssh && chmod 700 /root/.ssh && cat >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys"
> ```

Verifica que root no interactivo encuentra PM2 (lo usará el script de despliegue):

```bash
# [LOCAL]
ssh -i ~/.ssh/morro_deploy -o IdentitiesOnly=yes root@203.0.113.10 "which pm2 && pm2 status"
```

Si `which pm2` no devuelve nada, crea un enlace simbólico en el servidor para que
root no interactivo encuentre PM2:

```bash
# [VPS] como root
ln -sf "$(dirname "$(which node)")/pm2" /usr/local/bin/pm2
```

### 8.3 Crear los GitHub Secrets

Los secrets son **obligatorios**: si falta `VPS_HOST`, el workflow falla al instante
con `Error: missing server host` (sin siquiera intentar conectar).

En GitHub:

1. Abre el repositorio en el navegador (ej. `https://github.com/RolandGC/morro-frontend`).
2. Clic en **Settings** (barra superior; requiere ser administrador del repo).
3. En la barra lateral izquierda: **Secrets and variables → Actions**.
4. Elige la pestaña **Secrets** (no la de **Variables**).
5. Clic en el botón verde **New repository secret**.
6. Repite para cada uno de estos (el nombre debe coincidir **exactamente**):

> **Ojo con la pestaña:** hay dos pestañas, **Secrets** y **Variables**. El workflow
> usa `${{ secrets.VPS_HOST }}`, así que los valores deben estar en la pestaña
> **Secrets**. Si los creas en **Variables**, el workflow no los ve y falla con
> `Error: missing server host`. Además, las Variables son visibles en texto plano,
> lo que sería inseguro para `VPS_SSH_KEY`.

| Name | Secret |
|---|---|
| `VPS_HOST` | `203.0.113.10` |
| `VPS_USER` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Contenido completo de `~/.ssh/morro_deploy` (de `-----BEGIN...` a `-----END...`, ambos incluidos) |
| `ENV_PRODUCTION` | (Opcional) Contenido de tu `.env.production` |

Para copiar la llave privada en el portapapeles:

```bash
# [LOCAL]
cat ~/.ssh/morro_deploy
```

> El valor de `VPS_SSH_KEY` es **toda** la llave privada, con sus líneas
> `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`. No
> pegues la pública (`.pub`), ni un fragmento.

> **Regla de oro:** cualquier ajuste en el workflow de GitHub Actions **solo surte
> efecto si está commiteado y subido a la rama** que dispara el pipeline. Si el
> despliegue sigue fallando igual tras un fix, comprueba que el runner usó el
> commit correcto:
>
> ```bash
> # [LOCAL] confirma que el cambio está en el último commit
> git show HEAD:.github/workflows/deploy.yml | grep -n "<lo-que-cambiaste>"
> git log --oneline -3
> ```
>
> En GitHub → **Actions**, abre el run más reciente y verifica que corresponde a
> ese commit. Si el contenedor/proceso sigue con la configuración vieja, el
> pipeline no aplicó el fix (común al olvidar `git push`).

### 8.4 Verificar el script de despliegue

El proyecto ya incluye `scripts/deploy.sh` versionado en el repositorio, así que no
tienes que crearlo: el clonado/`git reset` lo traen al servidor.

```bash
# [LOCAL] confirma que el script existe en el repo
git ls-files scripts/deploy.sh .github/workflows/deploy.yml ecosystem.config.js
```

Si la salida muestra los tres archivos, están versionados y listos. Para dejarlo
ejecutable en el servidor (una sola vez), tras el primer clonado:

```bash
chmod +x /var/www/morro-frontend/scripts/deploy.sh
```

Contenido de referencia de `scripts/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/morro-frontend"
BRANCH="main"
PM2_APP="morro-frontend"

echo "==> Despliegue iniciado: $(date)"
cd "$APP_DIR"

echo "==> Obteniendo últimos cambios de origin/$BRANCH"
git fetch --all --prune
git reset --hard "origin/$BRANCH"

echo "==> Instalando dependencias"
npm ci

echo "==> Compilando (Next.js build)"
npm run build

echo "==> Reiniciando PM2"
# startOrReload vuelve a leer ecosystem.config.js, por lo que aplica cambios
# de args/env (p. ej. el puerto). 'pm2 reload <name>' NO re-lee el archivo.
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "==> Despliegue completado: $(date)"
```

> **Importante sobre PM2:** `pm2 reload <nombre>` recarga el proceso con la
> definición que PM2 tiene **guardada**, no con el `ecosystem.config.js` actual. Si
> cambias puerto, args o variables en el `ecosystem`, un `pm2 reload` no los aplica.
> Usa siempre `pm2 startOrReload ecosystem.config.js` (o `pm2 delete <nombre> && pm2
> start ecosystem.config.js`).

### 8.5 Verificar el workflow de GitHub Actions

El workflow ya está versionado en `.github/workflows/deploy.yml`. Si necesitas
revisarlo o modificarlo, edítalo en tu equipo y súbelo a `main`:

```bash
# [LOCAL]
git add .github/workflows/deploy.yml
git commit -m "ci: ajustes del workflow de despliegue"
git push origin main
```

Contenido de referencia del workflow:

```yaml
name: Deploy Frontend to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch: {}

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Desplegar por SSH en el VPS
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script_stop: true
          command_timeout: 15m
          script: |
            cd /var/www/morro-frontend
            bash scripts/deploy.sh
```

### 8.6 (Opcional) Gestionar `.env.production` desde un Secret

Si prefieres no crear el `.env.production` a mano en el servidor, define el Secret
`ENV_PRODUCTION` (ver 8.3) y escribe el archivo en el **runner** antes de enviar el
código; el archivo viaja al servidor con el mismo mecanismo de despliegue.

> **No uses `${{ secrets.X }}` directamente en un `script` de `ssh-action` ni
> `echo "x=${{ secrets.X }}" >> $GITHUB_OUTPUT`.** GitHub Actions trimea/corta los
> valores multilínea en esos contextos y el `.env` llega vacío (esta fue la causa
> real de un 502 en el backend). Pasa siempre el secreto por `env:` y escribe el
> archivo con `printf`.

Añade estos pasos al workflow:

```yaml
      - name: Escribir .env.production
        env:
          ENV_FILE_CONTENT: ${{ secrets.ENV_PRODUCTION }}
        run: printf '%s\n' "$ENV_FILE_CONTENT" > .env.production
```

Y en el script de despliegue (o el paso SSH), coloca el archivo donde Next.js lo
lea durante el build:

```bash
cp .env.production /var/www/morro-frontend/.env.production
```

> Como `NEXT_PUBLIC_*` se incrusta en el build, el `.env.production` debe existir
> **antes** de ejecutar `npm run build`; por eso el orden en `deploy.sh` importa.

---

## Paso 9 - Probar la canalización

1. Haz un cambio y súbelo a `main`:

   ```bash
   # [LOCAL]
   git add .
   git commit -m "test: disparar despliegue"
   git push origin main
   ```

2. En GitHub → pestaña **Actions**, abre **Deploy Frontend to VPS** y observa los
   logs.

3. En el servidor, confirma que el proceso se recargó:

   ```bash
   pm2 status
   pm2 logs morro-frontend --lines 50
   ```

4. Comprueba el sitio:

   ```bash
   # [LOCAL]
   curl -I https://app.midominio.com
   ```

También puedes lanzar el despliegue a mano desde **Actions → Deploy Frontend to
VPS → Run workflow** gracias a `workflow_dispatch`.

---

## Operación y mantenimiento

### Logs

```bash
pm2 logs morro-frontend
pm2 logs morro-frontend --lines 200
```

### Rollback a una versión anterior

```bash
cd /var/www/morro-frontend
git log --oneline -10
git reset --hard <COMMIT_ANTERIOR>
npm ci
npm run build
pm2 reload morro-frontend
```

### Reiniciar la app

```bash
pm2 restart morro-frontend
```

### Nginx y certificados

```bash
nginx -t && systemctl reload nginx
certbot renew
```

### Actualizar el sistema

```bash
apt update && apt upgrade -y
```

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| 502 Bad Gateway | Next.js no está corriendo o escucha en otro puerto | Ver sección "Diagnóstico de un 502" |
| El dominio muestra una página JSON de la API (ej. `Cannot GET /auth/login`, `statusCode 404`) | El frontend no arrancó y Nginx apunta a un puerto ocupado por el backend | Ver "Choque de puertos" más abajo |
| `pm2 list` muestra `errored` y el log dice `EADDRINUSE: address already in use :::3000` | Otro servicio (el backend) ocupa ese puerto | Cambia el puerto del frontend (ej. 3002) en `ecosystem.config.js` y en el `proxy_pass` de Nginx |
| El cambio de puerto/args no se aplica tras el deploy | `pm2 reload` no re-lee `ecosystem.config.js` | Usa `pm2 startOrReload ecosystem.config.js` o `pm2 delete` + `pm2 start` |
| La app carga pero los datos fallan | `NEXT_PUBLIC_API_URL` incorrecta o CORS | Revisa `.env.production`, recompila y configura CORS en el backend |
| La app llama a `localhost:4000` en producción | `NEXT_PUBLIC_API_URL` no definida o build viejo | Define la variable y **recompila** (`npm run build`); se incrusta en build |
| Cambios no aparecen tras el deploy | Build cache o PM2 no recargó | `pm2 startOrReload ecosystem.config.js`, borra `.next` y recompila |
| El deploy no aplica un cambio del workflow | El commit no se subió a la rama | `git show HEAD:.github/workflows/deploy.yml` y `git push` |
| El workflow falla con `Error: missing server host` | Secret `VPS_HOST` ausente o creado en **Variables** en vez de **Secrets** | Créalo en Settings → Secrets and variables → Actions → pestaña **Secrets** |
| El workflow falla por timeout SSH | Firewall o llave incorrecta | Verifica `ufw`, `/root/.ssh/authorized_keys` y `VPS_SSH_KEY` |
| `Too many authentication failures` al copiar la llave | El cliente ofrece demasiadas llaves | Usa `ssh -i <llave> -o IdentitiesOnly=yes` |
| `pm2: command not found` en CI | `PATH` no interactivo | `ln -sf "$(dirname $(which node))/pm2" /usr/local/bin/pm2` |
| Certificado no se renueva | Timer de systemd inactivo | `systemctl status certbot.timer` |
| Espacio en disco lleno | Builds/logs acumulados | `du -sh /var/www/morro-frontend/*`, instala `pm2 install pm2-logrotate` |

### Diagnóstico de un 502 Bad Gateway

El 502 significa que **Nginx no pudo hablar con Next.js**. Diagnostica en este
orden:

```bash
# 1. ¿El proceso está vivo?
pm2 status
pm2 logs morro-frontend --lines 80
pm2 describe morro-frontend

# 2. ¿Algo escucha en el puerto que Nginx espera?
ss -ltnp | grep -E ':3000|:3001|:3002'

# 3. ¿Responde directamente (sin pasar por Nginx)?
curl -sS -o /dev/null -w "local 3002 -> %{http_code}\n" http://127.0.0.1:3002

# 4. ¿A dónde apunta Nginx?
nginx -T | grep -A25 "server_name app.midominio.com"

# 5. Error exacto de Nginx
tail -n 30 /var/log/nginx/error.log
```

Interpretación de `error.log`:

| Mensaje | Significado | Acción |
|---|---|---|
| `connect() failed (111: Connection refused)` | Nada escucha en ese puerto | Arrancar/corregir el proceso o el puerto |
| `no live upstreams` | Bloque `upstream` sin servidores disponibles | Revisar `proxy_pass`/`upstream` |
| `recv() failed (104: Connection reset by peer)` | El proceso respondió y cortó | Suele ser crash al arrancar o puerto equivocado |

> Ignora los `error.log` de rutas como `/wp-admin`, `/.env`, `/vendor/...`: son
> escaneos automáticos de bots, no fallos de tu aplicación.

### Choque de puertos (backend y frontend en el mismo VPS)

Síntoma característico: el dominio del frontend devuelve una **respuesta JSON de la
API** (por ejemplo `{"message":"Cannot GET /auth/login","statusCode":404}`) y en
`pm2 list` el proceso aparece `errored`.

Ocurre cuando el frontend intenta usar un puerto ya ocupado por otro servicio (el
backend) en el mismo servidor. Solo un proceso puede escuchar en un puerto.

```bash
# Confirmar el choque
pm2 logs morro-frontend --lines 40     # busca: EADDRINUSE: address already in use
ss -ltnp | grep -E ':3000|:3001|:3002' # ver qué ocupa cada puerto
docker ps --format '{{.Names}}\t{{.Ports}}'
```

Solución:

1. Elige un puerto libre para el frontend (ej. `3002`) y actualízalo en
   `ecosystem.config.js` (repo) y en el `proxy_pass` de Nginx (servidor).
2. Recarga PM2 re-leyendo el `ecosystem` (no con `pm2 reload <nombre>`):
   ```bash
   pm2 delete morro-frontend
   pm2 start ecosystem.config.js
   pm2 save
   ```
3. Recarga Nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```

### Diagnóstico de Nginx

```bash
tail -f /var/log/nginx/error.log
journalctl -u nginx -n 100
```

---

## Checklist final

- [ ] Firewall `ufw` activo con OpenSSH y Nginx Full.
- [ ] Node.js 22, PM2, Nginx y Certbot instalados.
- [ ] Proyecto clonado en `/var/www/morro-frontend`.
- [ ] `environment.ts` usa `NEXT_PUBLIC_API_URL` (ya versionado en el repo).
- [ ] `.env.production` creado en el servidor (a partir de `.env.production.example`).
- [ ] `ecosystem.config.js` presente (ya versionado) y `pm2 save` + `pm2 startup` ejecutados.
- [ ] Sitio Nginx activo y `nginx -t` sin errores.
- [ ] HTTPS funcionando y renovación automática verificada.
- [ ] Llave SSH de despliegue en `/root/.ssh/authorized_keys`.
- [ ] Secrets `VPS_HOST`, `VPS_USER` (`root`), `VPS_PORT`, `VPS_SSH_KEY` creados.
- [ ] `.github/workflows/deploy.yml` y `scripts/deploy.sh` versionados (ya en el repo) y `deploy.sh` ejecutable.
- [ ] El proceso escucha en el mismo puerto al que apunta `proxy_pass` (`ss -ltnp`).
- [ ] `NEXT_PUBLIC_API_URL` definido **antes** del build y la app no llama a `localhost`.
- [ ] Push a `main` despliega correctamente y `curl -I https://app.midominio.com` da 200.

---

## Notas sobre entornos (prod vs staging)

Si separas producción y staging (como hace el backend), ten en cuenta:

- Cada entorno necesita su **propio proceso PM2** (nombre distinto) y su **propio
  puerto** (ej. `3002` prod, `3003` staging) en `ecosystem.config.js`.
- Cada entorno tiene su **propio `.env.production`** (o `.env.staging`) con su
  `NEXT_PUBLIC_API_URL` correspondiente.
- Cada dominio debe tener su bloque Nginx con `proxy_pass` a su puerto.
- Ajusta el workflow para elegir puerto/nombre/ruta según la rama, igual que el
  backend (rama `main` → prod, `develop` → staging).

---

## Recuperación tras borrar el proyecto del servidor

Si eliminas la carpeta del proyecto (por espacio, limpieza, etc.) pero conservas
Node, PM2, Nginx, los certificados y los Secrets de GitHub, **no hace falta
reconfigurar el CI/CD**. Solo devuelve el servidor a su estado mínimo y deja que el
pipeline haga el resto.

> El workflow hace `cd /var/www/morro-frontend`, así que la carpeta **debe existir**.
> Además, `.env.production` **no está en el repo** y debe crearse **antes** del build
> (las variables `NEXT_PUBLIC_*` se incrustan al compilar).

### 1. Liberar espacio

```bash
# [VPS] como root
df -h
npm cache clean --force
pm2 flush
# Opcional, si el backend usa Docker (reconstruye imágenes después):
# docker system prune -af
```

### 2. Verificar que el sistema sigue instalado

```bash
# [VPS] como root
node -v && pm2 -v && nginx -v
ls /etc/nginx/sites-enabled/
ls /etc/letsencrypt/live/
```

Si algo falta, reinstálalo siguiendo los Pasos 2, 6 y 7 de este manual.

### 3. Re-clonar el proyecto

```bash
# [VPS] como root
cd /var/www
git clone https://github.com/RolandGC/morro-frontend.git morro-frontend
cd morro-frontend
```

### 4. Recrear `.env.production`

```bash
# [VPS] como root
cp .env.production.example .env.production
nano .env.production
```

Ajusta al menos `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_APIS_PERU_TOKEN`.

### 5. Limpiar el proceso PM2 viejo

```bash
# [VPS] como root
pm2 delete morro-frontend || true
```

### 6. Levantar la app

Con el CI/CD ya configurado, la opción recomendada es lanzar el workflow desde
GitHub: **Actions → Deploy Frontend to VPS → Run workflow**. El pipeline hace
`npm ci`, build y arranque con PM2.

Alternativa manual, para validar de inmediato:

```bash
# [VPS] como root
chmod +x scripts/deploy.sh
bash scripts/deploy.sh
```

### 7. Verificar

```bash
# [VPS] como root
pm2 status
curl -I http://127.0.0.1:3002        # 200
grep proxy_pass /etc/nginx/sites-available/morro-frontend   # debe ser :3002
nginx -t && systemctl reload nginx
```

```bash
# [LOCAL]
curl -I https://pos.elmorro.com.pe
```

Si el certificado sigue en `/etc/letsencrypt/live/`, no necesitas volver a ejecutar
Certbot.

> Si también borraste el **backend**, ese se recupera por separado: re-clonar en
> `/home/elmorro-pos/apps/nest-api-prod`, recrear su `.env` y lanzar su propio
> workflow.
