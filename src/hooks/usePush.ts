import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import {
  pushSupported, pushConfigured, getCurrentSubscription, subscribeThisDevice, unsubscribeThisDevice, deviceName,
} from '../utils/push';

/** Estado de las notificaciones push en este dispositivo para el usuario actual */
export const usePush = () => {
  const { pushSubscriptions, savePushSubscription, removePushSubscription } = useData();
  const { user } = useUser();
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getCurrentSubscription().then(sub => { if (alive) setEndpoint(sub?.endpoint || null); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const record = endpoint ? pushSubscriptions.find(p => p.endpoint === endpoint) : undefined;
  const enabled = !!record && record.member === user?.name;

  /** Activa este dispositivo para el usuario actual, o para otro miembro (p. ej. la tablet de un niño) */
  const enable = async (forMember?: string) => {
    const member = forMember || user?.name;
    if (!member) return false;
    setBusy(true); setError('');
    try {
      const res = await subscribeThisDevice();
      if (!res.ok) { setError(res.error); return false; }
      savePushSubscription({ member, endpoint: res.endpoint, keys: res.keys, device: deviceName() });
      setEndpoint(res.endpoint);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo activar');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const ep = await unsubscribeThisDevice();
      if (ep) removePushSubscription(ep);
      setEndpoint(null);
    } finally {
      setBusy(false);
    }
  };

  return {
    supported: pushSupported(),
    configured: pushConfigured(),
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
    endpoint, record, enabled, busy, error, enable, disable,
  };
};
