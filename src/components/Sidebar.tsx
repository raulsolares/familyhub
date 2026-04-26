import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingCart, 
  GraduationCap, 
  CheckSquare, 
  Trophy, 
  Calendar as CalendarIcon,
  Home,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const { role, setRole, user, logout } = useUser();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/menu', icon: Utensils, label: 'Menú Semanal' },
    { to: '/shopping', icon: ShoppingCart, label: 'Lista de Súper' },
    { to: '/school', icon: GraduationCap, label: 'Módulo Escolar' },
    { to: '/chores', icon: CheckSquare, label: 'Tareas del Hogar' },
    { to: '/rewards', icon: Trophy, label: 'Premios y Castigos' },
    { to: '/calendar', icon: CalendarIcon, label: 'Calendario' },
    { to: '/settings', icon: SettingsIcon, label: 'Configuración' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <Home size={28} strokeWidth={3} />
        <span>FamilyHub</span>
      </div>
      
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="user-switcher">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: role === 'parent' ? '#eef2ff' : '#fff1f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {user.avatar}
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
              Modo {role === 'parent' ? 'Padres' : 'Niños'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setRole(role === 'parent' ? 'child' : 'parent')}
          className="btn-primary"
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          Cambiar a {role === 'parent' ? 'Modo Niños' : 'Modo Padres'}
        </button>
        <button 
          onClick={logout}
          style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: 'none', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}
        >
          <LogOut size={16} /> Salir del Hogar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
