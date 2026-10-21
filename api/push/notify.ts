// POST /api/push/notify  { to: 'parents'|'kids'|'all'|string[], title, body, url?, tag? }
// La app lo llama cuando pasa algo (un niño pide un premio, termina sus misiones, etc.)
import { loadState, missingConfig, resolveTarget, sendTo, type Target } from '../_lib/family.js';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export async function POST(req: Request) {
  const missing = missingConfig();
  if (missing.length) return json({ ok: false, error: `Faltan variables: ${missing.join(', ')}` }, 503);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok: false, error: 'JSON inválido' }, 400); }

  const to = body.to as Target;
  const valid = to === 'parents' || to === 'kids' || to === 'all'
    || (Array.isArray(to) && to.length > 0 && to.length <= 10 && to.every(n => typeof n === 'string'));
  const title = clip(body.title, 80);
  if (!valid || !title) return json({ ok: false, error: 'Faltan "to" o "title"' }, 400);

  const url = clip(body.url, 100);
  const state = await loadState();
  const sent = await sendTo(state, resolveTarget(state, to), {
    title,
    body: clip(body.body, 200),
    url: url.startsWith('/') ? url : '/',
    tag: clip(body.tag, 80) || undefined,
  });
  return json({ ok: true, sent });
}
