// Eventos recurrentes y textos de repetición. Sin dependencias para poder usarse también en /api.

export interface RepeatRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  weekdays?: number[];
  until?: string;
}

interface Repeatable { date: string; repeat?: RepeatRule }

const toDate = (key: string) => { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setUTCDate(c.getUTCDate() + n); return c; };

/** Fechas (YYYY-MM-DD) en que ocurre el evento entre `from` y `to` (incluidos) */
export const occurrences = (ev: Repeatable, from: string, to: string): string[] => {
  if (!ev.date) return [];
  const r = ev.repeat;
  if (!r) return ev.date >= from && ev.date <= to ? [ev.date] : [];
  const start = toDate(ev.date);
  const end = r.until && r.until < to ? r.until : to;
  const every = Math.max(1, r.interval || 1);
  const out: string[] = [];
  const push = (d: Date) => { const k = toKey(d); if (k >= ev.date && k >= from && k <= end) out.push(k); };

  if (r.freq === 'daily' || r.freq === 'weekly') {
    const days = r.freq === 'weekly' && r.weekdays?.length ? r.weekdays : null;
    // Empieza desde el inicio de la semana del evento para respetar el intervalo semanal
    const startWeek = addDays(start, -((start.getUTCDay() + 6) % 7));
    let cursor = toDate(from > ev.date ? from : ev.date);
    for (let i = 0; i < 800 && toKey(cursor) <= end; i++, cursor = addDays(cursor, 1)) {
      const diffDays = Math.round((cursor.getTime() - start.getTime()) / 86400000);
      if (r.freq === 'daily') {
        if (diffDays % every === 0) push(cursor);
      } else {
        const weeks = Math.floor((cursor.getTime() - startWeek.getTime()) / (7 * 86400000));
        const dayOk = days ? days.includes(cursor.getUTCDay()) : cursor.getUTCDay() === start.getUTCDay();
        if (weeks % every === 0 && dayOk) push(cursor);
      }
    }
    return out;
  }

  // Mensual / anual: mismo día del mes (se omiten meses sin ese día, p. ej. 31)
  const step = r.freq === 'monthly' ? every : every * 12;
  for (let i = 0; i < 400; i++) {
    const months = i * step;
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, start.getUTCDate()));
    if (d.getUTCDate() !== start.getUTCDate()) continue;
    const k = toKey(d);
    if (k > end) break;
    push(d);
  }
  return out;
};

const DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** "Cada semana: lun, mié" · "Cada 2 meses" · "Cada año hasta 2027-06-30" */
export const describeRepeat = (r?: RepeatRule, date?: string) => {
  if (!r) return '';
  const n = Math.max(1, r.interval || 1);
  const unit = { daily: ['día', 'días'], weekly: ['semana', 'semanas'], monthly: ['mes', 'meses'], yearly: ['año', 'años'] }[r.freq];
  let text = n === 1 ? `Cada ${unit[0]}` : `Cada ${n} ${unit[1]}`;
  if (r.freq === 'weekly') {
    const days = r.weekdays?.length ? r.weekdays : date ? [toDate(date).getUTCDay()] : [];
    const ordered = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
    if (ordered.length) text += `: ${ordered.map(d => DAY_SHORT[d]).join(', ')}`;
  }
  if (r.until) text += ` hasta el ${toDate(r.until).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`;
  return text;
};
