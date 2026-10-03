// Utilidades del servidor para notificaciones push (funciones de Vercel).
// Lee el mismo documento de Firestore que usa la app y envía con Web Push.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import webpush from 'web-push';

export const TZ = 'America/Mexico_City';

export interface Member { name: string; role: 'parent' | 'child'; avatar?: string }
export interface PushSub { id: string; member: string; endpoint: string; keys: { p256dh: string; auth: string } }
export interface FamilyState {
  members?: Member[];
  chores?: { id: string; name: string; user: string; freq: string; lastDone?: string }[];
  routines?: { id: string; member: string; name: string; tasks: string[] }[];
  routineLogs?: string[];
  schoolTasks?: { id: string; child: string; title: string; eventDate: string; deadline: string; completed: boolean }[];
  familyEvents?: { id: string; title: string; date: string; time?: string; members: string[] }[];
  prizeRequests?: { id: string; member: string; status: string }[];
  weeklyMenu?: { day: string; member: string; foodIds: string[] }[];
  pushSubscriptions?: PushSub[];
}

export type Target = 'parents' | 'kids' | 'all' | string[];
export interface Message { title: string; body: string; url?: string; tag?: string }

const env = (k: string) => process.env[k] || '';

export const missingConfig = () =>
  ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VAPID_PRIVATE_KEY']
    .filter(k => !env(k))
    .concat(env('VAPID_PUBLIC_KEY') || env('VITE_VAPID_PUBLIC_KEY') ? [] : ['VAPID_PUBLIC_KEY']);

const stateDoc = () => {
  const app = getApps()[0] || initializeApp({
    apiKey: env('VITE_FIREBASE_API_KEY'),
    authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: env('VITE_FIREBASE_PROJECT_ID'),
    appId: env('VITE_FIREBASE_APP_ID'),
  });
  return doc(getFirestore(app), 'familyhub', 'main_state');
};

export const loadState = async (): Promise<FamilyState> => {
  const snap = await getDoc(stateDoc());
  return (snap.exists() ? snap.data() : {}) as FamilyState;
};

export const resolveTarget = (state: FamilyState, to: Target): string[] => {
  const members = state.members || [];
  if (Array.isArray(to)) return to;
  if (to === 'all') return members.map(m => m.name);
  return members.filter(m => m.role === (to === 'parents' ? 'parent' : 'child')).map(m => m.name);
};

/** Envía a todos los dispositivos de esos miembros y limpia los que ya no existen. Devuelve cuántos se enviaron. */
export const sendTo = async (state: FamilyState, names: string[], msg: Message) => {
  webpush.setVapidDetails(
    env('VAPID_SUBJECT') || 'mailto:familyhub@example.com',
    env('VAPID_PUBLIC_KEY') || env('VITE_VAPID_PUBLIC_KEY'),
    env('VAPID_PRIVATE_KEY'),
  );
  const subs = (state.pushSubscriptions || []).filter(s => names.includes(s.member));
  const dead: string[] = [];
  let sent = 0;
  await Promise.all(subs.map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(msg), { TTL: 60 * 60 * 6 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) dead.push(s.endpoint);
      else console.error('push error', code, (e as Error).message);
    }
  }));
  if (dead.length) {
    state.pushSubscriptions = (state.pushSubscriptions || []).filter(s => !dead.includes(s.endpoint));
    await updateDoc(stateDoc(), { pushSubscriptions: state.pushSubscriptions }).catch(console.error);
  }
  return sent;
};

// ── Fechas en hora de México ────────────────────────────────────────────────

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** YYYY-MM-DD en la zona de la familia, con desplazamiento de días */
export const dayKey = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86400000).toLocaleDateString('en-CA', { timeZone: TZ });

export const dayName = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};

const weekStart = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
};

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

/** Misiones (tareas + rutinas) de un niño para hoy: total y hechas */
export const missionsFor = (state: FamilyState, kid: string, today: string) => {
  const chores = (state.chores || []).filter(c => c.user === kid || c.user === 'Familia');
  const choreDone = (c: { freq: string; lastDone?: string }) => {
    if (!c.lastDone) return false;
    return /seman/i.test(c.freq) ? weekStart(c.lastDone) === weekStart(today) : c.lastDone === today;
  };
  const logs = new Set(state.routineLogs || []);
  const routines = (state.routines || []).filter(r => r.member === kid);
  const routineDone = (r: { id: string; tasks: string[] }) =>
    r.tasks.length > 0 && r.tasks.every((_, i) => logs.has(`${today}_${r.id}_${i}`));
  return {
    total: chores.length + routines.length,
    done: chores.filter(choreDone).length + routines.filter(routineDone).length,
  };
};

/** Las crons de Vercel mandan "Authorization: Bearer CRON_SECRET" si esa variable existe */
export const cronAllowed = (req: Request) => {
  const secret = env('CRON_SECRET');
  return !secret || req.headers.get('authorization') === `Bearer ${secret}`;
};
