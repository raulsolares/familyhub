import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { getLevel, getStreak, levelForXp } from '../utils/gamification';
import { todayKey } from '../utils/dates';
import { sounds } from '../utils/audio';
import { notify } from '../utils/push';

const ROUTINE_POINTS = 30;
const PERFECT_DAY_POINTS = 20;

/** Reloj fuera del render (solo se usa en manejadores de toque) */
const clock = () => Date.now();
let seq = 0;
const nextId = () => ++seq;

interface Fx { id: number; kind: 'mission' | 'warp' | 'levelup'; title: string; sub: string }
interface Float { id: number; at: string; text: string }

/** Indicador circular (energía de misión) */
const Gauge = ({ value, size = 132, label, children }: { value: number; size?: number; label: string; children: React.ReactNode }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="ck-gauge" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r={r} className="ck-gauge-track" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={60 + Math.cos(a) * 58} y1={60 + Math.sin(a) * 58} x2={60 + Math.cos(a) * 55} y2={60 + Math.sin(a) * 55} className={i / 24 < pct ? 'ck-tick on' : 'ck-tick'} />;
        })}
        <circle cx="60" cy="60" r={r} className="ck-gauge-fill" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 60 60)" />
      </svg>
      <div className="ck-gauge-center">{children}</div>
    </div>
  );
};

/**
 * Cabina de mando de un niño: indicadores (energía, combustible XP, racha, estrellas) y misiones del día.
 * `compact` se usa en la cabina doble (dos niños en el mismo iPad).
 */
const Cockpit = ({ kidName, compact = false }: { kidName: string; compact?: boolean }) => {
  const { members, points, pointLogs, chores, toggleChore, routines, routineLogs, toggleRoutineTask } = useData();
  const kid = members.find(m => m.name === kidName);
  const today = todayKey();

  const [fx, setFx] = useState<Fx | null>(null);
  const [floats, setFloats] = useState<Float[]>([]);
  const [combo, setCombo] = useState(0);
  const lastTap = useRef(0);
  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myPoints = points[kidName] || 0;
  const level = getLevel(pointLogs, kidName);
  const streak = getStreak(pointLogs, kidName);
  const earnedToday = pointLogs
    .filter(l => l.member === kidName && l.points > 0 && new Date(l.date).toLocaleDateString('en-CA') === today)
    .reduce((s, l) => s + l.points, 0);

  const myChores = chores.filter(c => c.user === kidName || c.user === 'Familia');
  const myRoutines = routines.filter(r => r.member === kidName && r.tasks.length > 0).sort((a, b) => a.time.localeCompare(b.time));
  const isTaskDone = (rid: string, i: number) => routineLogs.includes(`${today}_${rid}_${i}`);
  const routineDone = (rid: string, n: number) => n > 0 && Array.from({ length: n }).every((_, i) => isTaskDone(rid, i));
  const total = myChores.length + myRoutines.length;
  const done = myChores.filter(c => c.status === 'Hecho').length + myRoutines.filter(r => routineDone(r.id, r.tasks.length)).length;
  const pct = total ? done / total : 0;

  // Combustible XP: 10 celdas hacia el siguiente rango
  const cells = 10;
  const litCells = Math.floor(level.progress * cells);

  const show = (next: Fx, ms: number) => {
    if (fxTimer.current) clearTimeout(fxTimer.current);
    setFx(next);
    fxTimer.current = setTimeout(() => setFx(null), ms);
  };

  const floatAt = (at: string, text: string) => {
    const id = nextId();
    setFloats(f => [...f, { id, at, text }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 1100);
  };

  const bumpCombo = () => {
    const now = clock();
    const next = now - lastTap.current < 45000 ? combo + 1 : 1;
    lastTap.current = now;
    setCombo(next);
    return next;
  };

  /** Recompensa después de completar algo: misión, ascenso o hipersalto */
  const reward = (earned: number, missionName: string, at: string) => {
    const c = bumpCombo();
    floatAt(at, `+${earned} ⭐`);
    const newDone = done + 1;
    const leveled = levelForXp(level.xp + earned).level > level.level;
    if (leveled) {
      const nl = levelForXp(level.xp + earned);
      sounds.levelUp();
      show({ id: nextId(), kind: 'levelup', title: '¡ASCENSO!', sub: `${nl.emoji} Ahora eres ${nl.title} · Nivel ${nl.level}` }, 3200);
    } else if (total > 0 && newDone === total) {
      sounds.warp();
      show({ id: nextId(), kind: 'warp', title: '¡HIPERSALTO!', sub: `Completaste las ${total} misiones de hoy` }, 3400);
    } else {
      sounds.mission();
      show({ id: nextId(), kind: 'mission', title: 'MISIÓN CUMPLIDA', sub: `${missionName} · +${earned} ⭐${c >= 2 ? ` · COMBO x${c}` : ''}` }, 1700);
    }
    if (total > 0 && newDone === total) {
      notify({ to: 'parents', title: `🚀 ${kidName} terminó sus misiones`, body: `Completó las ${total} misiones de hoy.`, url: '/', tag: `missions-${kidName}-${today}` });
    }
  };

  const tapStep = (rid: string, idx: number, n: number, name: string) => {
    const was = isTaskDone(rid, idx);
    toggleRoutineTask(rid, idx, kidName);
    if (was) { sounds.deselect(); return; }
    const completes = Array.from({ length: n }).every((_, i) => i === idx || isTaskDone(rid, i));
    if (!completes) { sounds.blip(); floatAt(`${rid}_${idx}`, '✓'); return; }
    const others = myRoutines.filter(r => r.id !== rid);
    const perfect = others.length > 0 && others.every(r => routineDone(r.id, r.tasks.length));
    reward(ROUTINE_POINTS + (perfect ? PERFECT_DAY_POINTS : 0), name, `${rid}_${idx}`);
  };

  const tapChore = (id: string, pts: number, isDone: boolean, name: string) => {
    toggleChore(id, kidName);
    if (isDone) { sounds.deselect(); return; }
    reward(pts, name, id);
  };

  const floatsFor = (at: string) => floats.filter(f => f.at === at).map(f => <span key={f.id} className="ck-float">{f.text}</span>);

  return (
    <section className={`cockpit${compact ? ' compact' : ''}`} aria-label={`Cabina de ${kidName}`}>
      {/* Efectos de recompensa */}
      {fx && (
        <div key={fx.id} className={`ck-fx ck-fx-${fx.kind}`} role="status" onClick={() => setFx(null)}>
          {fx.kind === 'warp' && <div className="ck-warp" aria-hidden>{Array.from({ length: 40 }).map((_, i) => <i key={i} style={{ '--a': `${(i * 137) % 360}deg`, '--d': `${(i % 7) * 0.05}s` } as React.CSSProperties} />)}</div>}
          {fx.kind !== 'warp' && <div className="ck-burst" aria-hidden>{Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ '--a': `${i * 22.5}deg` } as React.CSSProperties} />)}</div>}
          <div className="ck-fx-card">
            <p className="ck-fx-title">{fx.title}</p>
            <p className="ck-fx-sub">{fx.sub}</p>
          </div>
        </div>
      )}

      {/* Consola del piloto */}
      <header className="ck-head">
        <div className="ck-avatar"><span>{kid?.avatar || '🧑‍🚀'}</span></div>
        <div className="ck-id">
          <p className="ck-callsign">PILOTO {kidName.toUpperCase()}</p>
          <p className="ck-rank">{level.emoji} {level.title}</p>
        </div>
        <div className="ck-level" aria-label={`Nivel ${level.level}`}><small>NIV</small><b>{level.level}</b></div>
      </header>

      <div className="ck-instruments">
        <Gauge value={pct} size={compact ? 112 : 136} label="Energía de misión">
          <b className="ck-big">{Math.round(pct * 100)}<small>%</small></b>
          <span className="ck-label">ENERGÍA</span>
        </Gauge>
        <div className="ck-readouts">
          <div className="ck-readout">
            <span className="ck-label">⭐ ESTRELLAS</span>
            <b key={myPoints} className="ck-num bump">{myPoints}</b>
          </div>
          <div className="ck-readout">
            <span className="ck-label">🔥 RACHA</span>
            <b className="ck-num">{streak}<small> {streak === 1 ? 'día' : 'días'}</small></b>
          </div>
          <div className="ck-readout">
            <span className="ck-label">⚡ HOY</span>
            <b key={earnedToday} className="ck-num bump">+{earnedToday}</b>
          </div>
          <div className="ck-readout">
            <span className="ck-label">🎯 MISIONES</span>
            <b className="ck-num">{done}<small>/{total}</small></b>
          </div>
        </div>
      </div>

      <div className="ck-fuel">
        <div className="ck-fuel-top">
          <span className="ck-label">COMBUSTIBLE PARA SIGUIENTE RANGO</span>
          <span className="ck-label">{level.next ? `${level.next - level.xp} XP` : 'MÁXIMO'}</span>
        </div>
        <div className="ck-fuel-cells">
          {Array.from({ length: cells }).map((_, i) => <i key={i} className={i < litCells ? 'on' : ''} />)}
        </div>
        {combo >= 2 && <span key={combo} className="ck-combo">COMBO x{combo}</span>}
      </div>

      {/* Misiones */}
      <div className="ck-missions">
        <div className="ck-missions-head">
          <h3>🎯 Misiones de hoy</h3>
          {total > 0 && done === total && <span className="ck-allset">🏆 ¡Todo listo!</span>}
        </div>
        {total === 0 && <p className="kid-empty">Pide a papá o mamá que te asignen misiones.</p>}

        {myRoutines.map(r => {
          const rDone = routineDone(r.id, r.tasks.length);
          const stepsDone = r.tasks.filter((_, i) => isTaskDone(r.id, i)).length;
          return (
            <div key={r.id} className={`ck-module${rDone ? ' done' : ''}`}>
              <div className="ck-module-head">
                <span>{r.icon} {r.name}</span>
                <small>{rDone ? `+${ROUTINE_POINTS} ✓` : `${stepsDone}/${r.tasks.length} · ${r.time}`}</small>
              </div>
              <div className="ck-steps">
                {r.tasks.map((t, i) => {
                  const ok = isTaskDone(r.id, i);
                  return (
                    <button key={i} className={`ck-step${ok ? ' on' : ''}`} onClick={() => tapStep(r.id, i, r.tasks.length, r.name)} aria-pressed={ok}>
                      <i className="ck-led" />{t}
                      {floatsFor(`${r.id}_${i}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {myChores.map(c => {
          const isDone = c.status === 'Hecho';
          return (
            <button key={c.id} className={`ck-switch${isDone ? ' on' : ''}`} onClick={() => tapChore(c.id, c.points, isDone, c.name)} aria-pressed={isDone}>
              <span className="ck-toggle"><i>{isDone && <Check size={14} strokeWidth={4} />}</i></span>
              <span className="ck-switch-name">{c.name}<small>{c.freq}{c.user === 'Familia' ? ' · Familia' : ''}</small></span>
              <span className="ck-switch-pts">+{c.points}</span>
              {floatsFor(c.id)}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Cockpit;
