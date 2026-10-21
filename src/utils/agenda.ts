import type { FamilyEvent, SchoolTask, CalendarFeed, EventAssignment } from '../context/DataContext';
import type { FeedEvent } from '../hooks/useCalendarFeeds';
import { occurrences, describeRepeat } from './events';

export const EVENT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6'];

export const SCHOOL_COLORS: Record<string, string> = {
  'Examen': '#ef4444', 'Pagar': '#f97316', 'Llevar material': '#8b5cf6', 'Evento': '#3b82f6',
  'Sin clases': '#6b7280', 'Tarea': '#eab308', 'Otro': '#14b8a6',
};

export interface AgendaItem {
  key: string;
  kind: 'family' | 'school' | 'feed';
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  who: string[];
  color: string;
  notes?: string;
  location?: string;
  category?: string;
  repeatText?: string;
  assignments?: EventAssignment[];
  feedName?: string;
  /** Evento original (para editar o borrar) */
  event?: FamilyEvent;
  school?: SchoolTask;
}

const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
};

interface Sources {
  familyEvents: FamilyEvent[];
  schoolTasks: SchoolTask[];
  feeds?: { feed: CalendarFeed; events: FeedEvent[] }[];
}

/** Todo lo que pasa entre `from` y `to` (YYYY-MM-DD): eventos (con repeticiones), escuela y calendarios suscritos */
export const buildAgenda = ({ familyEvents, schoolTasks, feeds = [] }: Sources, from: string, to: string): AgendaItem[] => {
  const items: AgendaItem[] = [];
  familyEvents.forEach(e => {
    occurrences(e, from, to).forEach(date => items.push({
      key: `${e.id}_${date}`, kind: 'family', title: e.title, date, time: e.time, endTime: e.endTime,
      who: e.members.length ? e.members : ['Familia'], color: e.color || EVENT_COLORS[0], notes: e.notes, location: e.location,
      repeatText: describeRepeat(e.repeat, e.date), assignments: e.assignments?.filter(a => a.task.trim()), event: e,
    }));
  });
  schoolTasks.filter(t => t.eventDate && t.eventDate >= from && t.eventDate <= to).forEach(t => items.push({
    key: t.id, kind: 'school', title: `🎒 ${t.title}`, date: t.eventDate, time: t.eventTime, who: [t.child],
    color: SCHOOL_COLORS[t.category] || '#14b8a6', notes: t.desc, category: t.category, school: t,
  }));
  feeds.forEach(({ feed, events }) => events.forEach(ev => {
    // Los eventos de varios días aparecen en cada día
    for (let d = ev.date, i = 0; d <= (ev.endDate || ev.date) && i < 60; d = addDays(d, 1), i++) {
      if (d < from || d > to) continue;
      items.push({
        key: `${feed.id}_${ev.uid}_${d}`, kind: 'feed', title: ev.title, date: d,
        time: d === ev.date ? ev.time : undefined, endTime: d === ev.date ? ev.endTime : undefined,
        who: feed.members.length ? feed.members : ['Familia'], color: feed.color, notes: ev.notes, location: ev.location, feedName: feed.name,
      });
    }
  }));
  return items.sort((a, b) => (a.date + (a.time || '00:00')).localeCompare(b.date + (b.time || '00:00')));
};

export const isFor = (item: AgendaItem, name: string) => item.who.includes('Familia') || item.who.includes(name);
