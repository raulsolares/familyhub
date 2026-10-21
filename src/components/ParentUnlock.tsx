import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { FormEvent } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { verifyPassword } from '../utils/auth';

/** Pide la contraseña del papá para salir de la vista de niños */
const ParentUnlock = ({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) => {
  const { user } = useUser();
  const { members } = useData();
  const me = members.find(m => m.id === user?.id);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // Un papá que aún no crea contraseña no tiene con qué validarse
    if (!me?.passwordHash || await verifyPassword(pw, me)) onUnlock();
    else { setError('Contraseña incorrecta.'); setPw(''); }
  };

  // Fuera de la barra de niños (que crea su propio contexto de posición) y con el tema claro
  return createPortal(
    <div className="modal-overlay theme-light">
      <div className="modal-card" style={{ maxWidth: '360px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem' }}>Volver a papás</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="unlock-pw">Contraseña de {user?.name}</label>
            <input id="unlock-pw" type="password" autoComplete="current-password" autoFocus required value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, minHeight: '1.1rem', margin: 0 }}>{error}</p>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}><ShieldCheck size={16} /> Desbloquear</button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ParentUnlock;
