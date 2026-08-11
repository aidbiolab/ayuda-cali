# Ayuda Cali — Mapa de Ayuda Terremoto

Aplicación web para conectar **pedidos de ayuda** con **voluntarios** tras el terremoto del 10 de agosto de 2026 en Cali, Colombia.

## Características

- Mapa interactivo centrado en Cali (Leaflet + OpenStreetMap)
- Zonas críticas pre-cargadas (Cuarto de Legua, Capri, HUV, Comunas 17/19, etc.)
- Cualquier persona puede registrar un **pedido de ayuda** haciendo click en el mapa
- **Datos obligatorios de la persona que recibe la ayuda** (nombre + teléfono)
- Voluntarios pueden "tomar" pedidos y actualizar su estado (Abierto → Tomado → En camino → Completado)
- Vista de lista + filtros
- 100% responsive (móvil primero)
- Auto-refresh cada 30 segundos

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Leaflet + react-leaflet
- Prisma + PostgreSQL
- Desplegable en **Railway** con un click desde GitHub

---

## Despliegue rápido en Railway (recomendado)

### 1. Sube el código a GitHub

```bash
cd ayuda-cali
git init
git add .
git commit -m "Ayuda Cali - mapa de ayuda terremoto"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ayuda-cali.git
git push -u origin main
```

### 2. Crea el proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. **New Project** → **Deploy from GitHub repo** → selecciona `ayuda-cali`
3. Railway detectará Next.js automáticamente

### 3. Añade PostgreSQL

1. En el canvas del proyecto haz click en **+ New**
2. Elige **Database** → **PostgreSQL**
3. Railway creará la base de datos

### 4. Conecta la base de datos a la app

1. Click en el servicio de tu aplicación (Next.js)
2. Ve a la pestaña **Variables**
3. Click en **Add Variable Reference**
4. Selecciona `DATABASE_URL` del servicio Postgres
5. (Opcional pero recomendado) Añade también:
   ```
   NODE_ENV=production
   ```

### 5. Configura el build y migraciones

En el servicio de la app → **Settings** → **Deploy**:

- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma db push && npx tsx prisma/seed.ts && npm start`
  (o mejor: usa un pre-deploy command para migraciones)

**Recomendado** (más limpio):

1. En **Settings → Deploy → Pre-Deploy Command**:
   ```
   npx prisma db push && npx tsx prisma/seed.ts
   ```
2. Start Command: `npm start`

### 6. Genera el dominio público

En el servicio de la app → **Settings** → **Networking** → **Generate Domain**

¡Listo! La app estará en `https://ayuda-cali-production-xxxx.up.railway.app`

---

## Desarrollo local

```bash
# 1. Clona e instala
git clone https://github.com/TU_USUARIO/ayuda-cali.git
cd ayuda-cali
npm install

# 2. Configura la base de datos
cp .env.example .env
# Edita .env y pon tu DATABASE_URL (puedes usar una de Railway o local)

# 3. Crea las tablas y seed
npx prisma db push
npm run db:seed

# 4. Arranca
npm run dev
```

Abre http://localhost:3000

---

## Cómo usar la app

### Pedir ayuda
1. Abre el mapa
2. Toca el lugar donde se necesita la ayuda
3. Completa el formulario (especialmente los datos de **quien recibe** la ayuda)
4. Envía

### Ofrecer ayuda (voluntario)
1. Ve a la pestaña **Lista** o toca un marcador rojo en el mapa
2. Click en **Tomar este pedido**
3. Ingresa tu nombre y teléfono
4. Actualiza el estado cuando estés en camino o cuando completes la entrega

---

## Notas de seguridad y moderación

Esta es una versión de emergencia (MVP). En producción real se recomienda:

- Rate limiting
- Moderación de pedidos
- Verificación de teléfonos
- Posible autenticación simple para voluntarios

Por ahora priorizamos **velocidad de despliegue** y **facilidad de uso** en smartphones.

---

Hecho con ❤️ para Cali — Agosto 2026
