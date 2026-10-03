import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { useCelebration } from '../components/Celebration';
import Cockpit from '../components/Cockpit';
import KidMealPlanner from '../components/KidMealPlanner';
import EventSheet from '../components/EventSheet';
import { useCalendarFeeds } from '../hooks/useCalendarFeeds';
import { buildAgenda, isFor } from '../utils/agenda';
import type { AgendaItem } from '../utils/agenda';
import { getBadges } from '../utils/gamification';
import { todayKey, daysUntil } from '../utils/dates';
import { sounds } from '../utils/audio';

const KidZone = () => {
  const { user, role } = useUser();
  const { pointLogs, members, schoolTasks, familyEvents } = useData();
  const { feeds } = useCalendarFeeds();
  const { celebrate, celebrationNode } = useCelebration();

  const kids = members.filter(m => m.role === 'child');
  const [actingKid, setActingKid] = useState(kids[0]?.name || '');
  // Un papá en "Vista Niños" puede ver la cabina de cualquiera de sus hijos
  const kidName = role === 'parent' ? actingKid : (user?.name || 'Invitado');
  const [viewing, setViewing] = useState<AgendaItem | null>(null);

  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setIsActive(false); sounds.warp(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const badges = getBadges(pointLogs, kidName);
  const today = todayKey();
  const in7 = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toLocaleDateString('en-CA'); })();
  const nextEvents = buildAgenda({ familyEvents, schoolTasks: schoolTasks.filter(t => !t.completed), feeds }, today, in7)
    .filter(i => isFor(i, kidName))
    .slice(0, 4);

  return (
    <div className="kid-home">
      {celebrationNode}

      {role === 'parent' && kids.length > 1 && (
        <div className="kid-switch">
          {kids.map(k => (
            <button key={k.id} className={actingKid === k.name ? 'on' : ''} onClick={() => setActingKid(k.name)}>{k.avatar} {k.name}</button>
          ))}
        </div>
      )}

      {showTimer && (
        <div className="kid-timer">
          <button className="kid-timer-close" onClick={() => { setShowTimer(false); setIsActive(false); }} aria-label="Cerrar"><X color="white" size={22} /></button>
          <div style={{ fontSize: '4rem' }}>☄️</div>
          <h2>LLUVIA DE METEORITOS</h2>
          <p>¡Recoge y ordena todo lo que puedas antes de que caigan!</p>
          <div className="kid-timer-clock">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          {timeLeft === 0
            ? <div className="kid-timer-done">¡NAVE A SALVO! 🎉</div>
            : <button className="kid-timer-toggle" onClick={() => setIsActive(!isActive)}>{isActive ? '⏸ Pausa' : '▶ Seguir'}</button>}
        </div>
      )}

      <Cockpit key={kidName} kidName={kidName} />

      <KidMealPlanner
        kidName={kidName}
        onPlanned={() => celebrate('🍽️ ¡Guardado!')}
        onLocked={() => celebrate('🔒 ¡Semana confirmada!', true)}
        onRequested={() => celebrate('📨 ¡Solicitud enviada!')}
      />

      <section className="kid-actions">
        <Link to="/rewards" className="kid-action a-yellow"><span>🏆</span><p>Tienda</p></Link>
        <Link to="/duel" className="kid-action a-purple"><span>👥</span><p>Cabina doble</p></Link>
        <button onClick={() => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }} className="kid-action a-green"><span>☄️</span><p>Reto 5 min</p></button>
      </section>

      {nextEvents.length > 0 && (
        <section className="kid-panel kid-panel-events">
          <div className="kid-panel-head"><h3>🛰️ Próximas misiones especiales</h3></div>
          {nextEvents.map(e => {
            const d = daysUntil(e.date);
            return (
              <button key={e.key} className="kid-event" onClick={() => setViewing(e)}>
                <span><i style={{ background: e.color }} />{e.kind === 'family' ? '📅 ' : ''}{e.title}{e.time ? ` · ${e.time}` : ''}</span>
                <b className={d <= 1 ? 'soon' : ''}>{d === 0 ? 'HOY' : d === 1 ? 'Mañana' : `en ${d} días`}</b>
              </button>
            );
          })}
        </section>
      )}

      <section className="kid-panel kid-panel-badges">
        <div className="kid-panel-head"><h3>🏅 Medallas</h3><span className="kid-count">{badges.filter(b => b.earned).length}/{badges.length}</span></div>
        <div className="badge-grid">
          {badges.map(b => (
            <div key={b.id} className={`badge-tile${b.earned ? '' : ' locked'}`} title={b.desc}>
              <div className="badge-emoji">{b.emoji}</div>
              <div className="badge-name">{b.name}</div>
              {!b.earned && <div className="badge-desc">{b.desc}</div>}
            </div>
          ))}
        </div>
      </section>

      {viewing && <EventSheet item={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

export default KidZone;
