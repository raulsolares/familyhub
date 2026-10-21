import { NavLink } from 'react-router-dom';
import { LogOut, Eye, Home } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { NAV_GROUPS } from './navItems';

const Sidebar = () => {
  const { user, logout, enterKidView } = useUser();
  const { prizeRequests } = useData();
  const pending = prizeRequests.filter(r => r.status === 'pending').length;

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark"><Home size={16} strokeWidth={2.5} /></span>
        <span>FamilyHub</span>
      </div>

      <nav className="nav-links">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {g.label && <p className="nav-group-label">{g.label}</p>}
            {!g.label && <div style={{ height: '0.75rem' }} />}
            {g.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={17} strokeWidth={1.75} />
                <span>{item.label}</span>
                {item.to === '/rewards' && pending > 0 && <span className="nav-badge">{pending}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="user-switcher">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--p-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>
            {user?.avatar}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--p-text)' }} className="truncate">{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>Papá / Mamá</p>
          </div>
          <button onClick={logout} className="btn-icon" title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={16} /></button>
        </div>
        <button onClick={enterKidView} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
          <Eye size={14} /> Ver como niño
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
