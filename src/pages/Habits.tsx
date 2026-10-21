import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import {
  habitsOn, dayScore, scoreLevel, habitStreak, dayStreak, addDays, dowOf, DAY_ABBR, isWeekly, isRoutineOn, isChoreOn,
  isChoreDoneOn, isStepDone,
} from '../utils/habits';
import type { HabitLogs } from '../utils/habits';
import { choreIcon } from '../utils/icons';
import { MOOD_SLOTS, MOODS, moodById } from '../utils/mood';
import { todayKey } from '../utils/dates';

const RANGES = [7, 14, 28];

/** Hábitos y cumplimiento: avance diario por niño, rachas y estado de ánimo */
const Habits = () => {
  const { user, viewMode } = useUser();
  const { members, routines, chores, routineLogs, choreLogs, habitsSince, moodLogs } = useData();
  const isKid = viewMode === 'child';
  const kids = members.filter(m => m.role === 'child');
  const [picked, setPicked] = useState(kids[0]?.name || '');
  const kidName = isKid && user?.role === 'child' ? user.name : picked;
  const [range, setRange] = useState(7);

  const today = todayKey();
  const days = Array.from({ length: isKid ? 7 : range }, (_, i) => addDays(today, i - ((isKid ? 7 : range) - 1)));
  const logs: HabitLogs = { routines, chores, routineLogs, choreLogs };

  const habitRows = [
    ...routines.filter(r => r.member === kidName && r.tasks.length > 0).sort((a, b) => a.time.localeCompare(b.time))
      .map(r => ({ kind: 'routine' as const, id: r.id, name: r.name, icon: r.icon, on: (k: string) => isRoutineOn(r, k), frac: (k: string) => r.tasks.filter((_, i) => isStepDone(routineLogs, k, r.id, i)).length / r.tasks.length })),
    ...chores.filter(c => c.user === kidName && !isWeekly(c.freq))
      .map(c => ({ kind: 'chore' as const, id: c.id, name: c.name, icon: choreIcon(c), on: (k: string) => isChoreOn(c, k), frac: (k: string) => (isChoreDoneOn(c, k, choreLogs) ? 1 : 0) })),
  ];

  const scores = days.map(k => (k < habitsSince ? null : dayScore(habitsOn(kidName, k, logs))));
  const todayScore = scores[scores.length - 1];
  const valid = scores.filter((s): s is number => s !== null);
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  const streak = dayStreak(kidName, today, logs, habitsSince);
  const perfectDays = valid.filter(s => s >= 0.999).length;

  const moodFor = (k: string, slot: string) => moodById(moodLogs.find(l => l.member === kidName && l.date === k && l.slot === slot)?.mood);
  const periodMoods = moodLogs.filter(l => l.member === kidName && l.date >= days[0]);
  const moodCounts = MOODS.map(m => ({ ...m, n: periodMoods.filter(l => l.mood === m.id).length })).filter(m => m.n > 0);

  const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);
  const dayLabel = (k: string) => (k === today ? 'Hoy' : DAY_ABBR[dowOf(k)]);
  const r = 46; const c = 2 * Math.PI * r;

  return (
    <div className="hb">
      <header className="page-header hb-header">
        <div>
          <h1 className="page-title">{isKid ? '📈 Mis hábitos' : 'Hábitos y cumplimiento'}</h1>
          <p className="page-subtitle">{isKid ? 'Cada día que cumples, tu racha crece' : 'Avance diario de rutinas y tareas, rachas y estado de ánimo'}</p>
        </div>
        {!isKid && (
          <div className="seg" role="group" aria-label="Periodo">
            {RANGES.map(n => <button key={n} className={range === n ? 'on' : ''} onClick={() => setRange(n)}>{n} días</button>)}
          </div>
        )}
      </header>

      {(!isKid || user?.role === 'parent') && kids.length > 1 && (
        <div className={isKid ? 'kid-switch' : 'tab-list'} style={{ marginBottom: '1rem' }}>
          {kids.map(k => (
            <button key={k.id} className={isKid ? (picked === k.name ? 'on' : '') : `tab-btn${picked === k.name ? ' active' : ''}`} onClick={() => setPicked(k.name)}>{k.avatar} {k.name}</button>
          ))}
        </div>
      )}

      {/* Resumen */}
      <section className="hb-summary">
        <div className="hb-ring" role="img" aria-label={`Hoy: ${pct(todayScore)}`}>
          <svg viewBox="0 0 110 110" width="110" height="110">
            <circle cx="55" cy="55" r={r} className="hb-ring-track" />
            <circle cx="55" cy="55" r={r} className="hb-ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - (todayScore || 0))} transform="rotate(-90 55 55)" />
          </svg>
          <div className="hb-ring-center"><b>{pct(todayScore)}</b><small>HOY</small></div>
        </div>
        <div className="hb-stats">
          <div className="hb-stat"><span>🔥 Racha</span><b>{streak} {streak === 1 ? 'día' : 'días'}</b><small>con 80% o más</small></div>
          <div className="hb-stat"><span>📊 Promedio</span><b>{pct(avg)}</b><small>últimos {days.length} días</small></div>
          <div className="hb-stat"><span>🏆 Días perfectos</span><b>{perfectDays}</b><small>todo cumplido</small></div>
        </div>
      </section>

      {/* Barras por día */}
      <section className="hb-panel">
        <h3 className="hb-title">Avance por día</h3>
        <div className="hb-bars" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((k, i) => (
            <div key={k} className={`hb-bar lv-${scoreLevel(scores[i])}${k === today ? ' today' : ''}`} title={`${k}: ${pct(scores[i])}`}>
              <span className="hb-bar-val">{scores[i] === null ? '' : Math.round(scores[i]! * 100)}</span>
              <div className="hb-bar-track"><i style={{ height: `${Math.max(4, (scores[i] || 0) * 100)}%` }} /></div>
              <span className="hb-bar-day">{days.length > 14 ? DAY_ABBR[dowOf(k)][0] : dayLabel(k)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hábito por hábito */}
      <section className="hb-panel">
        <h3 className="hb-title">Hábito por hábito</h3>
        {habitRows.length === 0 ? <p className="hb-empty">{isKid ? 'Todavía no tienes rutinas ni tareas diarias.' : 'Este niño no tiene rutinas ni tareas diarias.'}</p> : (
          <div className="hb-grid-wrap">
            <table className="hb-grid">
              <thead>
                <tr>
                  <th />
                  {days.map(k => <th key={k} className={k === today ? 'today' : ''}>{days.length > 14 ? DAY_ABBR[dowOf(k)][0] : dayLabel(k)}<br /><small>{Number(k.slice(8))}</small></th>)}
                  <th>🔥</th>
                </tr>
              </thead>
              <tbody>
                {habitRows.map(h => {
                  const st = habitStreak(kidName, h.kind, h.id, today, logs, habitsSince);
                  return (
                    <tr key={`${h.kind}_${h.id}`}>
                      <th scope="row"><span className="hb-ico">{h.icon}</span><span className="hb-name">{h.name}</span></th>
                      {days.map(k => {
                        if (!h.on(k)) return <td key={k}><i className="hb-cell off" title="No tocaba" /></td>;
                        if (k < habitsSince) return <td key={k}><i className="hb-cell nodata" title="Sin registro" /></td>;
                        const f = h.frac(k);
                        const cls = f >= 0.999 ? 'full' : f > 0 ? 'some' : k === today ? 'wait' : 'zero';
                        return <td key={k}><i className={`hb-cell ${cls}`} title={`${Math.round(f * 100)}%`}>{f >= 0.999 ? '✓' : f > 0 ? Math.round(f * 100) : ''}</i></td>;
                      })}
                      <td className="hb-streak">{st}</td>
                    </tr>
                  );
                })}
                <tr className="hb-mood-row">
                  <th scope="row"><span className="hb-ico">💗</span><span className="hb-name">Ánimo</span></th>
                  {days.map(k => (
                    <td key={k}>
                      <span className="hb-moods">
                        {MOOD_SLOTS.map(s => { const m = moodFor(k, s.id); return <span key={s.id} title={`${s.label}: ${m?.label || 'sin registro'}`}>{m ? m.emoji : '·'}</span>; })}
                      </span>
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <p className="hb-legend">
          <span><i className="hb-cell full">✓</i> Cumplido</span>
          <span><i className="hb-cell some">50</i> A medias</span>
          <span><i className="hb-cell zero" /> No se hizo</span>
          <span><i className="hb-cell off" /> No tocaba</span>
        </p>
      </section>

      {/* Estado de ánimo */}
      <section className="hb-panel">
        <h3 className="hb-title">💗 Estado de ánimo</h3>
        <div className="hb-mood-days">
          {days.slice(-7).reverse().map(k => (
            <div key={k} className="hb-mood-day">
              <span className="hb-mood-date">{k === today ? 'Hoy' : `${DAY_ABBR[dowOf(k)]} ${Number(k.slice(8))}`}</span>
              {MOOD_SLOTS.map(s => {
                const m = moodFor(k, s.id);
                return <span key={s.id} className={`hb-mood-slot${m?.tough ? ' tough' : ''}`}><small>{s.emoji}</small>{m ? <>{m.emoji}<span className="hb-mood-lbl"> {m.label}</span></> : '—'}</span>;
              })}
            </div>
          ))}
        </div>
        {moodCounts.length > 0 && (
          <p className="hb-mood-sum">
            {moodCounts.map(m => <span key={m.id}>{m.emoji} {m.label} × {m.n}</span>)}
          </p>
        )}
      </section>
    </div>
  );
};

export default Habits;
