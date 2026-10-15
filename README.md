# Torneo de Pádel — Punto de Oro

Sitio del torneo hecho con **Next.js 15 (App Router) + TypeScript**. Incluye la landing (flyer, información, categorías, sponsors), las páginas de **Grupos** y **Cruces** de cada categoría (8va, 7ma, +10 y +15FEM) y un login para editar.

## Cómo correrlo

Requiere Node.js 18.18 o superior.

```bash
npm install
npm run dev        # http://localhost:3000
```

Para producción:

```bash
npm run build
npm start
```

## Login y edición

- Los botones de editar (**Subir/Cambiar flyer**, **Editar** en Grupos y en Cruces) **solo aparecen con la sesión iniciada**. Se inicia sesión con el botón del candado en el encabezado.
- La sesión es una cookie `httpOnly` firmada por el servidor, dura 30 días y se mantiene hasta que se toca **Cerrar sesión**. Vale para todas las páginas a la vez.
- Además de ocultar los botones, **el servidor rechaza cualquier cambio sin sesión** (las rutas `/api/...` devuelven 401), así que no se puede editar sin ingresar.
- El usuario y la clave salen de variables de entorno (archivo `.env.local`, que no se sube a git):

  | Variable | Para qué sirve |
  | --- | --- |
  | `ADMIN_USER` | Usuario (no distingue mayúsculas) |
  | `ADMIN_PASSWORD` | Contraseña |
  | `SESSION_SECRET` | Clave aleatoria para firmar la sesión (mín. 16 caracteres). `openssl rand -base64 32` |
  | `DATA_DIR` | (Opcional) Carpeta donde se guardan los datos editados. Por defecto `./data` |

  **Antes de publicar el sitio, cambiá la contraseña por una más larga** y cargá estas variables también en el servicio donde lo alojes.

## Dónde se guardan los datos

- Los valores iniciales (grupos, cruces y flyer actuales) están en `seed/`.
- Todo lo que se edita desde el sitio se guarda en `data/` (o en `DATA_DIR`), y esa carpeta tiene prioridad sobre `seed/`.
- El almacenamiento está aislado en `src/lib/store.ts`: si más adelante querés usar una base de datos, alcanza con reemplazar las funciones de ese archivo.

> **Importante al publicar:** guardar en archivos necesita un servidor con disco persistente (un VPS, Railway/Render con volumen, etc.). En plataformas "serverless" como Vercel el disco es temporal y los cambios se perderían; ahí hay que cambiar `store.ts` por una base de datos o un servicio de almacenamiento (por ejemplo Vercel Blob / KV o Supabase).

## Estructura

```
seed/                       Datos iniciales (grupos, cruces, flyer)
src/app/page.tsx            Landing
src/app/grupos/[categoria]  Página de grupos por categoría
src/app/cruces/[categoria]  Llave de cruces por categoría
src/app/api/                Login, logout, guardado de grupos/cruces y flyer
src/components/             Encabezados, login, tarjetas, editor de grupos y de llave
src/lib/                    Categorías, sesión, validación y almacenamiento
```

Para cambiar los textos de Información (ubicación, premio, reglamento) editá `src/components/InfoCards.tsx`; para renombrar categorías, `src/lib/categories.ts`.
