import { useState } from 'react';
import type { FormEvent } from 'react';
import { Smartphone, Trash2, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { deviceId, hashPassword, verifyPassword, passwordProblem, MIN_PASSWORD, SESSION_DAYS } from '../utils/auth';

const fmt = (iso?: string | number) =>
  iso ? new Date(iso).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

/** Configuración → Seguridad: dispositivos autorizados, sesión y contraseña */
const SecuritySettings = () => {
  const { user, logout, sessionExpires } = useUser();
  const { members, devices, removeDevice, updateMember } = useData();
  const me = members.find(m => m.id === user?.id);
  const myDevice = deviceId();

  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;
    if (me.passwordHash && !(await verifyPassword(current, me))) { setMsg({ ok: false, text: 'La contraseña actual no es correcta.' }); return; }
    const problem = passwordProblem(pw, confirm);
    if (problem) { setMsg({ ok: false, text: problem }); return; }
    updateMember(me.id, { ...(await hashPassword(pw)), pin: undefined });
    setCurrent(''); setPw(''); setConfirm('');
    setMsg({ ok: true, text: 'Contraseña actualizada.' });
  };

  const remove = (id: string, name: string) => {
    const mine = id === myDevice;
    const ask = mine
      ? 'Vas a quitar ESTE dispositivo. Se cerrará la sesión y un papá tendrá que autorizarlo otra vez. ¿Continuar?'
      : `¿Quitar "${name}"? Ya no podrán usar la app ahí hasta que un papá lo autorice otra vez.`;
    if (window.confirm(ask)) removeDevice(id);
  };

  const sorted = [...devices].sort((a, b) => (a.id === myDevice ? -1 : b.id === myDevice ? 1 : (b.lastSeen || '').localeCompare(a.lastSeen || '')));

  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '720px' }}>
      <section className="card">
        <h3 className="card-title" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Smartphone size={17} /> Dispositivos autorizados</h3>
        <p className="auth-hint" style={{ margin: '0.25rem 0 0.75rem' }}>
          Solo estos dispositivos pueden abrir FamilyHub. Para agregar uno, ábrelo ahí y entra con tu contraseña.
        </p>
        {sorted.length === 0 && <p className="auth-hint">Todavía no hay dispositivos.</p>}
        {sorted.map(d => (
          <div key={d.id} className="device-row">
            <Smartphone size={20} color="var(--p-text-muted)" />
            <div className="grow">
              <b>{d.name}</b>{d.id === myDevice && <span className="badge badge-blue" style={{ marginLeft: '0.5rem' }}>Este</span>}
              <small>Autorizó {d.authorizedBy} · {fmt(d.authorizedAt)} · último acceso de papás {fmt(d.lastSeen)}</small>
            </div>
            <button className="btn-icon" onClick={() => remove(d.id, d.name)} aria-label={`Quitar ${d.name}`} title="Quitar"><Trash2 size={16} color="#ef4444" /></button>
          </div>
        ))}
      </section>

      <section className="card">
        <h3 className="card-title" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><ShieldCheck size={17} /> Tu sesión</h3>
        <p className="auth-hint" style={{ margin: '0.25rem 0 0.75rem' }}>
          En cada dispositivo la sesión de papás dura {SESSION_DAYS} días; después se pide la contraseña otra vez.
          {sessionExpires ? ` Aquí vence el ${fmt(sessionExpires)}.` : ''}
        </p>
        <button className="btn-secondary" onClick={logout}><LogOut size={15} /> Cerrar sesión aquí</button>
      </section>

      <section className="card">
        <h3 className="card-title" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><KeyRound size={17} /> Cambiar mi contraseña</h3>
        <form onSubmit={changePassword} style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
          {me?.passwordHash && (
            <div className="form-group">
              <label className="form-label" htmlFor="cur-pw">Contraseña actual</label>
              <input id="cur-pw" type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} />
            </div>
          )}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">Nueva contraseña</label>
              <input id="new-pw" type="password" autoComplete="new-password" required value={pw} onChange={e => setPw(e.target.value)} placeholder={`Al menos ${MIN_PASSWORD} caracteres`} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pw">Repítela</label>
              <input id="confirm-pw" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
          {msg && <p role="alert" style={{ color: msg.ok ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{msg.text}</p>}
          <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}><KeyRound size={15} /> Guardar contraseña</button>
        </form>
      </section>

      <p className="auth-hint">
        Esto protege el uso diario de la app en cada dispositivo. La base de datos de Firebase todavía no pide inicio de sesión,
        así que la dirección de la app y sus llaves no deben compartirse.
      </p>
    </div>
  );
};

export default SecuritySettings;
