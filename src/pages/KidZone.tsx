import { useState, useEffect } from 'react';
import { Star, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { useCelebration } from '../components/Celebration';
import KidMealPlanner from '../components/KidMealPlanner';
import { getLevel, getStreak, getBadges } from '../utils/gamification';
import { todayKey, daysUntil } from '../utils/dates';
import { sounds } from '../utils/audio';
import { notify } from '../utils/push';

const KidZone = () => {
  const { user, role } = useUser();
  const {
    points, pointLogs, chores, toggleChore, routines, routineLogs, toggleRoutineTask,
    members, schoolTasks, familyEvents,
  } = useData();
  const { celebrate, celebrationNode } = useCelebration();

  const kids = members.filter(m => m.role === 'child');
  const [actingKid, setActingKid] = useState(kids[0]?.name || '');
  // Un papá en "Vista Niños" puede ver la pantalla de cualquiera de sus hijos
  const kidName = role === 'parent' ? actingKid : (user?.name || 'Invitado');
  const kid = members.find(m => m.name === kidName);
  const todayStr = todayKey();

  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setIsActive(false); sounds.kidCheer(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // ── Gamificación ───────────────────────────────────────────────────────────
  const myPoints = points[kidName] || 0;
  const level = getLevel(pointLogs, kidName);
  const streak = getStreak(pointLogs, kidName);
  const badges = getBadges(pointLogs, kidName);
  const earnedToday = pointLogs
    .filter(l => l.member === kidName && l.points > 0 && new Date(l.date).toLocaleDateString('en-CA') === todayStr)
    .reduce((s, l) => s + l.points, 0);

  // ── Misiones de hoy ────────────────────────────────────────────────────────
  const myChores = chores.filter(c => c.user === kidName || c.user === 'Familia');
  const myRoutines = routines.filter(r => r.member === kidName).sort((a, b) => a.time.localeCompare(b.time));
  const isTaskDone = (rid: string, i: number) => routineLogs.includes(`${todayStr}_${rid}_${i}`);
  const routineDone = (rid: string, n: number) => n > 0 && Array.from({ length: n }).every((_, i) => isTaskDone(rid, i));
  const missionsTotal = myChores.length + myRoutines.length;
  const missionsDone = myChores.filter(c => c.status === 'Hecho').length + myRoutines.filter(r => routineDone(r.id, r.tasks.length)).length;

  const announceIfAllDone = (doneAfter: number) => {
    if (missionsTotal > 0 && doneAfter === missionsTotal) {
      notify({ to: 'parents', title: `🏆 ${kidName} terminó sus misiones`, body: `Completó las ${missionsTotal} misiones de hoy.`, url: '/', tag: `missions-${kidName}-${todayStr}` });
    }
  };

  const tapRoutineTask = (rid: string, idx: number, total: number) => {
    const wasDone = isTaskDone(rid, idx);
    toggleRoutineTask(rid, idx, kidName);
    if (wasDone) { sounds.deselect(); return; }
    const willComplete = Array.from({ length: total }).every((_, i) => i === idx || isTaskDone(rid, i));
    if (willComplete) {
      const others = myRoutines.filter(r => r.id !== rid);
      const perfect = others.length > 0 && others.every(r => routineDone(r.id, r.tasks.length));
      celebrate(perfect ? '💯 ¡Día perfecto! +50 ⭐' : '🎉 ¡Rutina completa! +30 ⭐', perfect);
      announceIfAllDone(missionsDone + 1);
    } else {
      sounds.tap();
    }
  };

  const tapChore = (id: string, pts: number, done: boolean) => {
    toggleChore(id, kidName);
    if (done) { sounds.deselect(); return; }
    celebrate(`✅ ¡Tarea lista! +${pts} ⭐`);
    announceIfAllDone(missionsDone + 1);
  };

  const nextEvents = [
    ...schoolTasks.filter(t => t.child === kidName && !t.completed && t.eventDate).map(t => ({ id: t.id, title: `🎒 ${t.title}`, date: t.eventDate })),
    ...familyEvents.filter(e => e.members.includes('Familia') || e.members.includes(kidName)).map(e => ({ id: e.id, title: `📅 ${e.title}`, date: e.date })),
  ].filter(e => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const pct = missionsTotal ? Math.round((missionsDone / missionsTotal) * 100) : 0;

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
          <div style={{ fontSize: '4rem' }}>⚡</div>
          <h2>RETO RELÁMPAGO</h2>
          <p>¡Recoge y ordena todo lo que puedas antes de que acabe!</p>
          <div className="kid-timer-clock">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          {timeLeft === 0
            ? <div className="kid-timer-done">¡LOGRADO! 🎉</div>
            : <button className="kid-timer-toggle" onClick={() => setIsActive(!isActive)}>{isActive ? '⏸ Pausa' : '▶ Seguir'}</button>}
        </div>
      )}

      {/* Tarjeta de jugador */}
      <section className="player-card">
        <div className="player-top">
          <div className="player-avatar">{kid?.avatar || user?.avatar || '👤'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>¡Hola, {kidName}!</h1>
            <p>{level.emoji} Nivel {level.level} · {level.title}</p>
          </div>
        </div>
        <div className="level-bar"><div style={{ width: `${Math.round(level.progress * 100)}%` }} /></div>
        <p className="player-next">{level.next ? `${level.next - level.xp} XP para el nivel ${level.level + 1}` : '¡Nivel máximo!'}</p>
        <div className="player-stats">
          <div><b><Star size={16} fill="white" /> {myPoints}</b><span>puntos</span></div>
          <div><b>🔥 {streak}</b><span>{streak === 1 ? 'día seguido' : 'días seguidos'}</span></div>
          <div><b>⚡ +{earnedToday}</b><span>hoy</span></div>
        </div>
      </section>

      {/* Misiones */}
      <section className="kid-panel kid-panel-missions">
        <div className="kid-panel-head">
          <h3>🎯 Misiones de hoy</h3>
          <span className="kid-count">{missionsDone}/{missionsTotal}</span>
        </div>
        <div className="mission-progress"><div style={{ width: `${pct}%` }} /></div>
        {missionsTotal === 0 && <p className="kid-empty">Pide a papá o mamá que te asignen misiones.</p>}
        {missionsTotal > 0 && missionsDone === missionsTotal && <p className="kid-allset">🏆 ¡Terminaste todo! Eres increíble.</p>}

        {myRoutines.map(r => {
          const done = routineDone(r.id, r.tasks.length);
          return (
            <div key={r.id} className={`routine-card${done ? ' done' : ''}`}>
              <div className="routine-head">
                <span>{r.icon} {r.name}</span>
                <small>{done ? '¡Completa! +30' : r.time}</small>
              </div>
              <div className="routine-steps">
                {r.tasks.map((t, i) => {
                  const ok = isTaskDone(r.id, i);
                  return (
                    <button key={i} className={`step${ok ? ' on' : ''}`} onClick={() => tapRoutineTask(r.id, i, r.tasks.length)}>
                      {ok ? <Check size={14} strokeWidth={3} /> : <i />}{t}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {myChores.map(c => {
          const done = c.status === 'Hecho';
          return (
            <button key={c.id} className={`chore-btn${done ? ' done' : ''}`} onClick={() => tapChore(c.id, c.points, done)}>
              {done ? <Check size={22} strokeWidth={3} /> : <i />}
              <span className="chore-name">🧹 {c.name}<small>{c.freq}{c.user === 'Familia' ? ' · Familia' : ''}</small></span>
              <span className="chore-pts">+{c.points}</span>
            </button>
          );
        })}
      </section>

      {/* Comida */}
      <KidMealPlanner kidName={kidName} onPlanned={() => celebrate('🍽️ ¡Guardado!')} />

      {/* Accesos */}
      <section className="kid-actions">
        <Link to="/rewards" className="kid-action a-yellow"><span>🏆</span><p>Tienda</p></Link>
        <Link to="/duel" className="kid-action a-purple"><span>⚔️</span><p>Duelo</p></Link>
        <button onClick={() => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }} className="kid-action a-green"><span>⚡</span><p>Reto 5 min</p></button>
      </section>

      {nextEvents.length > 0 && (
        <section className="kid-panel kid-panel-events">
          <div className="kid-panel-head"><h3>📆 Esta semana</h3></div>
          {nextEvents.map(e => {
            const d = daysUntil(e.date);
            return (
              <div key={e.id} className="kid-event">
                <span>{e.title}</span>
                <b className={d <= 1 ? 'soon' : ''}>{d === 0 ? 'HOY' : d === 1 ? 'Mañana' : `en ${d} días`}</b>
              </div>
            );
          })}
        </section>
      )}

      <section className="kid-panel kid-panel-badges">
        <div className="kid-panel-head"><h3>🏅 Mis insignias</h3><span className="kid-count">{badges.filter(b => b.earned).length}/{badges.length}</span></div>
        <div className="badge-grid">
          {badges.map(b => (
            <div key={b.id} className={`badge-tile${b.earned ? '' : ' locked'}`} title={b.desc}>
              <div style={{ fontSize: '1.75rem' }}>{b.emoji}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, lineHeight: 1.15 }}>{b.name}</div>
              {!b.earned && <div style={{ fontSize: '0.56rem', color: '#64748b', marginTop: '2px' }}>{b.desc}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default KidZone;
