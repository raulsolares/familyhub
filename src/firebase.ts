import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Las credenciales de Firebase se deben agregar en Vercel
// o en un archivo .env.local en tu computadora.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Solo inicializar si hay configuración (evita crashear si aún no pones las claves)
const hasConfig = !!firebaseConfig.apiKey;

export const app = hasConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;

// Solo para pruebas locales: VITE_FIRESTORE_EMULATOR=localhost:8080
const emulator = import.meta.env.VITE_FIRESTORE_EMULATOR as string | undefined;
if (db && emulator) {
  const [host, port] = emulator.split(':');
  connectFirestoreEmulator(db, host, Number(port));
}
