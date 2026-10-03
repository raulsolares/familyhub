import { useState, useEffect } from 'react';
import { Star, X, Check, Minus, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { useCelebration } from '../components/Celebration';
import { getLevel, getStreak, getBadges } from '../utils/gamification';
import { getFoodUsage, remainingFor } from '../utils/food';
import { todayKey, todayName, WEEK_DAYS, daysUntil } from '../utils/dates';
import { sounds } from '../utils/audio';

const MEALS = ['Desayuno', 'Lunch', 'Comida', 'Cena'];
const MEAL_EMOJI: Record<string, string> = { Desayuno: '🌅', Lunch: '🥪', Comida: '🍽️', Cena: '🌙' };

const KidZone = () => {
  const { user, role } = useUser();
  const {
    points, pointLogs, foods, assignMeal, weeklyMenu, toggleAte, chores, toggleChore,
    routines, routineLogs, toggleRoutineTask, members, foodGroupLimits, schoolTasks, familyEvents,
  } = useData();
  const { celebrate, celebrationNode } = useCelebration();

  const kids = members.filter(m => m.role === 'child');
  const [actingKid, setActingKid] = useState(kids[0]?.name || '');
  // Un papá en "Vista Niños" puede ver la pantalla de cualquiera de sus hijos
  const kidName = role === 'parent' ? actingKid : (user?.name || 'Invitado');
  const kid = members.find(m => m.name === kidName);

  const today = todayName();
  const todayStr = todayKey();

  const [showDelivery, setShowDelivery] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [selectedMeal, setSelectedMeal] = useState<string>('Desayuno');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [limitMsg, setLimitMsg] = useState('');

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

  const tapRoutineTask = (rid: string, idx: number, total: number) => {
    const wasDone = isTaskDone(rid, idx);
    toggleRoutineTask(rid, idx, kidName);
    if (wasDone) { sounds.deselect(); return; }
    const willComplete = Array.from({ length: total }).every((_, i) => i === idx || isTaskDone(rid, i));
    if (willComplete) {
      const others = myRoutines.filter(r => r.id !== rid);
      const perfect = others.length > 0 && others.every(r => routineDone(r.id, r.tasks.length));
      celebrate(perfect ? '💯 ¡Día perfecto! +50 ⭐' : '🎉 ¡Rutina completa! +30 ⭐', perfect);
    } else {
      sounds.tap();
    }
  };

  const tapChore = (id: string, pts: number, done: boolean) => {
    toggleChore(id, kidName);
    if (done) sounds.deselect(); else celebrate(`✅ ¡Tarea lista! +${pts} ⭐`);
  };

  // ── Pedido de comida con topes semanales ───────────────────────────────────
  const loadSelection = (day: string, meal: string) => {
    const slot = weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === kidName);
    const loaded: Record<string, number> = {};
    slot?.foodIds.forEach(fid => { loaded[fid] = slot.quantities?.[fid] || 1; });
    setQuantities(loaded);
    setLimitMsg('');
  };
  const openDelivery = () => {
    setSelectedDay(today); setSelectedMeal('Desayuno');
    loadSelection(today, 'Desayuno');
    setShowDelivery(true);
  };
  const pickDay = (d: string) => { setSelectedDay(d); loadSelection(d, selectedMeal); };
  const pickMeal = (m: string) => { setSelectedMeal(m); loadSelection(selectedDay, m); };

  const usage = getFoodUsage(weeklyMenu, foods, kidName, { day: selectedDay, meal: selectedMeal });
  const remaining = (fid: string) => {
    const food = foods.find(f => f.id === fid);
    return food ? remainingFor(food, usage, quantities, foods, foodGroupLimits) : Infinity;
  };

  const tap = (foodId: string) => {
    if (remaining(foodId) <= 0) {
      const food = foods.find(f => f.id === foodId);
      const foodLeft = food?.maxPerWeek
        ? food.maxPerWeek - (usage.byFood[foodId] || 0) - (quantities[foodId] || 0)
        : Infinity;
      setLimitMsg(foodLeft <= 0
        ? `Ya no te quedan ${food?.name} esta semana 🙈`
        : `Ya usaste todos tus ${food?.group} de esta semana 🙈`);
      sounds.error();
      return;
    }
    sounds.select();
    setLimitMsg('');
    setQuantities(prev => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
  };

  const decrement = (foodId: string) => {
    sounds.deselect();
    setLimitMsg('');
    setQuantities(prev => {
      const cur = prev[foodId] || 0;
      if (cur <= 1) { const next = { ...prev }; delete next[foodId]; return next; }
      return { ...prev, [foodId]: cur - 1 };
    });
  };

  const confirmOrder = () => {
    assignMeal(selectedDay, selectedMeal, Object.keys(quantities), kidName, quantities);
    sounds.save();
    setShowDelivery(false);
  };

  const mealFoods = foods.filter(f => f.categories.includes(selectedMeal));
  const selectedCount = Object.keys(quantities).length;
  const slotExists = weeklyMenu.some(w => w.day === selectedDay && w.meal === selectedMeal && w.member === kidName);
  const groupsWithLimit = Object.entries(foodGroupLimits);

  const nextEvents = [
    ...schoolTasks.filter(t => t.child === kidName && !t.completed && t.eventDate).map(t => ({ id: t.id, title: `🎒 ${t.title}`, date: t.eventDate })),
    ...familyEvents.filter(e => e.members.includes('Familia') || e.members.includes(kidName)).map(e => ({ id: e.id, title: `📅 ${e.title}`, date: e.date })),
  ].filter(e => daysUntil(e.date) >= 0 && daysUntil(e.date) <= 7).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const card = { background: 'white', borderRadius: '24px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1rem' } as const;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}>
      {celebrationNode}

      {role === 'parent' && kids.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          {kids.map(k => (
            <button key={k.id} onClick={() => setActingKid(k.name)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 800,
              background: actingKid === k.name ? 'var(--p-primary)' : 'white', color: actingKid === k.name ? 'white' : '#64748b',
            }}>{k.avatar} {k.name}</button>
          ))}
        </div>
      )}

      {/* Timer */}
      {showTimer && (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #10b981, #059669)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '1rem' }}>
          <button onClick={() => { setShowTimer(false); setIsActive(false); }} aria-label="Cerrar" style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X color="white" size={20} />
          </button>
          <div style={{ fontSize: '4rem' }}>⚡</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>RETO ACTIVO</h2>
          <p style={{ fontWeight: 700, opacity: 0.9, marginBottom: '1rem', textAlign: 'center' }}>¡Recoge y ordena todo lo que puedas antes de que acabe!</p>
          <div style={{ fontSize: 'clamp(4rem, 22vw, 7rem)', fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {timeLeft === 0 && <div style={{ marginTop: '2rem', background: 'white', color: '#059669', padding: '1rem 3rem', borderRadius: '24px', fontSize: '1.75rem', fontWeight: 900 }}>¡LOGRADO! 🎉</div>}
          {timeLeft > 0 && <button onClick={() => setIsActive(!isActive)} style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid white', borderRadius: '20px', padding: '0.75rem 2.5rem', color: 'white', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>{isActive ? '⏸ Pausa' : '▶ Reanudar'}</button>}
        </div>
      )}

      {/* Tarjeta de jugador */}
      <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', borderRadius: '28px', padding: '1.25rem', color: 'white', marginBottom: '1rem', boxShadow: '0 10px 30px rgba(139,92,246,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '3.25rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {kid?.avatar || user?.avatar || '👤'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>¡Hola, {kidName}!</h1>
            <p style={{ fontWeight: 800, opacity: 0.95 }}>{level.emoji} Nivel {level.level} · {level.title}</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div className="level-bar"><div style={{ width: `${Math.round(level.progress * 100)}%` }} /></div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.375rem', opacity: 0.9 }}>
            {level.next ? `${level.next - level.xp} XP para el nivel ${level.level + 1}` : '¡Nivel máximo alcanzado!'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.875rem' }}>
          {[
            { icon: <Star size={16} fill="white" />, value: myPoints, label: 'puntos' },
            { icon: '🔥', value: streak, label: streak === 1 ? 'día de racha' : 'días de racha' },
            { icon: '⚡', value: `+${earnedToday}`, label: 'hoy' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '16px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: 900, fontSize: '1.25rem' }}>{s.icon} {s.value}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Misiones de hoy */}
      <div style={{ ...card, border: '3px solid #bbf7d0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1.05rem' }}>🎯 Misiones de hoy</h3>
          <span style={{ fontWeight: 900, color: '#10b981' }}>{missionsDone}/{missionsTotal}</span>
        </div>
        {missionsTotal === 0 && <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem' }}>Pide a papá o mamá que te asignen misiones.</p>}

        {myRoutines.map(r => {
          const done = routineDone(r.id, r.tasks.length);
          return (
            <div key={r.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '16px', background: done ? '#dcfce7' : '#f8fafc', border: `2px solid ${done ? '#86efac' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 900 }}>{r.icon} {r.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: done ? '#166534' : '#64748b' }}>{done ? '¡Completa! +30' : r.time}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {r.tasks.map((t, i) => {
                  const ok = isTaskDone(r.id, i);
                  return (
                    <button key={i} onClick={() => tapRoutineTask(r.id, i, r.tasks.length)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', borderRadius: '12px', cursor: 'pointer',
                      border: `2px solid ${ok ? '#22c55e' : '#e2e8f0'}`, background: ok ? '#22c55e' : 'white', color: ok ? 'white' : '#334155',
                      fontWeight: 800, fontSize: '0.8rem', fontFamily: 'inherit',
                    }}>
                      {ok ? <Check size={14} strokeWidth={3} /> : <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
                      {t}
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
            <button key={c.id} onClick={() => tapChore(c.id, c.points, done)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem',
              borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              border: `2px solid ${done ? '#86efac' : '#fecdd3'}`, background: done ? '#dcfce7' : '#fff1f2',
            }}>
              {done ? <Check size={22} color="#166534" strokeWidth={3} /> : <span style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid #fda4af', flexShrink: 0 }} />}
              <span style={{ flex: 1, fontWeight: 800, color: done ? '#166534' : '#1e293b', textDecoration: done ? 'line-through' : 'none' }}>
                🧹 {c.name}
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none' }}>{c.freq}{c.user === 'Familia' ? ' · Familia' : ''}</span>
              </span>
              <span style={{ fontWeight: 900, color: '#f59e0b' }}>+{c.points}</span>
            </button>
          );
        })}
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem', marginBottom: '1rem' }}>
        <button onClick={openDelivery} className="kid-action" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
          <div style={{ fontSize: '2.25rem' }}>🍔</div><p>Elegir mi comida</p>
        </button>
        <Link to="/rewards" className="kid-action" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <div style={{ fontSize: '2.25rem' }}>🏆</div><p>Tienda de premios</p>
        </Link>
        <Link to="/duel" className="kid-action" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
          <div style={{ fontSize: '2.25rem' }}>⚔️</div><p>Duelo</p>
        </Link>
        <button onClick={() => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }} className="kid-action" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <div style={{ fontSize: '2.25rem' }}>⚡</div><p>Reto 5 min</p>
        </button>
      </div>

      {/* Comida de hoy */}
      <div style={{ ...card, border: '3px solid #fef3c7' }}>
        <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem' }}>🍴 Mi comida de hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MEALS.map(meal => {
            const slot = weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === kidName);
            if (!slot || slot.foodIds.length === 0) return null;
            const names = slot.foodIds.map(fid => {
              const food = foods.find(f => f.id === fid);
              if (!food) return null;
              const qty = slot.quantities?.[fid] || 1;
              return qty > 1 ? `${food.name} ×${qty}` : food.name;
            }).filter(Boolean);
            return (
              <button key={meal} onClick={() => toggleAte(slot.id)} style={{ padding: '0.75rem 1rem', background: slot.ate ? '#dcfce7' : '#f8fafc', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: `2px solid ${slot.ate ? '#86efac' : '#e2e8f0'}`, fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', marginRight: '0.5rem' }}>{MEAL_EMOJI[meal]} {meal}</span>
                  {names.join(', ')}
                </span>
                {slot.ate ? <Check size={20} color="#166534" strokeWidth={3} /> : <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />}
              </button>
            );
          })}
          {!weeklyMenu.some(w => w.day === today && w.member === kidName && w.foodIds.length > 0) && (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>Aún no eliges tu comida de hoy</p>
          )}
        </div>
      </div>

      {/* Próximos eventos */}
      {nextEvents.length > 0 && (
        <div style={{ ...card, border: '3px solid #dbeafe' }}>
          <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem' }}>📆 Esta semana</h3>
          {nextEvents.map(e => {
            const d = daysUntil(e.date);
            return (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.875rem' }}>
                <span>{e.title}</span>
                <span style={{ color: d <= 1 ? '#e11d48' : '#64748b', fontWeight: 900 }}>{d === 0 ? 'HOY' : d === 1 ? 'Mañana' : `en ${d} días`}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Insignias */}
      <div style={{ ...card, border: '3px solid #fde68a' }}>
        <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '0.75rem' }}>🏅 Mis insignias ({badges.filter(b => b.earned).length}/{badges.length})</h3>
        <div className="badge-grid">
          {badges.map(b => (
            <div key={b.id} className={`badge-tile${b.earned ? '' : ' locked'}`} title={b.desc}>
              <div style={{ fontSize: '1.75rem' }}>{b.emoji}</div>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, lineHeight: 1.15 }}>{b.name}</div>
              {!b.earned && <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '2px' }}>{b.desc}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Selector de comida ── */}
      {showDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', background: 'white', borderRadius: '28px 28px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f43f5e' }}>¿Qué quieres comer?</h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Algunos platillos tienen un límite por semana</p>
              </div>
              <button onClick={() => setShowDelivery(false)} aria-label="Cerrar" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.3rem', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
              {WEEK_DAYS.map(d => (
                <button key={d} onClick={() => pickDay(d)} style={{ padding: '0.35rem 0.7rem', borderRadius: '9px', border: 'none', background: selectedDay === d ? '#f43f5e' : '#f1f5f9', color: selectedDay === d ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer', flexShrink: 0, fontSize: '0.75rem' }}>
                  {d === today ? `${d} ★` : d}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
              {MEALS.map(m => (
                <button key={m} onClick={() => pickMeal(m)} style={{ padding: '0.5rem 0.25rem', borderRadius: '12px', border: `2px solid ${selectedMeal === m ? '#f43f5e' : 'transparent'}`, background: selectedMeal === m ? '#fff1f2' : '#f8fafc', color: selectedMeal === m ? '#f43f5e' : '#94a3b8', fontWeight: 800, cursor: 'pointer', fontSize: '0.72rem' }}>
                  <div style={{ fontSize: '1.1rem' }}>{MEAL_EMOJI[m]}</div>{m}
                </button>
              ))}
            </div>

            {groupsWithLimit.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
                {groupsWithLimit.map(([g, lim]) => {
                  const inSel = Object.entries(quantities).filter(([fid]) => foods.find(f => f.id === fid)?.group === g).reduce((s, [, q]) => s + q, 0);
                  const left = Math.max(0, lim - (usage.byGroup[g] || 0) - inSel);
                  return (
                    <span key={g} style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '999px', background: left === 0 ? '#fee2e2' : '#fef3c7', color: left === 0 ? '#b91c1c' : '#92400e' }}>
                      {g}: te quedan {left} de {lim}
                    </span>
                  );
                })}
              </div>
            )}

            {limitMsg && (
              <div style={{ margin: '0 1.25rem 0.75rem', padding: '0.5rem 0.75rem', borderRadius: '12px', background: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{limitMsg}</div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem' }}>
              {mealFoods.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontWeight: 600, fontSize: '0.9rem' }}>No hay alimentos para {selectedMeal} aún</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
                  {mealFoods.map(food => {
                    const qty = quantities[food.id] || 0;
                    const left = remaining(food.id);
                    const blocked = left <= 0 && qty === 0;
                    return (
                      <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: qty > 0 ? '#fff1f2' : blocked ? '#f1f5f9' : '#f8fafc', borderRadius: '14px', border: `2px solid ${qty > 0 ? '#fda4af' : 'transparent'}`, opacity: blocked ? 0.6 : 1 }}>
                        <div onClick={() => tap(food.id)} style={{ flex: 1, cursor: 'pointer', userSelect: 'none', minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: qty > 0 ? '#e11d48' : '#1e293b' }}>{food.name}</p>
                          <p style={{ fontSize: '0.7rem', color: blocked ? '#b91c1c' : '#94a3b8', fontWeight: 700 }}>
                            {blocked ? 'Se acabaron esta semana' : left === Infinity ? (food.group || 'Sin límite') : `Puedes ${left} más esta semana`}
                          </p>
                        </div>
                        {blocked ? (
                          <Lock size={18} color="#94a3b8" />
                        ) : qty > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                            <button onClick={() => decrement(food.id)} aria-label="Quitar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#fecdd3', color: '#e11d48', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#e11d48', width: '22px', textAlign: 'center' }}>{qty}</span>
                            <button onClick={() => tap(food.id)} aria-label="Agregar" disabled={left <= 0} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: left <= 0 ? '#cbd5e1' : '#f43f5e', color: 'white', cursor: left <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => tap(food.id)} aria-label="Agregar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#f43f5e', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Plus size={16} strokeWidth={3} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '0.875rem 1.25rem calc(0.875rem + env(safe-area-inset-bottom))', borderTop: '2px solid #fecdd3', flexShrink: 0 }}>
              {selectedCount > 0 || slotExists ? (
                <button onClick={confirmOrder} style={{ width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer' }}>
                  {selectedCount > 0
                    ? `✓ Guardar ${selectedCount} platillo${selectedCount > 1 ? 's' : ''} · ${selectedMeal} del ${selectedDay}`
                    : `Quitar ${selectedMeal} del ${selectedDay}`}
                </button>
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 700, fontSize: '0.875rem' }}>Toca un platillo para agregarlo</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidZone;
