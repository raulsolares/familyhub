import { Link } from 'react-router-dom';
import {
  Bell, BellRing, Target, GraduationCap, Gift, ShoppingCart, ArrowRight, CheckCircle2,
  AlertTriangle, Utensils, CalendarDays, Activity, Check, X,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import KidZone from './KidZone';
import { usePush } from '../hooks/usePush';
import { useNotifications } from '../hooks/useNotifications';
import { getLevel, getStreak } from '../utils/gamification';
import { MEALS, MEAL_EMOJI, foodEmoji } from '../utils/food';
import { todayKey, todayName, daysUntil, WEEK_DAYS } from '../utils/dates';
import { notify } from '../utils/push';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
};

const fmtDay = (key: string) => {
  const d = daysUntil(key);
  if (d === 0) return 'Hoy';
  if (d === 1) return 'Mañana';
  const [y, m, dd] = key.split('-').map(Number);
  return new Date(y, m - 1, dd).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const { viewMode, user } = useUser();
  const data = useData();
  const {
    schoolTasks, weeklyMenu, foods, chores, members, prizeRequests, prizes, familyEvents, routines,
    routineLogs, pointLogs, points, customShoppingItems, isCloudEnabled, resolvePrizeRequest,
  } = data;
  const push = usePush();
  useNotifications(schoolTasks);

  if (viewMode === 'child') return <KidZone />;

  const today = todayKey();
  const dayName = todayName();
  const tomorrowName = WEEK_DAYS[(WEEK_DAYS.indexOf(dayName) + 1) % 7];
  const kids = members.filter(m => m.role === 'child');

  // ── Progreso de niños ──────────────────────────────────────────────────────
  const kidStats = kids.map(k => {
    const myChores = chores.filter(c => c.user === k.name || c.user === 'Familia');
    const myRoutines = routines.filter(r => r.member === k.name && r.tasks.length > 0);
    const routineDone = myRoutines.filter(r => r.tasks.every((_, i) => routineLogs.includes(`${today}_${r.id}_${i}`))).length;
    const choreDone = myChores.filter(c => c.status === 'Hecho' && (c.user !== 'Familia' || c.doneBy === k.name)).length;
    const total = myChores.length + myRoutines.length;
    const done = choreDone + routineDone;
    const level = getLevel(pointLogs, k.name);
    return { k, total, done, level, streak: getStreak(pointLogs, k.name), points: points[k.name] || 0 };
  });
  const missionsTotal = kidStats.reduce((s, x) => s + x.total, 0);
  const missionsDone = kidStats.reduce((s, x) => s + x.done, 0);

  // ── Escuela y agenda ───────────────────────────────────────────────────────
  const openSchool = schoolTasks.filter(t => !t.completed);
  const schoolSoon = openSchool
    .map(t => ({ ...t, d: daysUntil(t.deadline || t.eventDate) }))
    .filter(t => t.d <= 3)
    .sort((a, b) => a.d - b.d);

  const agenda = [
    ...familyEvents.map(e => ({ id: e.id, date: e.date, time: e.time, title: e.title, who: e.members.join(', '), color: e.color || 'var(--p-primary)' })),
    ...openSchool.filter(t => t.eventDate).map(t => ({ id: t.id, date: t.eventDate, time: t.eventTime, title: t.title, who: `${t.child} · ${t.category}`, color: '#a16207' })),
  ]
    .filter(a => daysUntil(a.date) >= 0 && daysUntil(a.date) <= 7)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    .slice(0, 7);

  // ── Pendientes de atención ─────────────────────────────────────────────────
  const pendingPrizes = prizeRequests.filter(r => r.status === 'pending');
  const kidsWithoutTomorrow = kids.filter(k => !weeklyMenu.some(w => w.day === tomorrowName && w.member === k.name && w.foodIds.length > 0));

  const shoppingCount = new Set(
    weeklyMenu.flatMap(s => s.foodIds.flatMap(fid => foods.find(f => f.id === fid)?.ingredients.map(i => i.name.toLowerCase()) || [])),
  ).size + customShoppingItems.filter(i => !i.checked).length;

  const recent = [...pointLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const approve = (id: string, ok: boolean) => {
    const req = prizeRequests.find(r => r.id === id);
    resolvePrizeRequest(id, ok);
    if (req) {
      const prize = prizes.find(p => p.id === req.prizeId);
      notify({
        to: [req.member],
        title: ok ? '🎁 ¡Premio aprobado!' : 'Canje no aprobado',
        body: ok ? `Ya puedes disfrutar: ${prize?.name || 'tu premio'}` : 'Habla con papá o mamá sobre tu premio.',
        url: '/rewards',
      });
    }
  };

  const attentionCount = pendingPrizes.length + schoolSoon.length + (kidsWithoutTomorrow.length ? 1 : 0);

  return (
    <div className="dash">
      <div className="dash-hello">
        <div>
          <h1>{greeting()}, {user?.name}</h1>
          <p style={{ textTransform: 'capitalize' }}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="dash-hello-actions">
          <span className="sync-pill"><i style={{ background: isCloudEnabled ? 'var(--success)' : 'var(--warning)' }} />{isCloudEnabled ? 'Sincronizado' : 'Solo este dispositivo'}</span>
          {push.supported && push.configured && !push.enabled && (
            <button className="btn-secondary" onClick={() => push.enable()} disabled={push.busy}><Bell size={14} /> Activar notificaciones</button>
          )}
          {push.enabled && <span className="sync-pill"><BellRing size={13} /> Notificaciones activas</span>}
        </div>
      </div>
      {push.error && <div className="notice warn">{push.error}</div>}

      <div className="kpis">
        <Link to="/chores" className="kpi">
          <span className="kpi-label"><Target size={14} /> Misiones de hoy</span>
          <span className="kpi-value">{missionsDone}<span style={{ color: 'var(--p-text-subtle)', fontWeight: 500 }}>/{missionsTotal}</span></span>
          <span className="kpi-sub">{missionsTotal ? `${Math.round((missionsDone / missionsTotal) * 100)}% completado` : 'Sin misiones asignadas'}</span>
        </Link>
        <Link to="/school" className={`kpi${schoolSoon.some(t => t.d <= 1) ? ' alert' : ''}`}>
          <span className="kpi-label"><GraduationCap size={14} /> Escuela</span>
          <span className="kpi-value">{schoolSoon.length}</span>
          <span className="kpi-sub">{schoolSoon.length ? 'en los próximos 3 días' : 'Nada urgente'}</span>
        </Link>
        <Link to="/rewards" className={`kpi${pendingPrizes.length ? ' alert' : ''}`}>
          <span className="kpi-label"><Gift size={14} /> Canjes</span>
          <span className="kpi-value">{pendingPrizes.length}</span>
          <span className="kpi-sub">{pendingPrizes.length ? 'por aprobar' : 'Sin solicitudes'}</span>
        </Link>
        <Link to="/shopping" className="kpi">
          <span className="kpi-label"><ShoppingCart size={14} /> Súper</span>
          <span className="kpi-value">{shoppingCount}</span>
          <span className="kpi-sub">artículos en la lista</span>
        </Link>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h3>Necesita tu atención {attentionCount > 0 && <span className="nav-badge" style={{ marginLeft: 0 }}>{attentionCount}</span>}</h3>
            </div>
            {attentionCount === 0 ? (
              <div className="panel-body"><p className="panel-empty" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Todo en orden por ahora.</p></div>
            ) : (
              <div className="attention-list">
                {pendingPrizes.map(r => {
                  const prize = prizes.find(p => p.id === r.prizeId);
                  const kid = members.find(m => m.name === r.member);
                  return (
                    <div key={r.id} className="attention-item">
                      <span className="attention-icon teal"><Gift size={16} /></span>
                      <div className="attention-text">
                        <b>{kid?.avatar} {r.member} quiere “{prize?.name || 'premio'}”</b>
                        <span>{prize?.points} pts · tiene {points[r.member] || 0}</span>
                      </div>
                      <div className="attention-actions">
                        <button className="btn-xs" onClick={() => approve(r.id, false)} aria-label="Rechazar"><X size={13} /></button>
                        <button className="btn-xs primary" onClick={() => approve(r.id, true)}><Check size={13} /> Aprobar</button>
                      </div>
                    </div>
                  );
                })}
                {schoolSoon.map(t => (
                  <div key={t.id} className="attention-item">
                    <span className={`attention-icon ${t.d <= 1 ? 'red' : 'amber'}`}>{t.d <= 1 ? <AlertTriangle size={16} /> : <GraduationCap size={16} />}</span>
                    <div className="attention-text">
                      <b>{t.title}</b>
                      <span>{t.child} · {t.category} · {t.d < 0 ? 'vencido' : t.d === 0 ? 'hoy' : t.d === 1 ? 'mañana' : `en ${t.d} días`}</span>
                    </div>
                    <Link to="/school" className="btn-xs">Ver</Link>
                  </div>
                ))}
                {kidsWithoutTomorrow.length > 0 && (
                  <div className="attention-item">
                    <span className="attention-icon amber"><Utensils size={16} /></span>
                    <div className="attention-text">
                      <b>Falta el menú de mañana</b>
                      <span>{kidsWithoutTomorrow.map(k => k.name).join(' y ')} no {kidsWithoutTomorrow.length > 1 ? 'han' : 'ha'} elegido su comida del {tomorrowName.toLowerCase()}</span>
                    </div>
                    <Link to="/menu" className="btn-xs">Planear</Link>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3>Niños hoy</h3>
              <Link to="/rewards">Puntos <ArrowRight size={12} /></Link>
            </div>
            {kidStats.length === 0 ? (
              <div className="panel-body"><p className="panel-empty">Agrega a tus hijos en Configuración.</p></div>
            ) : (
              <div className="kid-progress-grid">
                {kidStats.map(({ k, total, done, level, streak, points: pts }) => (
                  <div key={k.id} className="kid-progress">
                    <div className="kid-progress-top">
                      <span className="kid-progress-avatar">{k.avatar}</span>
                      <div>
                        <p className="kid-progress-name">{k.name}</p>
                        <p className="kid-progress-level">Nivel {level.level} · {level.title}</p>
                      </div>
                    </div>
                    <div className="kid-progress-meter"><div style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
                    <div className="kid-progress-stats">
                      <span><b>{done}/{total}</b> misiones</span>
                      <span><b>{pts}</b> pts</span>
                      <span>🔥 <b>{streak}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3><Utensils size={15} /> Comidas de hoy</h3>
              <Link to="/menu">Menú semanal <ArrowRight size={12} /></Link>
            </div>
            <table className="meals-today">
              <thead>
                <tr><th>Quién</th>{MEALS.map(m => <th key={m}>{MEAL_EMOJI[m]} {m}</th>)}</tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const slotFor = (meal: string) => weeklyMenu.find(w => w.day === dayName && w.meal === meal && w.member === m.name && w.foodIds.length);
                  const hasMeal = (meal: string) => !!slotFor(meal);
                  const cell = (meal: string) => {
                    const slot = slotFor(meal);
                    if (!slot) return <span className="none">—</span>;
                    return slot.foodIds.map(fid => {
                      const f = foods.find(x => x.id === fid);
                      return f ? <span key={fid} className={`meal-pill${slot.ate ? ' ate' : ''}`}>{foodEmoji(f)} {f.name}</span> : null;
                    });
                  };
                  return (
                    <tr key={m.id}>
                      <td className="who">{m.avatar} {m.name}</td>
                      {MEALS.map(meal => <td key={meal} className="meal-col">{cell(meal)}</td>)}
                      <td className="meal-stack">
                        {MEALS.some(hasMeal)
                          ? MEALS.filter(hasMeal).map(meal => (
                            <div key={meal} style={{ marginBottom: '0.25rem' }}><span className="eyebrow" style={{ marginRight: '0.375rem' }}>{meal}</span>{cell(meal)}</div>
                          ))
                          : <span className="none">Sin menú hoy</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h3><CalendarDays size={15} /> Próximos 7 días</h3>
              <Link to="/calendar">Calendario <ArrowRight size={12} /></Link>
            </div>
            {agenda.length === 0 ? (
              <div className="panel-body"><p className="panel-empty">Semana tranquila: no hay eventos.</p></div>
            ) : (
              <ul className="agenda">
                {agenda.map(a => (
                  <li key={a.id}>
                    <span className="agenda-when">{fmtDay(a.date)}{a.time ? <><br />{a.time}</> : null}</span>
                    <span className="agenda-bar" style={{ background: a.color }} />
                    <span className="agenda-text"><b>{a.title}</b><span>{a.who}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3><Activity size={15} /> Actividad reciente</h3>
              <Link to="/rewards">Historial <ArrowRight size={12} /></Link>
            </div>
            {recent.length === 0 ? (
              <div className="panel-body"><p className="panel-empty">Aún no hay movimientos de puntos.</p></div>
            ) : (
              <ul className="agenda">
                {recent.map(l => (
                  <li key={l.id}>
                    <span className="agenda-when">{new Date(l.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="agenda-text" style={{ flex: 1 }}><b>{members.find(m => m.name === l.member)?.avatar} {l.member}</b><span>{l.description}</span></span>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: l.points >= 0 ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{l.points >= 0 ? '+' : ''}{l.points}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
