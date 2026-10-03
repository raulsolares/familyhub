import { useState } from 'react';
import { Cloud, CloudOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

/** Indicador de guardado en la nube. `detail` muestra el problema y cómo resolverlo */
const SyncBadge = ({ detail = false }: { detail?: boolean }) => {
  const { sync, retrySync } = useData();
  const [open, setOpen] = useState(false);
  const label = sync.status === 'synced' ? 'Guardado en la nube'
    : sync.status === 'connecting' ? 'Conectando con la nube…'
    : sync.status === 'local' ? 'Solo en este dispositivo'
    : 'No se está guardando en la nube';
  const Icon = sync.status === 'synced' || sync.status === 'connecting' ? Cloud : sync.status === 'local' ? CloudOff : AlertTriangle;
  const bad = sync.status === 'local' || sync.status === 'error';
  const help = sync.status === 'local'
    ? 'Falta configurar Firebase: agrega las variables VITE_FIREBASE_* en Vercel (para Production y Preview) y vuelve a desplegar. Mientras tanto, lo que guardes solo vive en este dispositivo.'
    : sync.error;

  return (
    <span className={`sync-badge s-${sync.status}`}>
      <button type="button" className="sync-pill" onClick={() => bad && setOpen(o => !o)} aria-expanded={bad ? open : undefined} title={help || label}>
        <Icon size={13} /> {label}
      </button>
      {bad && (detail || open) && (
        <span className="sync-help" role="alert">
          {help}
          {sync.status === 'error' && <button type="button" className="btn-xs" onClick={retrySync}><RefreshCw size={12} /> Reintentar</button>}
        </span>
      )}
    </span>
  );
};

export default SyncBadge;
