import { useState, useEffect } from 'react';
import { Star, X, Check, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

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
  const [selectedMeal, setSelectedSlot] = useState<string>('Comida');
  const [cart, setCart] = useState<string[]>([]);

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

  const confirmOrder = () => {
    if (cart.length > 0) {
      assignMeal(selectedDay, selectedMeal, cart, kidName);
      setCart([]);
      setShowDelivery(false);
    }
  };

  const myChores = chores.filter(c => (c.user === kidName || c.user === 'Familia') && c.status === 'Pendiente');
  const myRoutines = routines.filter(r => r.member === kidName);
  const todayRoutineDone = myRoutines.filter(r =>
    r.tasks.length > 0 && r.tasks.every((_, i) => routineLogs.includes(`${todayStr}_${r.id}_${i}`))
  ).length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}>

      {/* Timer Overlay */}
      {showTimer && (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #10b981, #059669)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <button
            onClick={() => { setShowTimer(false); setIsActive(false); }}
            style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X color="white" size={20} />
          </button>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>⚡</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem', textAlign: 'center' }}>RETO ACTIVO</h2>
          <div style={{ fontSize: '7rem', fontWeight: '900', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {timeLeft === 0 && (
            <div style={{ marginTop: '2rem', background: 'white', color: '#059669', padding: '1rem 3rem', borderRadius: '24px', fontSize: '1.75rem', fontWeight: '900' }}>
              ¡LOGRADO! 🎉
            </div>
          )}
          {timeLeft > 0 && (
            <button
              onClick={() => setIsActive(!isActive)}
              style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.2)', border: '2px solid white', borderRadius: '20px', padding: '0.75rem 2.5rem', color: 'white', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              {isActive ? '⏸ Pausa' : '▶ Reanudar'}
            </button>
          )}
        </div>
      )}

      {/* Header saludo */}
      <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
          {user?.avatar || '👤'}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--p-text)', marginBottom: '0.75rem' }}>
          ¡Hola, {kidName}!
        </h1>
        {/* Badge de puntos */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          padding: '0.625rem 1.5rem', borderRadius: '9999px',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
        }}>
          <Star size={20} color="white" fill="white" />
          <span style={{ fontWeight: '900', fontSize: '1.375rem', color: 'white' }}>{myPoints}</span>
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>puntos</span>
        </div>
      </div>

      {/* Progreso del día */}
      {(myChores.length > 0 || myRoutines.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', textAlign: 'center', border: '3px solid #fecdd3', boxShadow: '0 4px 12px rgba(244,63,94,0.1)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🧹</div>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tareas hoy</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--p-text)' }}>{myChores.length}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>pendientes</p>
          </div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1rem', textAlign: 'center', border: '3px solid #bbf7d0', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>⭐</div>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rutinas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--p-text)' }}>{todayRoutineDone}/{myRoutines.length}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>completadas</p>
          </div>
        </div>
      )}

      {/* Grid de accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>

        {/* Kid Delivery */}
        <button
          onClick={() => setShowDelivery(true)}
          style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', border: 'none', borderRadius: '24px', padding: '1.5rem 1rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 6px 20px rgba(244,63,94,0.35)', color: 'white' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍔</div>
          <p style={{ fontWeight: '900', fontSize: '1rem' }}>Kid Delivery</p>
          <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.25rem' }}>Planifica tu menú</p>
        </button>

        {/* Duelo */}
        <Link to="/duel" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '24px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 6px 20px rgba(79,70,229,0.35)', color: 'white', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚔️</div>
            <p style={{ fontWeight: '900', fontSize: '1rem' }}>Duelo Familiar</p>
            <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.25rem' }}>¡Reta a alguien!</p>
          </div>
        </Link>

        {/* Reto relámpago */}
        <button
          onClick={() => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '24px', padding: '1.5rem 1rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 6px 20px rgba(16,185,129,0.35)', color: 'white' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
          <p style={{ fontWeight: '900', fontSize: '1rem' }}>Reto 5 min</p>
          <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.25rem' }}>Cronómetro</p>
        </button>

        {/* Tienda */}
        <Link to="/rewards" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '24px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 6px 20px rgba(245,158,11,0.35)', color: 'white', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <p style={{ fontWeight: '900', fontSize: '1rem' }}>Tienda</p>
            <p style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.25rem' }}>Canjear premios</p>
          </div>
        </Link>
      </div>

      {/* Comida de hoy */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', marginBottom: '1rem', border: '3px solid #fef3c7', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontWeight: '900', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🍴 Mi Comida de Hoy
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(meal => {
            const slot = weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === kidName);
            if (!slot || slot.foodIds.length === 0) return null;
            const slotFoods = slot.foodIds.map(fid => foods.find(f => f.id === fid)?.name).filter(Boolean);
            return (
              <div
                key={meal}
                onClick={() => toggleAte(slot.id)}
                style={{ padding: '0.75rem 1rem', background: slot.ate ? '#dcfce7' : '#f8fafc', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: `2px solid ${slot.ate ? '#86efac' : '#e2e8f0'}`, transition: 'all 0.2s' }}
              >
                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', marginRight: '0.5rem' }}>{meal}</span>
                  {slotFoods.join(' + ')}
                </span>
                {slot.ate
                  ? <Check size={20} color="#166534" strokeWidth={3} />
                  : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                }
              </div>
            );
          })}
          {!weeklyMenu.some(w => w.day === today && w.member === kidName && w.foodIds.length > 0) && (
            <p style={{ color: 'var(--p-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>
              Sin comida asignada hoy
            </p>
          )}
        </div>
      </div>

      {/* Modal Delivery */}
      {showDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(244,63,94,0.97)', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', background: 'white', borderRadius: '30px', padding: '1.5rem', position: 'relative', minHeight: 'fit-content' }}>
            <button
              onClick={() => setShowDelivery(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} color="#64748b" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🍔</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f43f5e' }}>Kid Delivery</h2>
              <p style={{ fontWeight: '700', color: '#64748b', fontSize: '0.875rem' }}>¡Planifica tu semana!</p>
            </div>

            {/* Selector de día */}
            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  style={{ padding: '0.5rem 0.875rem', borderRadius: '12px', border: 'none', background: selectedDay === d ? '#f43f5e' : '#f1f5f9', color: selectedDay === d ? 'white' : '#64748b', fontWeight: '800', cursor: 'pointer', flexShrink: 0, fontSize: '0.8rem' }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Selector de comida */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedSlot(m)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: `2px solid ${selectedMeal === m ? '#f43f5e' : '#e2e8f0'}`, background: selectedMeal === m ? '#f43f5e' : 'white', color: selectedMeal === m ? 'white' : '#94a3b8', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Carrito */}
            <div style={{ background: '#fff1f2', padding: '0.875rem', borderRadius: '16px', marginBottom: '1.25rem', border: '2px dashed #fda4af' }}>
              <h3 style={{ fontSize: '0.8rem', color: '#e11d48', marginBottom: '0.5rem', fontWeight: '900' }}>
                🛒 Carrito — {selectedDay}:
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {cart.map(fid => {
                  const f = foods.find(food => food.id === fid);
                  return f ? (
                    <span key={fid} style={{ background: 'white', color: '#f43f5e', padding: '0.25rem 0.625rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {f.name} <X size={12} onClick={() => setCart(cart.filter(id => id !== fid))} style={{ cursor: 'pointer' }} />
                    </span>
                  ) : null;
                })}
                {cart.length === 0 && <span style={{ color: '#fb7185', fontSize: '0.8rem', fontWeight: '600' }}>Vacío. ¡Añade algo rico!</span>}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={confirmOrder}
                  style={{ width: '100%', marginTop: '0.875rem', padding: '0.75rem', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ¡PEDIR AHORA! 🚀
                </button>
              )}
            </div>

            {/* Alimentos disponibles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {foods.filter(f => f.categories.includes(selectedMeal)).map(food => (
                <div
                  key={food.id}
                  onClick={() => !cart.includes(food.id) && setCart([...cart, food.id])}
                  style={{ background: cart.includes(food.id) ? '#fff1f2' : '#f8fafc', padding: '0.875rem 1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: `2px solid ${cart.includes(food.id) ? '#fda4af' : 'transparent'}`, transition: 'all 0.15s' }}
                >
                  <div>
                    <h4 style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9375rem' }}>{food.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{food.calories} kcal</span>
                  </div>
                  {cart.includes(food.id)
                    ? <Check size={20} color="#f43f5e" strokeWidth={3} />
                    : <Plus size={20} color="#f43f5e" strokeWidth={3} />
                  }
                </div>
              ))}
              {foods.filter(f => f.categories.includes(selectedMeal)).length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontWeight: '600' }}>
                  No hay alimentos para {selectedMeal} aún
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidZone;
