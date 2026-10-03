import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import Cockpit from '../components/Cockpit';
import { todayKey } from '../utils/dates';

/**
 * Cabina doble: los niños usan el mismo iPad al mismo tiempo.
 * Cada quien tiene su mitad de pantalla y marca sus propias misiones.
 */
const KidDuel = () => {
  const { members, chores, routines, routineLogs } = useData();
  const kids = members.filter(m => m.role === 'child').slice(0, 3);
  const today = todayKey();

  const progress = (name: string) => {
    const myChores = chores.filter(c => c.user === name || c.user === 'Familia');
    const myRoutines = routines.filter(r => r.member === name && r.tasks.length > 0);
    const done = myChores.filter(c => c.status === 'Hecho').length
      + myRoutines.filter(r => r.tasks.every((_, i) => routineLogs.includes(`${today}_${r.id}_${i}`))).length;
    const total = myChores.length + myRoutines.length;
    return { done, total, pct: total ? done / total : 0 };
  };

  return (
    <div className="duo">
      <header className="duo-head">
        <Link to="/" className="duo-back" aria-label="Regresar"><ArrowLeft size={20} /></Link>
        <h1>CABINA DOBLE</h1>
        <div className="duo-score">
          {kids.map(k => {
            const p = progress(k.name);
            return (
              <span key={k.id} className="duo-score-item">
                {k.avatar} <b>{p.done}/{p.total}</b>
                <i><em style={{ width: `${p.pct * 100}%` }} /></i>
              </span>
            );
          })}
        </div>
      </header>
      {kids.length === 0 ? (
        <p className="kid-empty">Agrega a los niños en Configuración.</p>
      ) : (
        <div className="duo-grid" style={{ gridTemplateColumns: `repeat(${kids.length}, minmax(0, 1fr))` }}>
          {kids.map(k => <Cockpit key={k.id} kidName={k.name} compact />)}
        </div>
      )}
    </div>
  );
};

export default KidDuel;
