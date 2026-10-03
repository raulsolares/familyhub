import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import Cockpit from '../components/Cockpit';
import { todayKey } from '../utils/dates';
import { todayMissions } from '../utils/habits';

/**
 * Cabina doble: los niños usan el mismo iPad al mismo tiempo.
 * Cada quien tiene su mitad de pantalla y marca sus propias misiones.
 */
const KidDuel = () => {
  const { members, chores, routines, routineLogs } = useData();
  const kids = members.filter(m => m.role === 'child').slice(0, 3);
  const today = todayKey();

  const progress = (name: string) => todayMissions(name, today, { routines, chores, routineLogs });

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
