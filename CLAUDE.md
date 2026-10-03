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

Para notificaciones push (opcional, requiere Firebase) agregar también en Vercel:

```
VITE_VAPID_PUBLIC_KEY=   # misma llave pública, expuesta al navegador
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:tu@correo.com
CRON_SECRET=             # opcional; Vercel lo manda a las crons
```

Las llaves se generan con `npx web-push generate-vapid-keys`.

Sin estas variables, la app guarda todo en `localStorage` (clave `fh_state_v2`) de ese dispositivo. Con Firebase, además sincroniza en tiempo real entre dispositivos. En el primer arranque se cargan datos de ejemplo (`src/data/seed.ts`).

## Arquitectura

**Stack:** React 19 + TypeScript + Vite + React Router v7 + Firebase Firestore + Lucide React.

**Deploy:** Vercel. `vercel.json` redirige todo excepto `/api/*` a `index.html` (SPA routing) y define dos crons diarias.

### Notificaciones push

- Cliente: `src/utils/push.ts` (suscribir dispositivo, `notify()` que hace POST a `/api/push/notify`), `src/hooks/usePush.ts`, panel en Configuración → Notificaciones. Las suscripciones se guardan en el estado (`pushSubscriptions`, por miembro) y se sincronizan a Firestore.
- Servidor (funciones de Vercel en `api/`): `api/push/notify.ts` envía con `web-push` leyendo el documento de Firestore; `api/cron/digest.ts?slot=morning|evening` manda el resumen de 7:00 y los recordatorios de 19:30 (hora de México). Helpers en `api/_lib/family.ts`. `api/` se revisa con su propio `api/tsconfig.json`.
- `public/sw.js` muestra la notificación y abre la URL al tocarla.
- Limitación: `/api/push/notify` no tiene autenticación (igual que Firestore).

### Calendario

- `FamilyEvent` admite `repeat` (diario/semanal con días/mensual/anual, `interval`, `until`), `assignments` (quién hace qué), `endTime` y `location`. Las repeticiones se expanden con `src/utils/events.ts` (sin dependencias; también lo usa `/api`).
- `src/utils/agenda.ts` (`buildAgenda`) junta eventos, escuela y calendarios suscritos para Calendario, Dashboard y la cabina de niños. `EventSheet` muestra el evento completo; `EventForm` lo crea/edita.
- Calendarios externos (`calendarFeeds`): se suscriben con la dirección iCal (p. ej. la "dirección secreta" de Google Calendar). `api/calendar/feed.ts` descarga y expande el .ics con `ical.js` (`api/_lib/ics.ts`); `src/hooks/useCalendarFeeds.ts` refresca cada 15 min y cachea en `localStorage` (`fh_feeds_cache`). Solo lectura.

### Comida semanal con aprobación

- El niño elige su semana y la confirma (`menuLocks[miembro] = lunes de la semana`). Ya confirmada, cada cambio es una `MealChangeRequest` (`swap` con otro día o `replace` por otros platillos) que los papás aprueban en el Dashboard o en Menú semanal (`useMealChanges`), con aviso push en ambos sentidos. `clearWeeklyMenu` reinicia bloqueos y solicitudes.

### Interfaz de niños (cabina espacial)

- `src/styles/space.css` define el tema `theme-fun` (fondo de estrellas, paneles HUD, fuente Orbitron) y todos los estilos de niños.
- `components/Cockpit.tsx`: indicadores (energía, combustible XP, racha, estrellas) y misiones con efectos (misión cumplida, combo, ascenso de rango, hipersalto). `pages/KidDuel.tsx` (`/duel`) es la cabina doble: un `Cockpit` por niño lado a lado para usar el mismo iPad.

### Flujo de Estado Global

Todo el estado de la aplicación vive en **dos contextos**:

1. **`UserContext`** (`src/context/UserContext.tsx`): Sesión local (sin Firebase Auth). La pantalla de acceso muestra los miembros de `DataContext`; los papás entran con PIN (inicial `1234`, editable en Configuración → Familia) y los niños entran directo salvo que se les ponga PIN. Persiste en `localStorage` (`fh_auth`, `fh_user`). Gestiona el tema activo (`light` | `dark` | `fun`).

2. **`DataContext`** (`src/context/DataContext.tsx`): Toda la data de la app en un solo objeto de estado. Siempre se guarda en `localStorage`; si hay Firebase, se sincroniza con un **único documento Firestore** en `familyhub/main_state` (`onSnapshot` + `setDoc`, ignorando ecos propios). `normalize()` migra datos de versiones anteriores.
   - Tareas (`Chore`): el estado `Hecho/Pendiente` se deriva de `lastDone`; las diarias se reinician cada día y las semanales (freq contiene "seman") cada lunes.
   - Puntos: cada `PointLog` automático lleva `sourceKey` para no duplicar y para revertirse al desmarcar.
   - Comida: `Food.maxPerWeek` (por platillo) y `foodGroupLimits` (por `Food.group`) limitan lo que cada niño elige por semana (`src/utils/food.ts`).
   - Gamificación (niveles por XP ganada, rachas, insignias): `src/utils/gamification.ts`.

### Roles y Temas

- **Padres** (Raúl, Tania): tema `light` o `dark`, acceso completo.
- **Hijos** (Alan, Aria): tema `fun` (rosa/kids), redirigidos automáticamente a `KidZone` desde el Dashboard.

Estilos: `src/styles/App.css` (tokens y base) + `src/styles/design.css` (sistema de diseño actual: papás sobrio con Inter, niños con Nunito y colores vivos; sheets, dashboard, menú, navegación móvil).

El tema se aplica como clase CSS en el wrapper raíz (`theme-light`, `theme-dark`, `theme-fun`) definido en `src/styles/App.css` usando custom properties CSS (`--p-primary`, `--p-background`, etc.).

### Routing

`App.tsx` define todas las rutas dentro de un `<Layout>` protegido por autenticación. Las rutas públicas solo son `/login`. El Dashboard en `/` renderiza `<KidZone>` si el rol es `child`, o el panel de administración si es `parent`.

### Páginas Principales

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `Dashboard.tsx` | Centro de comando con widgets de urgencias, puntos, menú del día |
| `/menu` | `WeeklyMenu.tsx` | Planificación de menú semanal por miembro y tiempo de comida |
| `/food` | `FoodManager.tsx` | Catálogo de alimentos con ingredientes, categorías y favoritos |
| `/shopping` | `ShoppingList.tsx` | Lista de compras con cálculo automático desde el menú |
| `/shopping/mode` | `ShoppingMode.tsx` | Interfaz móvil para marcar items en el super |
| `/chores` | `Chores.tsx` | Tareas del hogar + rutinas por miembro |
| `/school` | `SchoolHub.tsx` | Pendientes escolares con fechas y alertas, y calificaciones |
| `/calendar` | `Calendar.tsx` | Calendario mensual con eventos familiares y pendientes escolares |
| `/rewards` | `Rewards.tsx` | Puntos, historial y tienda de premios |
| `/duel` | `KidDuel.tsx` | Pantalla dividida competencia entre Alan y Aria |
| `/settings` | `Settings.tsx` | Panel maestro de configuración de todos los módulos |

### Interfaces TypeScript Clave

Todas las interfaces del dominio están en `DataContext.tsx`: `Food`, `WeeklyMenuItem`, `Product`, `Chore`, `Routine`, `SchoolTask`, `Grade`, `FamilyEvent`, `Rule`, `PointLog`, `Member`.

## Pendientes Conocidos

- Audio: sistema de assets de audio reales (actualmente mocks).
- Reglas de seguridad de Firestore (actualmente abiertas).
