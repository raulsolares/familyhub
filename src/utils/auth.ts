// Acceso: contraseña de papás, dispositivos autorizados y sesión de 7 días.
// Todo se valida en el navegador: protege el uso diario de la app, no la base de datos.

export const SESSION_DAYS = 7;
export const MIN_PASSWORD = 8;

const DEVICE_KEY = 'fh_device_id';
const ITERATIONS = 150_000;

const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

const derive = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS }, key, 256);
  return toB64(bits);
};

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { passwordHash: await derive(password, salt), passwordSalt: toB64(salt) };
};

export const verifyPassword = async (password: string, m: { passwordHash?: string; passwordSalt?: string }) => {
  if (!m.passwordHash || !m.passwordSalt) return false;
  return (await derive(password, fromB64(m.passwordSalt))) === m.passwordHash;
};

/** Qué le falta a una contraseña nueva (vacío = está bien) */
export const passwordProblem = (pw: string, confirm: string) => {
  if (pw.length < MIN_PASSWORD) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  if (/^\d+$/.test(pw)) return 'Usa letras además de números.';
  if (pw !== confirm) return 'Las contraseñas no coinciden.';
  return '';
};

/** Identificador fijo de este navegador */
export const deviceId = () => {
  let id = '';
  try { id = localStorage.getItem(DEVICE_KEY) || ''; } catch { /* sin almacenamiento */ }
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(DEVICE_KEY, id); } catch { /* sin almacenamiento */ }
  }
  return id;
};

/** Nombre sugerido para el dispositivo, a partir del navegador */
export const suggestedDeviceName = () => {
  const ua = navigator.userAgent;
  const iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iPad) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'Celular Android' : 'Tablet Android';
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Computadora Windows';
  return 'Este dispositivo';
};

export const sessionEnd = (from = Date.now()) => from + SESSION_DAYS * 24 * 60 * 60 * 1000;
