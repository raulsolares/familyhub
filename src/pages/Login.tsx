import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Home, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) setError('Usuario o contraseña incorrectos');
  };

  const quickLogin = (user: string) => {
    setUsername(user);
    setPassword('1234');
    login(user, '1234');
  };

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #f0fdf4 100%)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(79,70,229,0.3)',
          }}>
            <Home size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>
            FamilyHub
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bienvenida familia — inicia sesión
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="raul, tania, alan o aria"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: '600', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              Entrar al Hogar
            </button>
          </form>

          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.75rem' }}>
              Acceso rápido (demo)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { id: 'raul', label: '👨 Raúl', color: '#eef2ff', text: '#4f46e5' },
                { id: 'tania', label: '👩 Tania', color: '#fdf2f8', text: '#db2777' },
                { id: 'alan', label: '👦 Alan', color: '#eff6ff', text: '#2563eb' },
                { id: 'aria', label: '👧 Aria', color: '#fff7ed', text: '#ea580c' },
              ].map(u => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.id)}
                  style={{
                    background: u.color, color: u.text, border: 'none',
                    borderRadius: '8px', padding: '0.5rem', fontWeight: '700',
                    fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
