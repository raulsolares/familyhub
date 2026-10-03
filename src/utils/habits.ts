// Qué toca cada día (rutinas y tareas) y cuánto se cumplió: base de misiones, agenda y hábitos
import type { Chore, Routine } from '../context/DataContext';
import { dateKey, weekStartKey } from './dates';
import { stepIcon, choreIcon } from './icons';

export const isWeekly = (freq: string) => /seman/i.test(freq);

/** Días (0 = domingo … 6 = sábado) de las frecuencias predefinidas */
const FREQ_DAYS: Record<string, number[]> = {
  'Lunes a Viernes': [1, 2, 3, 4, 5],
  'Fin de semana': [0, 6],
};

export const DAY_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
export const DAY_ABBR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
/** Orden lunes → domingo para los selectores */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const dowOf = (key: string) => parseKey(key).getDay();
export const addDays = (key: string, n: number) => {
  const d = parseKey(key); d.setDate(d.getDate() + n);
  return dateKey(d);
};

/** Días en que toca una tarea; null = todos */
export const choreDays = (c: Pick<Chore, 'freq' | 'days'>): number[] | null =>
  c.days && c.days.length ? c.days : FREQ_DAYS[c.freq] || null;

export const isChoreOn = (c: Pick<Chore, 'freq' | 'days' | 'since'>, key: string) => {
  if (c.since && key < c.since) return false;
  if (isWeekly(c.freq)) return true;
  const days = choreDays(c);
  return !days || days.includes(dowOf(key));
};

export const isRoutineOn = (r: Pick<Routine, 'tasks' | 'days' | 'since'>, key: string) =>
  r.tasks.length > 0 && !(r.since && key < r.since) && (!r.days || r.days.length === 0 || r.days.includes(dowOf(key)));

/** Texto corto de los días: "Todos los días", "L a V", "L M V"… */
export const describeDays = (days: number[] | null | undefined) => {
  if (!days || days.length === 0 || days.length === 7) return 'Todos los días';
  const s = [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  if (s.join() === '1,2,3,4,5') return 'Lunes a viernes';
  if (s.join() === '6,0') return 'Fin de semana';
  return s.map(d => DAY_ABBR[d]).join(' · ');
};

export interface HabitLogs {
  routines: Routine[];
  chores: Chore[];
  routineLogs: string[];
  choreLogs: string[];
}

export const isStepDone = (logs: string[], key: string, rid: string, i: number) => logs.includes(`${key}_${rid}_${i}`);

export const isChoreDoneOn = (c: Chore, key: string, choreLogs: string[]) => {
  if (isWeekly(c.freq)) {
    const wk = weekStartKey(parseKey(key));
    return choreLogs.some(l => l.endsWith(`_${c.id}`) && weekStartKey(parseKey(l.slice(0, 10))) === wk)
      || (!!c.lastDone && weekStartKey(parseKey(c.lastDone)) === wk);
  }
  return choreLogs.includes(`${key}_${c.id}`) || c.lastDone === key;
};

export interface HabitItem {
  kind: 'routine' | 'chore';
  id: string;
  name: string;
  icon: string;
  time?: string;
  done: number;
  total: number;
}

/** Hábitos de un miembro en un día: rutinas y tareas diarias propias (las semanales y de 'Familia' no cuentan) */
export const habitsOn = (member: string, key: string, s: HabitLogs): HabitItem[] => [
  ...s.routines
    .filter(r => r.member === member && isRoutineOn(r, key))
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(r => ({
      kind: 'routine' as const, id: r.id, name: r.name, icon: r.icon, time: r.time,
      done: r.tasks.filter((_, i) => isStepDone(s.routineLogs, key, r.id, i)).length,
      total: r.tasks.length,
    })),
  ...s.chores
    .filter(c => c.user === member && !isWeekly(c.freq) && isChoreOn(c, key))
    .map(c => ({
      kind: 'chore' as const, id: c.id, name: c.name, icon: choreIcon(c), time: c.time,
      done: isChoreDoneOn(c, key, s.choreLogs) ? 1 : 0,
      total: 1,
    })),
];

/** Cumplimiento del día (0 a 1): promedio de cada hábito. null si ese día no tocaba nada */
export const dayScore = (items: HabitItem[]) =>
  items.length ? items.reduce((sum, i) => sum + i.done / i.total, 0) / items.length : null;

export const scoreLevel = (pct: number | null) =>
  pct === null ? 'none' : pct >= 0.999 ? 'full' : pct >= 0.6 ? 'good' : pct > 0 ? 'some' : 'zero';

/** Días seguidos cumpliendo un hábito (se saltan los días en que no tocaba; hoy cuenta solo si ya está hecho) */
export const habitStreak = (
  member: string, kind: HabitItem['kind'], id: string, today: string, s: HabitLogs, since: string,
) => {
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const key = addDays(today, -i);
    if (key < since) break;
    const item = habitsOn(member, key, s).find(h => h.kind === kind && h.id === id);
    if (!item) continue;
    if (item.done >= item.total) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
};

/** Días seguidos con al menos 80% de cumplimiento */
export const dayStreak = (member: string, today: string, s: HabitLogs, since: string) => {
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const key = addDays(today, -i);
    if (key < since) break;
    const pct = dayScore(habitsOn(member, key, s));
    if (pct === null) continue;
    if (pct >= 0.8) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
};

/** Misiones de hoy de un niño (cabina): rutinas y tareas que tocan hoy, incluidas las de 'Familia' */
export const todayMissions = (member: string, key: string, s: Pick<HabitLogs, 'routines' | 'chores' | 'routineLogs'>) => {
  const routines = s.routines
    .filter(r => r.member === member && isRoutineOn(r, key))
    .sort((a, b) => a.time.localeCompare(b.time));
  const chores = s.chores
    .filter(c => (c.user === member || c.user === 'Familia') && isChoreOn(c, key))
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  const routineDone = (r: Routine) => r.tasks.every((_, i) => isStepDone(s.routineLogs, key, r.id, i));
  const done = routines.filter(routineDone).length + chores.filter(c => c.status === 'Hecho').length;
  const total = routines.length + chores.length;
  return { routines, chores, done, total, pct: total ? done / total : 0, routineDone };
};

export { stepIcon, choreIcon };
