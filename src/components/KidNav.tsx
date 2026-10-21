import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import ParentUnlock from './ParentUnlock';

const navItems = [
  { to: '/',         emoji: '🚀', label: 'Cabina' },
  { to: '/today',    emoji: '🕒', label: 'Hoy' },
  { to: '/habits',   emoji: '📈', label: 'Hábitos' },
  { to: '/school',   emoji: '🎒', label: 'Escuela' },
  { to: '/rewards',  emoji: '🏆', label: 'Premios' },
];

const KidNav = () => {
  const { logout, role, exitKidView } = useUser();
  const isParentInKidView = role === 'parent';
  const [unlocking, setUnlocking] = useState(false);

  return (
    <nav className="kid-nav" aria-label="Menú">
      {unlocking && <ParentUnlock onClose={() => setUnlocking(false)} onUnlock={() => { setUnlocking(false); exitKidView(); }} />}
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <span className="kn-emoji">{item.emoji}</span>
          <span className="kn-label">{item.label}</span>
        </NavLink>
      ))}
      <button onClick={isParentInKidView ? () => setUnlocking(true) : logout}>
        <span className="kn-emoji">{isParentInKidView ? '👀' : '👋'}</span>
        <span className="kn-label">{isParentInKidView ? 'Papás' : 'Salir'}</span>
      </button>
    </nav>
  );
};

export default KidNav;
