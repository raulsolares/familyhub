// Notificaciones push (Web Push). El servidor vive en /api/push (Vercel).
import { db } from '../firebase';

export const PUSH_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Push necesita llaves VAPID y Firebase (donde se guardan los dispositivos registrados) */
export const pushConfigured = () => !!PUSH_PUBLIC_KEY && !!db;

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
};

export const deviceName = () => {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Dispositivo';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return [os, browser].filter(Boolean).join(' · ');
};

export const getCurrentSubscription = async () => {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
};

/** Pide permiso y suscribe este dispositivo. Devuelve los datos a guardar o un mensaje de error. */
export const subscribeThisDevice = async (): Promise<
  { ok: true; endpoint: string; keys: { p256dh: string; auth: string } } | { ok: false; error: string }
> => {
  if (!pushSupported()) {
    return { ok: false, error: 'Este navegador no soporta notificaciones. En iPhone, primero agrega la app a la pantalla de inicio (Compartir → Agregar a inicio).' };
  }
  if (!pushConfigured()) return { ok: false, error: 'Faltan las llaves de notificaciones o Firebase en la configuración del servidor.' };
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, error: 'No diste permiso de notificaciones. Actívalo en los ajustes del navegador.' };
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_KEY!) }));
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return { ok: false, error: 'No se pudo registrar el dispositivo.' };
  return { ok: true, endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
};

export const unsubscribeThisDevice = async () => {
  const sub = await getCurrentSubscription();
  const endpoint = sub?.endpoint;
  await sub?.unsubscribe();
  return endpoint;
};

export type PushTarget = 'parents' | 'kids' | 'all' | string[];

export interface PushMessage {
  to: PushTarget;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/** Envía una notificación a miembros de la familia (no bloquea; si falla, la app sigue igual) */
export const notify = (msg: PushMessage) => {
  if (!pushConfigured()) return;
  fetch('/api/push/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
    keepalive: true,
  }).catch(() => { /* sin conexión: se omite */ });
};
