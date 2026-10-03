import type { PointLog } from '../context/DataContext';
import { dateKey, isoToDateKey } from './dates';

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  xp: number;
  current: number;   // umbral del nivel actual
  next: number | null; // umbral del siguiente nivel
  progress: number;  // 0..1
}

const LEVELS = [
  { at: 0, title: 'Aprendiz', emoji: '🐣' },
  { at: 100, title: 'Explorador', emoji: '🧭' },
  { at: 250, title: 'Ayudante', emoji: '🛠️' },
  { at: 500, title: 'Héroe del hogar', emoji: '🦸' },
  { at: 900, title: 'Campeón', emoji: '🏅' },
  { at: 1400, title: 'Súper estrella', emoji: '🌟' },
  { at: 2000, title: 'Leyenda', emoji: '🐉' },
  { at: 2800, title: 'Maestro', emoji: '🧙' },
  { at: 3800, title: 'Gran maestro', emoji: '👑' },
  { at: 5000, title: 'Mítico', emoji: '🚀' },
];

const earnedLogs = (logs: PointLog[], member: string) =>
  logs.filter(l => l.member === member && l.points > 0);

/** XP = puntos ganados en total; canjear premios no baja de nivel */
export const getXp = (logs: PointLog[], member: string) =>
  earnedLogs(logs, member).reduce((s, l) => s + l.points, 0);

export const getLevel = (logs: PointLog[], member: string): LevelInfo => {
  const xp = getXp(logs, member);
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.at) idx = i; });
  const cur = LEVELS[idx];
  const nxt = LEVELS[idx + 1];
  return {
    level: idx + 1,
    title: cur.title,
    emoji: cur.emoji,
    xp,
    current: cur.at,
    next: nxt ? nxt.at : null,
    progress: nxt ? (xp - cur.at) / (nxt.at - cur.at) : 1,
  };
};

/** Días seguidos (hasta hoy, o hasta ayer si hoy aún no gana puntos) con al menos un logro */
export const getStreak = (logs: PointLog[], member: string) => {
  const days = new Set(earnedLogs(logs, member).map(l => isoToDateKey(l.date)));
  const cursor = new Date();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const getBestStreak = (logs: PointLog[], member: string) => {
  const days = [...new Set(earnedLogs(logs, member).map(l => isoToDateKey(l.date)))].sort();
  let best = 0; let run = 0; let prev: Date | null = null;
  days.forEach(k => {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  });
  return best;
};

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
}

export const getBadges = (logs: PointLog[], member: string): Badge[] => {
  const mine = earnedLogs(logs, member);
  const count = (prefix: string) => mine.filter(l => l.description.startsWith(prefix)).length;
  const best = getBestStreak(logs, member);
  const lvl = getLevel(logs, member).level;
  return [
    { id: 'first', emoji: '✨', name: 'Primer paso', desc: 'Gana tus primeros puntos', earned: mine.length > 0 },
    { id: 'chores10', emoji: '🧹', name: 'Manos a la obra', desc: 'Completa 10 tareas', earned: count('Tarea:') >= 10 },
    { id: 'routines10', emoji: '⏰', name: 'Puntual', desc: 'Completa 10 rutinas', earned: count('Rutina:') >= 10 },
    { id: 'perfect', emoji: '💯', name: 'Día perfecto', desc: 'Todas tus rutinas en un día', earned: count('¡Día perfecto!') > 0 },
    { id: 'streak3', emoji: '🔥', name: 'En racha', desc: '3 días seguidos', earned: best >= 3 },
    { id: 'streak7', emoji: '🌋', name: 'Imparable', desc: '7 días seguidos', earned: best >= 7 },
    { id: 'school5', emoji: '🎒', name: 'Estudioso', desc: '5 pendientes escolares listos', earned: count('Escuela:') >= 5 },
    { id: 'level5', emoji: '🏆', name: 'Campeón', desc: 'Llega al nivel 5', earned: lvl >= 5 },
  ];
};
