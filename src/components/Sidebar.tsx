import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, ShoppingCart, GraduationCap,
  CheckSquare, Trophy, Calendar, Settings, LogOut, Clock, Eye, EyeOff, Home, ChefHat,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/prep',     icon: ChefHat,         label: 'Preparación' },
  { to: '/menu',     icon: Utensils,        label: 'Menú Semanal' },
  { to: '/shopping', icon: ShoppingCart,    label: 'Lista de Súper' },
  { to: '/school',   icon: GraduationCap,  label: 'Módulo Escolar' },
  { to: '/chores',   icon: CheckSquare,    label: 'Tareas del Hogar' },
  { to: '/routines', icon: Clock,          label: 'Rutinas' },
  { to: '/rewards',  icon: Trophy,         label: 'Premios y Puntos' },
  { to: '/calendar', icon: Calendar,       label: 'Calendario' },
  { to: '/settings', icon: Settings,       label: 'Configuración' },
];

const Sidebar = () => {
  const { user, logout, isKidView, enterKidView, exitKidView } = useUser();

  return (
    <aside className="sidebar">
      <div className="logo">
        <Home size={22} strokeWidth={2.5} />
        <span>FamilyHub</span>
      </div>

      <p className="nav-group-label">Menú principal</p>

      <nav className="nav-links">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="user-switcher">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--p-primary-50)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
          }}>
            {user?.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>Modo Padres</p>
          </div>
        </div>

        <button
          onClick={isKidView ? exitKidView : enterKidView}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', marginBottom: '0.5rem' }}
        >
          {isKidView ? <><EyeOff size={14} /> Vista Padres</> : <><Eye size={14} /> Vista Niños</>}
        </button>

        <button
          onClick={logout}
          className="btn-icon"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', gap: '0.375rem', padding: '0.5rem' }}
        >
          <LogOut size={15} />
          <span style={{ fontSize: '0.8125rem', fontWeight: '600' }}>Salir del Hogar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
