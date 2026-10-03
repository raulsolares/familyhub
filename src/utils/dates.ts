// Utilidades de fecha en hora local (YYYY-MM-DD)

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const dateKey = (d: Date = new Date()) => d.toLocaleDateString('en-CA');

export const todayKey = () => dateKey(new Date());

export const todayName = () => DAY_NAMES[new Date().getDay()];

/** Lunes de la semana de la fecha dada, como YYYY-MM-DD */
export const weekStartKey = (d: Date = new Date()) => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return dateKey(copy);
};

export const isoToDateKey = (iso: string) => dateKey(new Date(iso));

export const daysUntil = (key: string) => {
  if (!key) return 9999;
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

/** Lunes de la semana siguiente (YYYY-MM-DD) */
export const nextWeekStartKey = (d: Date = new Date()) => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
  return weekStartKey(copy);
};

/** Fecha (día del mes) de un día de la semana (0 = lunes) dentro de la semana que empieza en `week` */
export const dateInWeek = (week: string, idx: number) => {
  const [y, m, d] = week.split('-').map(Number);
  return new Date(y, m - 1, d + idx);
};

/** "29 sep – 5 oct" */
export const weekRange = (week: string) => {
  const a = dateInWeek(week, 0); const b = dateInWeek(week, 6);
  const fmt = (d: Date, month: boolean) => d.toLocaleDateString('es-MX', month ? { day: 'numeric', month: 'short' } : { day: 'numeric' });
  return `${fmt(a, a.getMonth() !== b.getMonth())} – ${fmt(b, true)}`;
};
