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
