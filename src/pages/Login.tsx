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
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Home size={32} strokeWidth={3} />
          <span style={{ fontSize: '1.75rem' }}>FamilyHub</span>
        </div>
        <h2 style={{ marginBottom: '0.5rem', fontWeight: '800' }}>¡Bienvenida Familia!</h2>
        <p style={{ color: 'var(--p-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Inicia sesión para administrar tu hogar</p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--p-text)' }}>Usuario</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="papa, mama, mateo o sofia"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--p-text)' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            Entrar al Hogar
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
          Tip: Prueba con 'papa' y '1234'
        </p>
      </div>
    </div>
  );
};

export default Login;
