import { UserPlus, Shield, Globe, Calendar } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Administra los miembros de la familia y preferencias del sistema</p>
      </header>

      <div className="grid">
        <div className="card">
          <h3 className="card-title"><UserPlus size={20} /> Familia</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '1rem' }}>
            Agrega o edita miembros de tu círculo familiar.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Papá', 'Mamá', 'Mateo (Hijo)', 'Sofía (Hija)'].map((name, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{name}</span>
                <button style={{ fontSize: '0.75rem', color: 'var(--p-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>+ Agregar Miembro</button>
        </div>

        <div className="card">
          <h3 className="card-title"><Shield size={20} /> Permisos y Roles</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '1rem' }}>
            Controla qué pueden ver y hacer los niños.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Ver Lista de Súper</span>
              <input type="checkbox" defaultChecked />
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Editar Menú Semanal</span>
              <input type="checkbox" />
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Canjear Recompensas</span>
              <input type="checkbox" defaultChecked />
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title"><Calendar size={20} /> Integraciones</h3>
          <div style={{ padding: '1rem', background: '#eef2ff', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Globe size={18} color="#4f46e5" />
              <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Google Calendar</p>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#4338ca', marginBottom: '1rem' }}>
              Sincroniza tus eventos familiares y escolares automáticamente.
            </p>
            <button style={{ width: '100%', padding: '0.5rem', background: 'white', border: '1px solid #4f46e5', color: '#4f46e5', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Conectar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
