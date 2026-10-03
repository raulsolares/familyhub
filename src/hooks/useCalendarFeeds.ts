import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import type { CalendarFeed } from '../context/DataContext';

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

interface FeedCache { url: string; events: FeedEvent[]; fetchedAt: number; error?: string }

const CACHE_KEY = 'fh_feeds_cache';
const REFRESH_MS = 15 * 60 * 1000;

const readCache = (): Record<string, FeedCache> => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
};
const writeCache = (c: Record<string, FeedCache>) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* sin espacio */ }
};

// Una sola descarga a la vez por calendario, compartida entre pantallas
const inflight = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

const fetchFeed = (feed: CalendarFeed, force = false) => {
  const cache = readCache();
  const cur = cache[feed.id];
  if (!force && cur && cur.url === feed.url && Date.now() - cur.fetchedAt < REFRESH_MS) return Promise.resolve();
  if (inflight.has(feed.id)) return inflight.get(feed.id)!;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const p = fetch(`/api/calendar/feed?url=${encodeURIComponent(feed.url)}&tz=${encodeURIComponent(tz)}`)
    .then(async res => {
      const data = await res.json().catch(() => ({ ok: false, error: 'El servidor de calendarios no respondió.' }));
      const next = readCache();
      next[feed.id] = data.ok
        ? { url: feed.url, events: data.events, fetchedAt: Date.now() }
        // Si falla, se conservan los eventos anteriores
        : { url: feed.url, events: next[feed.id]?.url === feed.url ? next[feed.id].events : [], fetchedAt: Date.now(), error: data.error };
      writeCache(next);
    })
    .catch(() => {
      const next = readCache();
      next[feed.id] = { url: feed.url, events: next[feed.id]?.events || [], fetchedAt: Date.now(), error: 'Sin conexión' };
      writeCache(next);
    })
    .finally(() => { inflight.delete(feed.id); listeners.forEach(l => l()); });
  inflight.set(feed.id, p);
  return p;
};

/** Eventos de los calendarios suscritos (Google, iCloud, Outlook…), refrescados cada 15 min */
export const useCalendarFeeds = () => {
  const { calendarFeeds } = useData();
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick(t => t + 1);
    listeners.add(l);
    const refresh = () => calendarFeeds.forEach(f => { fetchFeed(f); });
    refresh();
    const iv = setInterval(refresh, REFRESH_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { listeners.delete(l); clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [calendarFeeds]);

  const cache = readCache();
  return {
    feeds: calendarFeeds.map(f => ({
      feed: f,
      events: cache[f.id]?.url === f.url ? cache[f.id].events : [],
      fetchedAt: cache[f.id]?.url === f.url ? cache[f.id].fetchedAt : undefined,
      error: cache[f.id]?.url === f.url ? cache[f.id].error : undefined,
      loading: inflight.has(f.id),
    })),
    refresh: (id?: string) => calendarFeeds.filter(f => !id || f.id === id).forEach(f => { fetchFeed(f, true); }),
  };
};
