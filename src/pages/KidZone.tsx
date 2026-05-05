import { useState, useEffect } from 'react';
import { Star, X, Check, Minus, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const MEALS = ['Desayuno', 'Lunch', 'Comida', 'Cena'];
const MEAL_EMOJI: Record<string, string> = { Desayuno: '🌅', Lunch: '🥪', Comida: '🍽️', Cena: '🌙' };

const KidZone = () => {
  const { user } = useUser();
  const { points, foods, assignMeal, weeklyMenu, toggleAte, chores, routines, routineLogs } = useData();

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = dayNames[new Date().getDay()];

  const [showDelivery, setShowDelivery] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [selectedMeal, setSelectedMeal] = useState<string>('Desayuno');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const kidName = user?.name || 'Invitado';
  const myPoints = points[kidName] || 0;
  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  // Carga pedidos existentes al cambiar día/comida
  useEffect(() => {
    const slot = weeklyMenu.find(w => w.day === selectedDay && w.meal === selectedMeal && w.member === kidName);
    if (slot && slot.foodIds.length > 0) {
      const loaded: Record<string, number> = {};
      slot.foodIds.forEach(fid => { loaded[fid] = slot.quantities?.[fid] || 1; });
      setQuantities(loaded);
    } else {
      setQuantities({});
    }
  }, [selectedDay, selectedMeal]); // eslint-disable-line

  const tap = (foodId: string) => {
    setQuantities(prev => {
      const cur = prev[foodId] || 0;
      if (cur === 0) return { ...prev, [foodId]: 1 };
      return { ...prev, [foodId]: cur + 1 };
    });
  };

  const decrement = (foodId: string) => {
    setQuantities(prev => {
      const cur = prev[foodId] || 0;
      if (cur <= 1) { const next = { ...prev }; delete next[foodId]; return next; }
      return { ...prev, [foodId]: cur - 1 };
    });
  };

  const confirmOrder = () => {
    const selected = Object.keys(quantities);
    assignMeal(selectedDay, selectedMeal, selected, kidName, quantities);
    setShowDelivery(false);
  };

  const myChores = chores.filter(c => (c.user === kidName || c.user === 'Familia') && c.status === 'Pendiente');
  const myRoutines = routines.filter(r => r.member === kidName);
  const todayRoutineDone = myRoutines.filter(r =>
    r.tasks.length > 0 && r.tasks.every((_, i) => routineLogs.includes(`${todayStr}_${r.id}_${i}`))
  ).length;

  const mealFoods = foods.filter(f => f.categories.includes(selectedMeal));
  const selectedCount = Object.keys(quantities).length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}>

      {/* Timer Overlay */}
      {showTimer && (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #10b981, #059669)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <button onClick={() => { setShowTimer(false); setIsActive(false); }} style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X color="white" size={20} />
          </button>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>⚡</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem' }}>RETO ACTIVO</h2>
          <div style={{ fontSize: '7rem', fontWeight: '900', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {timeLeft === 0 && <div style={{ marginTop: '2rem', background: 'white', color: '#059669', padding: '1rem 3rem', borderRadius: '24px', fontSize: '1.75rem', fontWeight: '900' }}>¡LOGRADO! 🎉</div>}
          {timeLeft > 0 && <button onClick={() => setIsActive(!isActive)} style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid white', borderRadius: '20px', padding: '0.75rem 2.5rem', color: 'white', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}>{isActive ? '⏸ Pausa' : '▶ Reanudar'}</button>}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{user?.avatar || '👤'}</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--p-text)', marginBottom: '0.75rem' }}>¡Hola, {kidName}!</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #f97316)', padding: '0.625rem 1.5rem', borderRadius: '9999px', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)' }}>
          <Star size={20} color="white" fill="white" />
          <span style={{ fontWeight: '900', fontSize: '1.375rem', color: 'white' }}>{myPoints}</span>
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>puntos</span>
        </div>
      </div>

      {/* Stat chips */}
      {(myChores.length > 0 || myRoutines.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', textAlign: 'center', border: '3px solid #fecdd3' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🧹</div>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f43f5e', textTransform: 'uppercase' }}>Tareas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900' }}>{myChores.length}</p>
          </div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', textAlign: 'center', border: '3px solid #bbf7d0' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>⭐</div>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase' }}>Rutinas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900' }}>{todayRoutineDone}/{myRoutines.length}</p>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowDelivery(true)} style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', border: 'none', borderRadius: '24px', padding: '1.5rem 1rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 6px 20px rgba(244,63,94,0.35)', color: 'white' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍔</div>
          <p style={{ fontWeight: '900', fontSize: '1rem' }}>Pedir comida</p>
        </button>
        <Link to="/duel" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '24px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 6px 20px rgba(79,70,229,0.35)', color: 'white', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚔️</div>
            <p style={{ fontWeight: '900', fontSize: '1rem' }}>Duelo</p>
          </div>
        </Link>
        <button onClick={() => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '24px', padding: '1.5rem 1rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 6px 20px rgba(16,185,129,0.35)', color: 'white' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
          <p style={{ fontWeight: '900', fontSize: '1rem' }}>Reto 5 min</p>
        </button>
        <Link to="/rewards" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '24px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 6px 20px rgba(245,158,11,0.35)', color: 'white', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <p style={{ fontWeight: '900', fontSize: '1rem' }}>Tienda</p>
          </div>
        </Link>
      </div>

      {/* Comida de hoy */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', border: '3px solid #fef3c7', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: '900', fontSize: '1rem', marginBottom: '1rem' }}>🍴 Mi Comida de Hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MEALS.map(meal => {
            const slot = weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === kidName);
            if (!slot || slot.foodIds.length === 0) return null;
            const slotFoods = slot.foodIds
              .map(fid => {
                const food = foods.find(f => f.id === fid);
                if (!food) return null;
                const qty = slot.quantities?.[fid] || 1;
                return qty > 1 ? `${food.name} ×${qty}` : food.name;
              })
              .filter(Boolean);
            if (slotFoods.length === 0) return null;
            return (
              <div key={meal} onClick={() => toggleAte(slot.id)} style={{ padding: '0.75rem 1rem', background: slot.ate ? '#dcfce7' : '#f8fafc', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: `2px solid ${slot.ate ? '#86efac' : '#e2e8f0'}` }}>
                <span style={{ fontWeight: '800', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginRight: '0.5rem' }}>{MEAL_EMOJI[meal]} {meal}</span>
                  {slotFoods.join(', ')}
                </span>
                {slot.ate ? <Check size={20} color="#166534" strokeWidth={3} /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
              </div>
            );
          })}
          {!weeklyMenu.some(w => w.day === today && w.member === kidName && w.foodIds.length > 0) && (
            <p style={{ color: 'var(--p-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Sin comida pedida hoy</p>
          )}
        </div>
      </div>

      {/* ── MODAL SELECTOR ÁGIL ── */}
      {showDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', background: 'white', borderRadius: '28px 28px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header modal */}
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f43f5e' }}>¿Qué quieres comer?</h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Toca para agregar · +/− para la cantidad</p>
              </div>
              <button onClick={() => setShowDelivery(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Selector de día - scroll horizontal compacto */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.3rem', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} style={{ padding: '0.3rem 0.625rem', borderRadius: '9px', border: 'none', background: selectedDay === d ? '#f43f5e' : '#f1f5f9', color: selectedDay === d ? 'white' : '#64748b', fontWeight: '800', cursor: 'pointer', flexShrink: 0, fontSize: '0.72rem', transition: 'all 0.12s' }}>
                  {d === today ? `${d} ★` : d}
                </button>
              ))}
            </div>

            {/* Tabs de comida */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem', padding: '0 1.25rem 0.875rem', flexShrink: 0 }}>
              {MEALS.map(m => (
                <button key={m} onClick={() => setSelectedMeal(m)} style={{ padding: '0.5rem 0.25rem', borderRadius: '12px', border: `2px solid ${selectedMeal === m ? '#f43f5e' : 'transparent'}`, background: selectedMeal === m ? '#fff1f2' : '#f8fafc', color: selectedMeal === m ? '#f43f5e' : '#94a3b8', fontWeight: '800', cursor: 'pointer', fontSize: '0.72rem', textAlign: 'center', transition: 'all 0.12s' }}>
                  <div style={{ fontSize: '1.1rem' }}>{MEAL_EMOJI[m]}</div>
                  {m}
                </button>
              ))}
            </div>

            {/* Lista de alimentos — scroll vertical */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem' }}>
              {mealFoods.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontWeight: '600', fontSize: '0.9rem' }}>No hay alimentos para {selectedMeal} aún</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '6rem' }}>
                  {mealFoods.map(food => {
                    const qty = quantities[food.id] || 0;
                    return (
                      <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: qty > 0 ? '#fff1f2' : '#f8fafc', borderRadius: '14px', border: `2px solid ${qty > 0 ? '#fda4af' : 'transparent'}`, transition: 'all 0.12s' }}>
                        {/* Tap área para seleccionar */}
                        <div onClick={() => tap(food.id)} style={{ flex: 1, cursor: 'pointer', userSelect: 'none' }}>
                          <p style={{ fontWeight: '800', fontSize: '0.9375rem', color: qty > 0 ? '#e11d48' : '#1e293b' }}>{food.name}</p>
                          {food.calories && <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{food.calories} kcal</p>}
                        </div>
                        {qty > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                            <button onClick={() => decrement(food.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#fecdd3', color: '#e11d48', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: '900', fontSize: '1.1rem', color: '#e11d48', width: '22px', textAlign: 'center' }}>{qty}</span>
                            <button onClick={() => tap(food.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#f43f5e', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => tap(food.id)} style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: '#f43f5e', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Plus size={15} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botón confirmar */}
            <div style={{ padding: '0.875rem 1.25rem calc(0.875rem + env(safe-area-inset-bottom))', borderTop: '2px solid #fecdd3', flexShrink: 0 }}>
              {selectedCount > 0 ? (
                <button onClick={confirmOrder} style={{ width: '100%', padding: '0.9375rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,63,94,0.4)' }}>
                  ✓ Guardar {selectedCount} platillo{selectedCount > 1 ? 's' : ''} para {selectedMeal}
                </button>
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '700', fontSize: '0.875rem' }}>Toca un platillo para agregarlo</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidZone;
