import { useState, useEffect } from 'react';
import { Trophy, Star, Utensils, X, Check, Timer, Swords, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const KidZone = () => {
  const { user } = useUser();
  const { points, foods, assignMeal, weeklyMenu, toggleAte } = useData();

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

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const confirmOrder = () => {
    if (cart.length > 0) {
      assignMeal(selectedDay, selectedMeal, cart, kidName);
      setCart([]);
      setShowDelivery(false);
    }
  };

  const menuItems = [
    { title: 'Armar Menú', icon: <Utensils size={40} />, color: '#f43f5e', action: () => setShowDelivery(true), bg: '#fff1f2' },
    { title: 'Duelo Familiar', icon: <Swords size={40} />, color: '#4f46e5', link: '/duel', bg: '#eef2ff' },
    { title: 'Reto Relámpago', icon: <Timer size={40} />, color: '#10b981', action: () => { setTimeLeft(300); setIsActive(true); setShowTimer(true); }, bg: '#f0fdf4' },
    { title: 'Tienda Premios', icon: <Trophy size={40} />, color: '#f59e0b', link: '/rewards', bg: '#fffbeb' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Timer Overlay */}
      {showTimer && (
        <div style={{ position: 'fixed', inset: 0, background: '#10b981', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <button onClick={() => setShowTimer(false)} style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X color="#10b981" /></button>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem' }}>⚡ RETO ACTIVO ⚡</h2>
          <div style={{ fontSize: '8rem', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {timeLeft === 0 && <div style={{ marginTop: '2rem', background: 'white', color: '#10b981', padding: '1rem 3rem', borderRadius: '20px', fontSize: '2rem', fontWeight: '900' }}>¡LOGRADO! 🔔</div>}
        </div>
      )}

      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{user?.avatar || '👤'}</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--p-text)' }}>¡Hola, {kidName}!</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem 1.5rem', borderRadius: '20px', border: '3px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star color="#f59e0b" fill="#f59e0b" size={24} />
            <span style={{ fontWeight: '900', fontSize: '1.5rem', color: '#b45309' }}>{myPoints} pts</span>
          </div>
        </div>
      </header>

      {/* Modal Delivery */}
      {showDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: '#f43f5e', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '30px', minHeight: '100%', padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => setShowDelivery(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X color="#64748b" /></button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#f43f5e' }}>Kid Delivery 🍔</h2>
              <p style={{ fontWeight: '700', color: '#64748b' }}>¡Planifica tu semana!</p>
            </div>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '1rem', marginBottom: '1rem' }}>
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} style={{ padding: '0.6rem 1rem', borderRadius: '15px', border: 'none', background: selectedDay === d ? '#f43f5e' : '#f1f5f9', color: selectedDay === d ? 'white' : '#64748b', fontWeight: '800', cursor: 'pointer', flexShrink: 0 }}>{d}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(m => (
                <button key={m} onClick={() => setSelectedSlot(m)} style={{ flex: 1, padding: '0.6rem', borderRadius: '12px', border: '2px solid #f43f5e', background: selectedMeal === m ? '#f43f5e' : 'white', color: selectedMeal === m ? 'white' : '#f43f5e', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>{m}</button>
              ))}
            </div>

            {/* Carrito Temporal */}
            <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '20px', marginBottom: '1.5rem', border: '2px dashed #f43f5e' }}>
               <h3 style={{ fontSize: '0.9rem', color: '#e11d48', marginBottom: '0.5rem', fontWeight: '900' }}>🛒 Tu Carrito para el {selectedDay}:</h3>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                 {cart.map(fid => {
                   const f = foods.find(food => food.id === fid);
                   return f ? (
                     <span key={fid} style={{ background: 'white', color: '#f43f5e', padding: '0.3rem 0.7rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                       {f.name} <X size={14} onClick={() => setCart(cart.filter(id => id !== fid))} style={{ cursor: 'pointer' }} />
                     </span>
                   ) : null;
                 })}
                 {cart.length === 0 && <span style={{ color: '#fb7185', fontSize: '0.8rem' }}>Vacío. ¡Añade comida rica!</span>}
               </div>
               {cart.length > 0 && <button onClick={confirmOrder} style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>¡PEDIR AHORA! 🚀</button>}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {foods.filter(f => f.categories.includes(selectedMeal)).map(food => (
                <div key={food.id} onClick={() => !cart.includes(food.id) && setCart([...cart, food.id])} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '2px solid transparent' }}>
                  <div>
                    <h4 style={{ fontWeight: '900', color: '#1e293b' }}>{food.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>{food.calories} kcal</span>
                  </div>
                  <Plus size={20} color="#f43f5e" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {menuItems.map((item, i) => (
          item.link ? (
            <Link key={i} to={item.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: item.bg, padding: '1.5rem', borderRadius: '25px', textAlign: 'center', border: `4px solid white`, boxShadow: 'var(--shadow-premium)', cursor: 'pointer' }}>
                <div style={{ color: item.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--p-text)' }}>{item.title}</h3>
              </div>
            </Link>
          ) : (
            <div key={i} onClick={item.action} style={{ background: item.bg, padding: '1.5rem', borderRadius: '25px', textAlign: 'center', border: `4px solid white`, boxShadow: 'var(--shadow-premium)', cursor: 'pointer' }}>
              <div style={{ color: item.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <h3 style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--p-text)' }}>{item.title}</h3>
            </div>
          )
        ))}
      </div>

      {/* Comida de Hoy (Visual) */}
      <div className="card" style={{ borderRadius: '25px', marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ justifyContent: 'center' }}>🍴 Mi Comida de Hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(meal => {
             const slot = weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === kidName);
             if (!slot || slot.foodIds.length === 0) return null;
             const slotFoods = slot.foodIds.map(fid => foods.find(f => f.id === fid)?.name).filter(Boolean);
             return (
               <div key={meal} onClick={() => toggleAte(slot.id)} style={{ padding: '1rem', background: slot.ate ? '#dcfce7' : 'var(--p-background)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                 <span style={{ fontWeight: '800' }}>{meal}: {slotFoods.join(' + ')}</span>
                 {slot.ate ? <Check size={20} color="#166534" strokeWidth={3}/> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default KidZone;
