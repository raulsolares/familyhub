// GET /api/calendar/feed?url=<ics>&tz=America/Mexico_City
// Descarga un calendario iCal (p. ej. la dirección secreta de Google Calendar) y regresa sus eventos.
// Lo usa la app para mostrar calendarios suscritos; se refresca solo cada cierto tiempo.
import { parseIcs } from '../_lib/ics.js';

const json = (data: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Vercel guarda la respuesta 5 minutos para no pedirle a Google en cada visita
      ...(cache ? { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } : {}),
    },
  });

const isPrivateHost = (host: string) =>
  /^(localhost|.*\.local|.*\.internal)$/i.test(host)
  || /^\d+\.\d+\.\d+\.\d+$/.test(host)
  || host.includes(':');

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  let target: URL;
  try {
    target = new URL((params.get('url') || '').replace(/^webcal:/i, 'https:'));
  } catch {
    return json({ ok: false, error: 'Dirección inválida' }, 400);
  }
  if (target.protocol !== 'https:' || isPrivateHost(target.hostname)) {
    return json({ ok: false, error: 'La dirección debe empezar con https:// o webcal://' }, 400);
  }
  let tz = params.get('tz') || 'America/Mexico_City';
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch { tz = 'America/Mexico_City'; }

  let text: string;
  try {
    const res = await fetch(target, { headers: { Accept: 'text/calendar' }, redirect: 'follow', signal: AbortSignal.timeout(10000) });
    if (!res.ok) return json({ ok: false, error: `El calendario respondió ${res.status}. Revisa que la dirección sea la secreta en formato iCal.` }, 502);
    text = await res.text();
  } catch {
    return json({ ok: false, error: 'No se pudo descargar el calendario.' }, 502);
  }
  if (!text.includes('BEGIN:VCALENDAR')) return json({ ok: false, error: 'Esa dirección no es un calendario iCal (.ics).' }, 422);
  if (text.length > 5_000_000) return json({ ok: false, error: 'El calendario es demasiado grande.' }, 413);

  const now = Date.now();
  try {
    const events = parseIcs(text, new Date(now - 45 * 86400000), new Date(now + 200 * 86400000), tz);
    return json({ ok: true, events, fetchedAt: new Date().toISOString() }, 200, true);
  } catch {
    return json({ ok: false, error: 'No se pudo leer el calendario.' }, 422);
  }
}
