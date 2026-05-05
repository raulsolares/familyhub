# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desarrollo

```bash
npm run dev       # Servidor de desarrollo con HMR (Vite)
npm run build     # TypeScript check + build de producción
npm run lint      # ESLint sobre todo el proyecto
npm run preview   # Previsualizar el build de producción
```

No hay suite de tests automatizados en este proyecto.

## Variables de Entorno

Crear `.env.local` con las credenciales de Firebase:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Sin estas variables, la app funciona en modo offline con LocalStorage como fallback.

## Arquitectura

**Stack:** React 19 + TypeScript + Vite + React Router v7 + Firebase Firestore + Lucide React.

**Deploy:** Vercel. `vercel.json` redirige todo a `index.html` para SPA routing.

### Flujo de Estado Global

Todo el estado de la aplicación vive en **dos contextos**:

1. **`UserContext`** (`src/context/UserContext.tsx`): Autenticación local (sin Firebase Auth). Login hardcoded con password `1234` para los 4 miembros. Persiste en `localStorage` (`fh_auth`, `fh_user`). Gestiona el tema activo (`light` | `dark` | `fun`).

2. **`DataContext`** (`src/context/DataContext.tsx`): Toda la data de la app. Se sincroniza con un **único documento Firestore** en `familyhub/main_state`. Al arrancar, `onSnapshot` escucha cambios en tiempo real. Cada mutación llama a `setDoc` para persistir en la nube. Si `db` es `null` (sin config de Firebase), funciona solo con estado en memoria.

### Roles y Temas

- **Padres** (Raúl, Tania): tema `light` o `dark`, acceso completo.
- **Hijos** (Alan, Aria): tema `fun` (rosa/kids), redirigidos automáticamente a `KidZone` desde el Dashboard.

El tema se aplica como clase CSS en el wrapper raíz (`theme-light`, `theme-dark`, `theme-fun`) definido en `src/styles/App.css` usando custom properties CSS (`--p-primary`, `--p-background`, etc.).

### Routing

`App.tsx` define todas las rutas dentro de un `<Layout>` protegido por autenticación. Las rutas públicas solo son `/login`. El Dashboard en `/` renderiza `<KidZone>` si el rol es `child`, o el panel de administración si es `parent`.

### Páginas Principales

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `App.tsx` (Dashboard) | Centro de comando con widgets de urgencias, puntos, menú del día |
| `/menu` | `WeeklyMenu.tsx` | Planificación de menú semanal por miembro y tiempo de comida |
| `/food` | `FoodManager.tsx` | Catálogo de alimentos con ingredientes, categorías y favoritos |
| `/shopping` | `ShoppingList.tsx` | Lista de compras con cálculo automático desde el menú |
| `/shopping/mode` | `ShoppingMode.tsx` | Interfaz móvil para marcar items en el super |
| `/chores` | `Chores.tsx` | Tareas del hogar + rutinas por miembro |
| `/school` | `SchoolHub.tsx` | Pendientes escolares con fechas y alertas |
| `/rewards` | `Rewards.tsx` | Puntos, historial y tienda de premios |
| `/duel` | `KidDuel.tsx` | Pantalla dividida competencia entre Alan y Aria |
| `/settings` | `Settings.tsx` | Panel maestro de configuración de todos los módulos |

### Interfaces TypeScript Clave

Todas las interfaces del dominio están en `DataContext.tsx`: `Food`, `WeeklyMenuItem`, `Product`, `Chore`, `Routine`, `SchoolTask`, `Rule`, `PointLog`, `Member`.

## Pendientes Conocidos

- Audio: sistema de assets de audio reales (actualmente mocks).
- Calendario (`/calendar`): placeholder, sin implementar.
- Notificaciones push via Service Workers.
- Reglas de seguridad de Firestore (actualmente abiertas).
