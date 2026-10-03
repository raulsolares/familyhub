// GET /api/cron/digest?slot=morning|evening — lo llaman las crons de Vercel (vercel.json).
// Mañana: resumen del día para papás y niños. Noche: recordatorios de lo que falta.
import {
  cronAllowed, dayKey, dayName, daysBetween, loadState, missingConfig, missionsFor, sendTo,
  type FamilyState,
} from '../_lib/family.js';
import { occurrences } from '../../src/utils/events.js';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const morning = async (state: FamilyState) => {
  const today = dayKey();
  const members = state.members || [];
  const kids = members.filter(m => m.role === 'child');
  const parents = members.filter(m => m.role === 'parent').map(m => m.name);
  let sent = 0;

  // Papás: agenda, escuela y premios por aprobar
  const events = (state.familyEvents || []).filter(e => occurrences(e, today, today).length > 0);
  const school = (state.schoolTasks || []).filter(t => !t.completed && [t.eventDate, t.deadline].some(d => d && daysBetween(today, d) >= 0 && daysBetween(today, d) <= 1));
  const prizes = (state.prizeRequests || []).filter(r => r.status === 'pending');
  const mealChanges = (state.mealChangeRequests || []).filter(r => r.status === 'pending');
  const lines = [
    ...events.map(e => `📅 ${e.time ? e.time + ' ' : ''}${e.title}`),
    ...school.map(t => `🎒 ${t.child}: ${t.title}${(t.eventDate || t.deadline) === today ? ' (hoy)' : ' (mañana)'}`),
    ...(prizes.length ? [`🎁 ${plural(prizes.length, 'premio por aprobar', 'premios por aprobar')}`] : []),
    ...(mealChanges.length ? [`🍽️ ${plural(mealChanges.length, 'cambio de comida por aprobar', 'cambios de comida por aprobar')}`] : []),
  ];
  if (lines.length) {
    sent += await sendTo(state, parents, { title: '☀️ Hoy en casa', body: lines.slice(0, 4).join('\n'), url: '/', tag: `digest-${today}` });
  }

  // Niños: sus misiones y lo de la escuela
  for (const k of kids) {
    const { total } = missionsFor(state, k.name, today);
    const mine = school.filter(t => t.child === k.name);
    if (!total && !mine.length) continue;
    const body = [
      total ? `Tienes ${plural(total, 'misión', 'misiones')} para ganar estrellas ⭐` : '',
      ...mine.map(t => `🎒 ${t.title}`),
    ].filter(Boolean).join('\n');
    sent += await sendTo(state, [k.name], { title: `¡Buenos días, ${k.name}! ${k.avatar || ''}`.trim(), body, url: '/', tag: `digest-${today}` });
  }
  return sent;
};

const evening = async (state: FamilyState) => {
  const today = dayKey();
  const tomorrow = dayKey(1);
  const tomorrowName = dayName(tomorrow);
  const members = state.members || [];
  const kids = members.filter(m => m.role === 'child');
  const parents = members.filter(m => m.role === 'parent').map(m => m.name);
  let sent = 0;

  for (const k of kids) {
    const { total, done } = missionsFor(state, k.name, today);
    if (total > done) {
      sent += await sendTo(state, [k.name], {
        title: '🔥 ¡No pierdas tu racha!',
        body: `Te ${total - done === 1 ? 'falta 1 misión' : `faltan ${total - done} misiones`} de hoy.`,
        url: '/', tag: `evening-${today}`,
      });
    }
  }

  const school = (state.schoolTasks || []).filter(t => !t.completed && (t.eventDate === tomorrow || t.deadline === tomorrow));
  const noMenu = kids.filter(k => !(state.weeklyMenu || []).some(w => w.member === k.name && w.day === tomorrowName && w.foodIds.length > 0));
  const lines = [
    ...school.map(t => `🎒 Mañana: ${t.child} · ${t.title}`),
    ...(noMenu.length ? [`🍽️ ${noMenu.map(k => k.name).join(' y ')} sin menú para el ${tomorrowName.toLowerCase()}`] : []),
  ];
  if (lines.length) {
    sent += await sendTo(state, parents, { title: '🌙 Para mañana', body: lines.slice(0, 4).join('\n'), url: '/', tag: `evening-${today}` });
  }
  return sent;
};

export async function GET(req: Request) {
  if (!cronAllowed(req)) return new Response('No autorizado', { status: 401 });
  if (missingConfig().length) return Response.json({ ok: false, skipped: 'push no configurado' });
  const slot = new URL(req.url).searchParams.get('slot') === 'evening' ? 'evening' : 'morning';
  const state = await loadState();
  if (!(state.pushSubscriptions || []).length) return Response.json({ ok: true, sent: 0 });
  const sent = slot === 'evening' ? await evening(state) : await morning(state);
  return Response.json({ ok: true, slot, sent });
}
