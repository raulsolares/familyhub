import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, CalendarDays, Utensils, ShoppingCart, Menu, X, Eye, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { NAV_GROUPS } from './navItems';

const TABS = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/calendar', icon: CalendarDays, label: 'Agenda' },
  { to: '/menu', icon: Utensils, label: 'Menú' },
  { to: '/shopping', icon: ShoppingCart, label: 'Súper' },
];

/** Barra superior + pestañas inferiores para papás en el celular */
const ParentMobileNav = () => {
  const { user, logout, enterKidView } = useUser();
  const { prizeRequests } = useData();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const pending = prizeRequests.filter(r => r.status === 'pending').length;
  const inMore = !TABS.some(t => (t.to === '/' ? pathname === '/' : pathname.startsWith(t.to)));

  return (
    <>
      <header className="mobile-topbar">
        <div className="logo"><span className="logo-mark"><Home size={15} strokeWidth={2.5} /></span>FamilyHub</div>
        <span style={{ fontSize: '1.25rem' }} aria-label={user?.name}>{user?.avatar}</span>
      </header>

      <nav className="parent-tabbar" aria-label="Navegación principal">
        {TABS.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            <t.icon size={21} strokeWidth={1.75} />
            {t.label}
          </NavLink>
        ))}
        <button onClick={() => setOpen(true)} className={inMore ? 'active' : ''}>
          <Menu size={21} strokeWidth={1.75} />
          Más
          {pending > 0 && <span className="tab-dot" />}
        </button>
      </nav>

      {open && (
        <div className="sheet-overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-head">
              <div>
                <p className="sheet-kicker">{user?.avatar} {user?.name}</p>
                <h2 className="sheet-title">Todo FamilyHub</h2>
              </div>
              <button className="sheet-close" onClick={() => setOpen(false)} aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {NAV_GROUPS.map((g, i) => (
                <div key={i}>
                  {g.label && <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>{g.label}</p>}
                  <div className="more-grid">
                    {g.items.map(item => (
                      <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}>
                        <item.icon size={20} strokeWidth={1.75} />
                        {item.label}
                        {item.to === '/rewards' && pending > 0 && <span className="nav-badge" style={{ marginLeft: 0 }}>{pending}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
              <div className="more-grid">
                <button onClick={() => { setOpen(false); enterKidView(); }}><Eye size={20} strokeWidth={1.75} />Ver como niño</button>
                <button onClick={logout} style={{ color: 'var(--danger)' }}><LogOut size={20} strokeWidth={1.75} />Salir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParentMobileNav;
