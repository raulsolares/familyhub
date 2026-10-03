import { useEffect, useState } from 'react';

/** Hora actual que se refresca cada `ms` milisegundos */
export const useNow = (ms = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
};
