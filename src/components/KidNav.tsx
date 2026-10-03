import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const navItems = [
  { to: '/',         emoji: '🚀', label: 'Cabina' },
  { to: '/duel',     emoji: '👥', label: 'Doble' },
  { to: '/school',   emoji: '🎒', label: 'Escuela' },
  { to: '/calendar', emoji: '🛰️', label: 'Agenda' },
  { to: '/rewards',  emoji: '🏆', label: 'Premios' },
];

const KidNav = () => {
  const { logout, role, exitKidView } = useUser();
  const isParentInKidView = role === 'parent';

  return (
    <nav className="kid-nav" aria-label="Menú">
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="kn-emoji">{item.emoji}</span>
          <span className="kn-label">{item.label}</span>
        </NavLink>
      ))}
      <button onClick={isParentInKidView ? exitKidView : logout}>
        <span className="kn-emoji">{isParentInKidView ? '👀' : '👋'}</span>
        <span className="kn-label">{isParentInKidView ? 'Papás' : 'Salir'}</span>
      </button>
    </nav>
  );
};

export default KidNav;
