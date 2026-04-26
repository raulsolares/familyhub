import { NavLink } from 'react-router-dom';
import { Home, CheckCircle, GraduationCap, Trophy, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

const KidNav = () => {
  const { logout } = useUser();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/chores', icon: CheckCircle, label: 'Tareas' },
    { to: '/school', icon: GraduationCap, label: 'Escuela' },
    { to: '/rewards', icon: Trophy, label: 'Premios' },
  ];

  return (
    <nav style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      background: 'white', 
      display: 'flex', 
      justifyContent: 'space-around', 
      alignItems: 'center', 
      padding: '0.75rem 0.5rem calc(0.75rem + env(safe-area-inset-bottom))', 
      borderTop: '2px solid #f1f5f9',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
    }}>
      {navItems.map((item) => (
        <NavLink 
          key={item.to} 
          to={item.to} 
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'none',
            color: isActive ? 'var(--p-primary)' : '#94a3b8',
            transition: 'all 0.2s'
          })}
        >
          {({ isActive }) => (
            <>
              <item.icon size={28} strokeWidth={isActive ? 3 : 2} />
              <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button 
        onClick={logout}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '0.25rem', 
          background: 'none', 
          border: 'none', 
          color: '#ef4444', 
          cursor: 'pointer' 
        }}
      >
        <LogOut size={28} strokeWidth={2} />
        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>Salir</span>
      </button>
    </nav>
  );
};

export default KidNav;
