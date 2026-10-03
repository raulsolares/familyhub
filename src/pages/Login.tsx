import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Member } from '../context/DataContext';
import { Home, ArrowLeft, Delete } from 'lucide-react';

const Login = () => {
  const { login } = useUser();
  const { members } = useData();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const choose = (m: Member) => {
    if (!m.pin) { login(m); return; }
    setSelected(m); setPin(''); setError('');
  };

  const press = (digit: string) => {
    if (!selected) return;
    const next = (pin + digit).slice(0, 6);
    setPin(next);
    setError('');
    if (next.length === selected.pin!.length) {
      if (next === selected.pin) login(selected);
      else { setError('PIN incorrecto'); setPin(''); }
    }
  };

  const parents = members.filter(m => m.role === 'parent');
  const kids = members.filter(m => m.role === 'child');

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
        {m.pin ? '🔒 Con PIN' : kid ? '¡Entra directo!' : 'Sin PIN'}
      </span>
    </button>
  );

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
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {selected ? `Hola ${selected.name}, escribe tu PIN` : '¿Quién eres?'}
          </p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          {!selected ? (
            <>
              <p className="login-section">Papás</p>
              <div className="login-grid">{parents.map(m => tile(m, false))}</div>
              <p className="login-section" style={{ marginTop: '1.25rem' }}>Niños</p>
              <div className="login-grid">{kids.map(m => tile(m, true))}</div>
              {kids.length > 1 && kids.every(k => !k.pin) && (
                <button className="login-duo" onClick={() => { login(kids[0]); setTimeout(() => navigate('/duel', { replace: true }), 0); }}>
                  👥 Cabina doble <small>({kids.map(k => k.name).join(' y ')} en la misma pantalla)</small>
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>{selected.avatar}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', margin: '1rem 0' }}>
                {Array.from({ length: selected.pin!.length }).map((_, i) => (
                  <span key={i} style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: i < pin.length ? '#4f46e5' : '#e2e8f0', transition: 'background 0.1s',
                  }} />
                ))}
              </div>
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, minHeight: '1.25rem' }}>{error}</p>
              <div className="pin-pad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                  <button key={d} onClick={() => press(d)} className="pin-key">{d}</button>
                ))}
                <button onClick={() => setSelected(null)} className="pin-key pin-key-ghost" aria-label="Volver"><ArrowLeft size={20} /></button>
                <button onClick={() => press('0')} className="pin-key">0</button>
                <button onClick={() => setPin(p => p.slice(0, -1))} className="pin-key pin-key-ghost" aria-label="Borrar"><Delete size={20} /></button>
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
          PIN inicial de papás: 1234 · Cámbialo en Configuración → Familia
        </p>
      </div>
    </div>
  );
};

export default Login;
