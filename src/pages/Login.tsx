import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Member } from '../context/DataContext';
import { Home, ArrowLeft, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import SyncBadge from '../components/SyncBadge';
import {
  deviceId, suggestedDeviceName, hashPassword, verifyPassword, passwordProblem, MIN_PASSWORD, SESSION_DAYS,
} from '../utils/auth';

const MAX_TRIES = 5;
const LOCK_SECONDS = 30;

/**
 * Acceso. Un dispositivo nuevo solo muestra a los papás: uno entra con su contraseña y lo autoriza.
 * En un dispositivo autorizado los niños entran directo y los papás con contraseña (sesión de 7 días).
 */
const Login = () => {
  const { login } = useUser();
  const { members, devices, authReady, addDevice, updateDevice, updateMember } = useData();
  const navigate = useNavigate();
  const myId = deviceId();
  const authorized = devices.some(d => d.id === myId);

  const [selected, setSelected] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [deviceName, setDeviceName] = useState(suggestedDeviceName);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const parents = members.filter(m => m.role === 'parent');
  const kids = members.filter(m => m.role === 'child');
  const creating = !!selected && !selected.passwordHash;

  const choose = (m: Member) => {
    if (m.role === 'child') { login(m); return; }
    setSelected(m); setPassword(''); setPin(''); setNewPw(''); setConfirmPw(''); setError('');
  };

  const fail = (msg: string) => {
    const n = tries + 1;
    setTries(n);
    if (n >= MAX_TRIES) {
      setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      setTries(0);
      setError(`Demasiados intentos. Espera ${LOCK_SECONDS} segundos.`);
    } else setError(msg);
  };

  const finish = (m: Member) => {
    const now = new Date().toISOString();
    if (!authorized) addDevice({ id: myId, name: deviceName.trim() || suggestedDeviceName(), authorizedBy: m.name, authorizedAt: now, lastSeen: now });
    else updateDevice(myId, { lastSeen: now });
    login(m);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || busy) return;
    if (Date.now() < lockedUntil) { setError(`Espera ${Math.ceil((lockedUntil - Date.now()) / 1000)} segundos.`); return; }
    setBusy(true); setError('');
    try {
      if (creating) {
        if (pin !== selected.pin) { fail('El PIN no es correcto.'); return; }
        const problem = passwordProblem(newPw, confirmPw);
        if (problem) { setError(problem); return; }
        const hashed = await hashPassword(newPw);
        updateMember(selected.id, { ...hashed, pin: undefined });
        finish({ ...selected, ...hashed });
      } else {
        if (await verifyPassword(password, selected)) finish(selected);
        else { fail('Contraseña incorrecta.'); setPassword(''); }
      }
    } finally { setBusy(false); }
  };

  const tile = (m: Member, kid: boolean) => (
    <button
      key={m.id}
      onClick={() => choose(m)}
      className="login-tile"
      style={{
        background: kid ? 'linear-gradient(135deg, #fff1f2, #fef3c7)' : 'var(--p-surface)',
        borderColor: kid ? '#fecdd3' : 'var(--border)',
      }}
    >
      <span style={{ fontSize: kid ? '3rem' : '2.5rem', lineHeight: 1 }}>{m.avatar}</span>
      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{m.name}</span>
      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
        {kid ? '¡Entra directo!' : m.passwordHash ? '🔒 Contraseña' : 'Crear contraseña'}
      </span>
    </button>
  );

  const pwInput = (id: string, value: string, set: (v: string) => void, label: string, autoComplete: string, autoFocus = false) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="pw-field">
        <input
          id={id} type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)}
          autoComplete={autoComplete} autoFocus={autoFocus} required
        />
        <button type="button" className="pw-eye" onClick={() => setShow(v => !v)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  let subtitle = '¿Quién eres?';
  if (!authReady) subtitle = 'Conectando…';
  else if (selected) subtitle = creating ? `Hola ${selected.name}, crea tu contraseña` : `Hola ${selected.name}, escribe tu contraseña`;
  else if (!authorized) subtitle = 'Este dispositivo todavía no está autorizado';

  return (
    <div className="theme-light" style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #f0fdf4 100%)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.75rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
          }}>
            <Home size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>FamilyHub</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{subtitle}</p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          {!authReady ? (
            <div style={{ textAlign: 'center', display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
              <Loader2 size={28} className="spin" color="var(--p-primary)" />
              <SyncBadge detail />
            </div>
          ) : !selected ? (
            <>
              {!authorized && (
                <div className="auth-note">
                  <ShieldCheck size={18} />
                  <span>Para usar FamilyHub aquí, un papá debe entrar con su contraseña. Después los niños entran directo en este dispositivo.</span>
                </div>
              )}
              <p className="login-section">Papás</p>
              <div className="login-grid">{parents.map(m => tile(m, false))}</div>
              {authorized && (
                <>
                  <p className="login-section" style={{ marginTop: '1.25rem' }}>Niños</p>
                  <div className="login-grid">{kids.map(m => tile(m, true))}</div>
                  {kids.length > 1 && (
                    <button className="login-duo" onClick={() => { login(kids[0]); setTimeout(() => navigate('/duel', { replace: true }), 0); }}>
                      👥 Cabina doble <small>({kids.map(k => k.name).join(' y ')} en la misma pantalla)</small>
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ textAlign: 'center', fontSize: '3rem', lineHeight: 1 }}>{selected.avatar}</div>
              {!authorized && (
                <div className="form-group">
                  <label className="form-label" htmlFor="device-name">Nombre de este dispositivo</label>
                  <input id="device-name" value={deviceName} onChange={e => setDeviceName(e.target.value)} placeholder="iPad de la cocina" maxLength={40} />
                </div>
              )}
              {creating ? (
                <>
                  <p className="auth-hint">Es la primera vez. Escribe tu PIN actual y elige una contraseña de al menos {MIN_PASSWORD} caracteres con letras.</p>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pin">PIN actual</label>
                    <input id="pin" inputMode="numeric" autoComplete="off" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required autoFocus />
                  </div>
                  {pwInput('new-pw', newPw, setNewPw, 'Nueva contraseña', 'new-password')}
                  {pwInput('confirm-pw', confirmPw, setConfirmPw, 'Repite la contraseña', 'new-password')}
                </>
              ) : pwInput('pw', password, setPassword, 'Contraseña', 'current-password', true)}
              <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, minHeight: '1.25rem', margin: 0 }}>{error}</p>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={busy}>
                {busy ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                {authorized ? 'Entrar' : 'Entrar y autorizar este dispositivo'}
              </button>
              <button type="button" className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setSelected(null)}>
                <ArrowLeft size={15} /> Volver
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
          La sesión de papás dura {SESSION_DAYS} días en cada dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Login;
