import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, GraduationCap, Trophy, Clock, EyeOff, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

const navItems = [
  { to: '/',         icon: Home,         label: 'Inicio' },
  { to: '/chores',   icon: CheckSquare,  label: 'Tareas' },
  { to: '/routines', icon: Clock,        label: 'Rutinas' },
  { to: '/school',   icon: GraduationCap, label: 'Escuela' },
  { to: '/rewards',  icon: Trophy,       label: 'Premios' },
];

const KidNav = () => {
  const { logout, role, exitKidView } = useUser();
  const isParentInKidView = role === 'parent';

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
      padding: '0.625rem 0.25rem calc(0.625rem + env(safe-area-inset-bottom))',
      borderTop: '3px solid var(--border)',
      zIndex: 1000,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
    }}>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className="kid-nav-item"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            textDecoration: 'none',
            color: isActive ? 'var(--p-primary)' : '#94a3b8',
            transition: 'all 0.2s',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            background: isActive ? 'var(--p-primary-50)' : 'transparent',
            minWidth: '48px',
          })}
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.65rem', fontWeight: '800', lineHeight: 1 }}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* Si es padre en modo niño: botón para salir de vista */}
      {isParentInKidView ? (
        <button
          onClick={exitKidView}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
            padding: '0.25rem 0.5rem', borderRadius: '12px', minWidth: '48px',
          }}
        >
          <EyeOff size={24} strokeWidth={2} />
          <span style={{ fontSize: '0.65rem', fontWeight: '800', lineHeight: 1 }}>Salir</span>
        </button>
      ) : (
        <button
          onClick={logout}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
            background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
            padding: '0.25rem 0.5rem', borderRadius: '12px', minWidth: '48px',
          }}
        >
          <LogOut size={24} strokeWidth={2} />
          <span style={{ fontSize: '0.65rem', fontWeight: '800', lineHeight: 1 }}>Salir</span>
        </button>
      )}
    </nav>
  );
};

export default KidNav;
