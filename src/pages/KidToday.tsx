import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import EventSheet from '../components/EventSheet';
import { useCalendarFeeds } from '../hooks/useCalendarFeeds';
import { useNow } from '../hooks/useNow';
import { buildAgenda, isFor } from '../utils/agenda';
import type { AgendaItem } from '../utils/agenda';
import { todayMissions } from '../utils/habits';
import { choreIcon } from '../utils/icons';
import { MEALS, MEAL_EMOJI, MEAL_TIMES, foodEmoji } from '../utils/food';
import { dateKey, DAY_NAMES } from '../utils/dates';
import { speak, canSpeak } from '../utils/audio';

interface Block {
  key: string;
  start: number;
  end?: number;
  time: string;
  icon: string;
  title: string;
  sub?: string;
  done?: boolean;
  kind: 'routine' | 'chore' | 'meal' | 'event';
  agenda?: AgendaItem;
}

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
const fmtClock = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

/** "en 5 min", "en 1 h 20 min" */
const fmtLeft = (secs: number) => {
  if (secs < 60) return '¡ya casi!';
  const m = Math.ceil(secs / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60); const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
};
const sayLeft = (secs: number) => {
  const m = Math.ceil(secs / 60);
  if (m < 60) return `${m} minutos`;
  const h = Math.floor(m / 60); const r = m % 60;
  return `${h} ${h === 1 ? 'hora' : 'horas'}${r ? ` y ${r} minutos` : ''}`;
};

/**
 * Agenda del día para niños: línea de tiempo con lo que toca, qué está pasando ahora
 * y cuánto falta para lo siguiente.
 */
const KidToday = () => {
  const { user, role } = useUser();
  const { members, routines, chores, routineLogs, weeklyMenu, foods, familyEvents, schoolTasks } = useData();
  const { feeds } = useCalendarFeeds();
  const now = useNow(1000);
  const kids = members.filter(m => m.role === 'child');
  const [actingKid, setActingKid] = useState(kids[0]?.name || '');
  const kidName = role === 'parent' ? actingKid : (user?.name || '');
  const [viewing, setViewing] = useState<AgendaItem | null>(null);

  const today = dateKey(now);
  const dayName = DAY_NAMES[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowSec = nowMin * 60 + now.getSeconds();

  // ── Bloques del día ─────────────────────────────────────────────────────────
  const missions = todayMissions(kidName, today, { routines, chores, routineLogs });
  const agenda = buildAgenda({ familyEvents, schoolTasks: schoolTasks.filter(t => !t.completed), feeds }, today, today).filter(i => isFor(i, kidName));

  const blocks: Block[] = [
    ...missions.routines.map(r => {
      const stepsDone = r.tasks.filter((_, i) => routineLogs.includes(`${today}_${r.id}_${i}`)).length;
      return {
        key: `r_${r.id}`, start: toMin(r.time), time: r.time, icon: r.icon, title: r.name, kind: 'routine' as const,
        sub: stepsDone === r.tasks.length ? '¡Misión cumplida!' : `${stepsDone} de ${r.tasks.length} pasos`, done: stepsDone === r.tasks.length,
      };
    }),
    ...missions.chores.filter(c => c.time).map(c => ({
      key: `c_${c.id}`, start: toMin(c.time!), time: c.time!, icon: choreIcon(c), title: c.name, kind: 'chore' as const,
      sub: c.status === 'Hecho' ? '¡Hecho!' : `+${c.points} ⭐`, done: c.status === 'Hecho',
    })),
    ...MEALS.flatMap(meal => {
      const slot = weeklyMenu.find(w => w.day === dayName && w.meal === meal && w.member === kidName && w.foodIds.length);
      if (!slot) return [];
      const list = slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean);
      return [{
        key: `m_${meal}`, start: toMin(MEAL_TIMES[meal]), time: MEAL_TIMES[meal], icon: MEAL_EMOJI[meal], kind: 'meal' as const,
        title: meal, sub: list.map(f => `${foodEmoji(f!)} ${f!.name}`).join(', '), done: slot.ate,
      }];
    }),
    ...agenda.filter(a => a.time).map(a => ({
      key: `e_${a.key}`, start: toMin(a.time!), end: a.endTime ? toMin(a.endTime) : undefined, time: a.time!,
      icon: a.kind === 'school' ? '🎒' : '📅', title: a.title.replace(/^🎒 /, ''), kind: 'event' as const, agenda: a,
      sub: a.endTime ? `hasta ${a.endTime}` : a.location,
    })),
  ].sort((a, b) => a.start - b.start);

  const anytime: { key: string; icon: string; title: string; done: boolean; agenda?: AgendaItem }[] = [
    ...missions.chores.filter(c => !c.time).map(c => ({ key: `c_${c.id}`, icon: choreIcon(c), title: c.name, done: c.status === 'Hecho' })),
    ...agenda.filter(a => !a.time).map(a => ({ key: `e_${a.key}`, icon: a.kind === 'school' ? '🎒' : '📅', title: a.title.replace(/^🎒 /, ''), done: false, agenda: a })),
  ];

  // ── Ahora y lo siguiente ────────────────────────────────────────────────────
  const nextIdx = blocks.findIndex(b => b.start > nowMin);
  const next = nextIdx >= 0 ? blocks[nextIdx] : null;
  const prevBlocks = nextIdx >= 0 ? blocks.slice(0, nextIdx) : blocks;
  const lastStarted = prevBlocks[prevBlocks.length - 1] || null;
  // Un evento con hora de fin sigue "ahora" hasta que termina; lo demás dura hasta que empieza lo siguiente (máx. 90 min)
  const current = lastStarted && (lastStarted.end ? nowMin < lastStarted.end : nowMin - lastStarted.start < 90) ? lastStarted : null;
  const leftSecs = next ? next.start * 60 - nowSec : 0;
  const fromMin = current ? current.start : lastStarted ? lastStarted.start : Math.min(nowMin, next ? next.start - 60 : nowMin);
  const span = next ? Math.max(1, next.start - fromMin) : 1;
  const countdownPct = next ? Math.max(0, Math.min(1, (nowMin - fromMin) / span)) : 1;

  // ── Barra del día (del sol a la luna) ───────────────────────────────────────
  const dayStart = Math.min(7 * 60, ...blocks.map(b => b.start));
  const dayEnd = Math.max(21 * 60, ...blocks.map(b => b.start + 30));
  const pos = (min: number) => `${Math.max(0, Math.min(100, ((min - dayStart) / (dayEnd - dayStart)) * 100))}%`;
  const doneCount = blocks.filter(b => b.done).length + anytime.filter(a => a.done).length;
  const doable = blocks.filter(b => b.kind !== 'event').length + anytime.filter(a => !a.agenda).length;

  const statusOf = (b: Block) => {
    if (b === current) return 'now';
    if (b === next) return 'next';
    if (b.start < nowMin) return b.done ? 'past done' : b.kind === 'event' || b.kind === 'meal' ? 'past' : 'past missed';
    return b.done ? 'later done' : 'later';
  };

  const sayNow = () => {
    const parts = [
      current ? `Ahora: ${current.title}.` : 'Ahora no hay nada en la agenda.',
      next ? `Lo siguiente es ${next.title}, en ${sayLeft(leftSecs)}.` : 'Ya no hay más actividades hoy.',
    ];
    speak(parts.join(' '));
  };

  const hh = now.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="kid-today">
      {role === 'parent' && kids.length > 1 && (
        <div className="kid-switch">
          {kids.map(k => (
            <button key={k.id} className={actingKid === k.name ? 'on' : ''} onClick={() => setActingKid(k.name)}>{k.avatar} {k.name}</button>
          ))}
        </div>
      )}

      {/* Ahora */}
      <section className="today-now kid-panel" aria-live="polite">
        <div className="today-clock">
          <span className="today-clock-time">{hh}</span>
          <span className="today-clock-day">{dayName} {now.getDate()}</span>
          {canSpeak() && <button className="mood-say" onClick={sayNow} aria-label="Escuchar">🔊</button>}
        </div>

        <div className="today-now-grid">
          <div className={`today-now-card${current ? '' : ' idle'}`}>
            <span className="today-tag">AHORA</span>
            <span className="today-now-ico">{current ? current.icon : '🌌'}</span>
            <b>{current ? current.title : 'Tiempo libre'}</b>
            {current?.sub && <small>{current.sub}</small>}
          </div>
          <div className="today-next-card">
            <span className="today-tag">SIGUIENTE</span>
            {next ? (
              <>
                <div className="today-ring" style={{ '--p': countdownPct } as React.CSSProperties}>
                  <span className="today-now-ico">{next.icon}</span>
                </div>
                <b>{next.title}</b>
                <span className="today-left">en {fmtLeft(leftSecs)}</span>
                <small>a las {next.time}</small>
              </>
            ) : (
              <>
                <span className="today-now-ico">🌙</span>
                <b>¡Eso es todo por hoy!</b>
                <small>Mañana hay más misiones</small>
              </>
            )}
          </div>
        </div>

        {/* Del sol a la luna */}
        <div className="today-track" aria-label={`Van ${Math.round(((nowMin - dayStart) / (dayEnd - dayStart)) * 100)}% del día`}>
          <span className="today-track-end">☀️</span>
          <div className="today-track-bar">
            <i className="today-track-fill" style={{ width: pos(nowMin) }} />
            {blocks.map(b => (
              <span key={b.key} className={`today-track-mark${b.done ? ' done' : ''}`} style={{ left: pos(b.start) }} title={`${b.time} ${b.title}`}>{b.icon}</span>
            ))}
            <span className="today-track-rocket" style={{ left: pos(nowMin) }} aria-hidden>🚀</span>
          </div>
          <span className="today-track-end">🌙</span>
        </div>
        <p className="today-track-legend"><span>{fmtClock(dayStart)}</span><span>{doable > 0 ? `${doneCount} de ${doable} hechas` : ''}</span><span>{fmtClock(dayEnd)}</span></p>
      </section>

      {/* Línea de tiempo */}
      <section className="kid-panel">
        <div className="kid-panel-head"><h3>🕒 Mi día</h3><Link to="/" className="today-link">Ir a misiones →</Link></div>
        {blocks.length === 0 && anytime.length === 0 && <p className="kid-empty">Hoy no hay nada en tu agenda.</p>}
        <ol className="tl">
          {blocks.map((b, i) => {
            const st = statusOf(b);
            const showNowLine = i === nextIdx && !current;
            return (
              <li key={b.key} className={`tl-item ${st}`}>
                {showNowLine && <div className="tl-nowline"><span>AHORA {hh}</span></div>}
                <span className="tl-time">{b.time}</span>
                <span className="tl-node" aria-hidden />
                <button
                  className="tl-card"
                  onClick={() => (b.agenda ? setViewing(b.agenda) : canSpeak() ? speak(`${b.title}. ${b.sub || ''}`) : undefined)}
                >
                  <span className="tl-ico">{b.icon}</span>
                  <span className="tl-text">
                    <b>{b.title}</b>
                    {b.sub && <small>{b.sub}</small>}
                  </span>
                  {st === 'now' && <span className="tl-badge now">AHORA</span>}
                  {st === 'next' && <span className="tl-badge">en {fmtLeft(leftSecs)}</span>}
                  {b.done && <span className="tl-badge ok">✓</span>}
                </button>
              </li>
            );
          })}
          {nextIdx < 0 && blocks.length > 0 && !current && <li className="tl-item"><div className="tl-nowline"><span>AHORA {hh}</span></div></li>}
        </ol>

        {anytime.length > 0 && (
          <>
            <h4 className="kid-subhead">⏳ Durante el día</h4>
            <div className="today-any">
              {anytime.map(a => (
                <button key={a.key} className={`today-any-item${a.done ? ' done' : ''}`} onClick={() => (a.agenda ? setViewing(a.agenda) : speak(a.title))}>
                  <span>{a.icon}</span>{a.title}{a.done && ' ✓'}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {viewing && <EventSheet item={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

export default KidToday;
