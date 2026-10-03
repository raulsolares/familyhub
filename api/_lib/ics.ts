// Convierte un calendario iCal (.ics) en eventos simples, expandiendo las repeticiones
import ICAL from 'ical.js';

export interface FeedEvent {
  uid: string;
  title: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  notes?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha y hora local (YYYY-MM-DD, HH:MM) en la zona indicada */
const localParts = (d: Date, tz: string) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).map(x => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
};

const convert = (t: ICAL.Time, tz: string) =>
  t.isDate ? { date: `${t.year}-${pad(t.month)}-${pad(t.day)}`, time: undefined } : localParts(t.toJSDate(), tz);

export const parseIcs = (text: string, from: Date, to: Date, tz: string, max = 1500): FeedEvent[] => {
  const comp = new ICAL.Component(ICAL.parse(text));
  comp.getAllSubcomponents('vtimezone').forEach(vtz => ICAL.TimezoneService.register(vtz));

  const vevents = comp.getAllSubcomponents('vevent');
  // Las excepciones (RECURRENCE-ID) se aplican sobre su evento principal
  const exceptions = vevents.filter(v => v.hasProperty('recurrence-id'));
  const masters = vevents.filter(v => !v.hasProperty('recurrence-id'));
  const out: FeedEvent[] = [];

  const add = (ev: ICAL.Event, start: ICAL.Time, end: ICAL.Time | null, key: string) => {
    if (out.length >= max) return;
    const s = convert(start, tz);
    const e = end ? convert(end, tz) : null;
    let endDate = e?.date;
    // En eventos de todo el día, el fin es exclusivo
    if (start.isDate && end) { const x = end.clone(); x.adjust(-1, 0, 0, 0); endDate = convert(x, tz).date; }
    out.push({
      uid: key,
      title: ev.summary || '(Sin título)',
      date: s.date,
      time: s.time,
      endDate: endDate && endDate !== s.date ? endDate : undefined,
      endTime: e?.time,
      allDay: start.isDate,
      location: ev.location || undefined,
      notes: ev.description ? String(ev.description).slice(0, 1000) : undefined,
    });
  };

  const fromT = ICAL.Time.fromJSDate(from, true);
  const toT = ICAL.Time.fromJSDate(to, true);

  for (const vevent of masters) {
    const ev = new ICAL.Event(vevent, { exceptions: exceptions.filter(x => x.getFirstPropertyValue('uid') === vevent.getFirstPropertyValue('uid')) });
    if (vevent.getFirstPropertyValue('status') === 'CANCELLED') continue;
    if (!ev.startDate) continue;
    if (!ev.isRecurring()) {
      const end = ev.endDate || ev.startDate;
      if (end.compare(fromT) >= 0 && ev.startDate.compare(toT) <= 0) add(ev, ev.startDate, ev.endDate, ev.uid);
      continue;
    }
    const it = ev.iterator();
    for (let next = it.next(), i = 0; next && i < 1000; next = it.next(), i++) {
      if (next.compare(toT) > 0) break;
      const det = ev.getOccurrenceDetails(next);
      if (det.endDate.compare(fromT) < 0) continue;
      if (det.item.component.getFirstPropertyValue('status') === 'CANCELLED') continue;
      add(det.item, det.startDate, det.endDate, `${ev.uid}_${next.toString()}`);
    }
  }
  return out.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
};
