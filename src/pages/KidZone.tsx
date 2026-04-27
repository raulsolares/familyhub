import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, GraduationCap, Star, Zap, Utensils, X, Check, Timer, Swords } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const KidZone = () => {
  const { user } = useUser();
  const { points, chores, schoolTasks, toggleChore, toggleSchoolTask, foods, assignMeal, weeklyMenu, toggleAte } = useData();

  const [showDelivery, setShowDelivery] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedMeal, setSelectedSlot] = useState<string>('Comida');

  const kidName = user?.name || 'Invitado';
  const myPoints = points[kidName] || 0;
  
  const myChores = chores.filter(c => c.user === kidName && c.status === 'Pendiente');
  const mySchool = schoolTasks.filter(t => t.child === kidName && !t.completed);

  const today = 'Domingo';

  // Lógica del Timer
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

  const startTimer = (mins: number) => {
    setTimeLeft(mins * 60);
    setIsActive(true);
    setShowTimer(true);
  };

  const menuItems = [
    { title: 'Hacer Pedido', icon: <Utensils size={40} />, color: '#f43f5e', action: () => setShowDelivery(true), bg: '#fff1f2' },
    { title: 'Duelo Familiar', icon: <Swords size={40} />, color: '#4f46e5', link: '/duel', bg: '#eef2ff' },
    { title: 'Reto 5 Min', icon: <Timer size={40} />, color: '#10b981', action: () => startTimer(5), bg: '#f0fdf4' },
    { title: 'Premios', icon: <Trophy size={40} />, color: '#f59e0b', link: '/rewards', bg: '#fffbeb' },
  ];

  const handleOrder = (foodId: string) => {
    assignMeal(today, selectedMeal, foodId, kidName);
    setShowDelivery(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Timer Overlay */}
      {showTimer && (
        <div style={{ position: 'fixed', inset: 0, background: '#10b981', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <button onClick={() => setShowTimer(false)} style={{ position: 'absolute', right: '2rem', top: '2rem', background: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X color="#10b981" /></button>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem' }}>⚡ RETO RELÁMPAGO ⚡</h2>
          <div style={{ fontSize: '8rem', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '1rem' }}>¡Corre! Termina tu tarea antes de que acabe el tiempo.</p>
          {timeLeft === 0 && <div style={{ marginTop: '2rem', background: 'white', color: '#10b981', padding: '1rem 3rem', borderRadius: '20px', fontSize: '2rem', fontWeight: '900' }}>¡TIEMPO! 🔔</div>}
        </div>
      )}

      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'var(--p-primary)', 
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          boxShadow: '0 10px 25px rgba(244, 63, 94, 0.3)'
        }}>
          {user?.avatar || '👤'}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--p-text)' }}>¡Hola, {kidName}!</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '15px', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star color="#f59e0b" fill="#f59e0b" size={20} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#b45309' }}>{myPoints} Puntos</span>
          </div>
          <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '15px', border: '2px solid #4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="#4f46e5" fill="#4f46e5" size={20} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#4338ca' }}>Nivel {Math.floor(myPoints / 100) + 1}</span>
          </div>
        </div>
      </header>

      {/* Modal Delivery */}
      {showDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: '#f43f5e', zIndex: 2000, padding: '1.5rem', overflowY: 'auto' }}>
          <button onClick={() => setShowDelivery(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}><X color="#f43f5e" /></button>
          <div style={{ textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
            <Utensils size={48} style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>Kid Food Delivery</h2>
            <p style={{ fontWeight: '700', opacity: 0.9 }}>¿Qué quieres pedir para hoy?</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(m => (
              <button key={m} onClick={() => setSelectedSlot(m)} style={{ padding: '0.6rem 1rem', borderRadius: '999px', border: 'none', background: selectedMeal === m ? 'white' : 'rgba(255,255,255,0.2)', color: selectedMeal === m ? '#f43f5e' : 'white', fontWeight: '800', cursor: 'pointer' }}>{m}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {foods.filter(f => f.category === selectedMeal || selectedMeal === 'Comida').map(food => (
              <div key={food.id} onClick={() => handleOrder(food.id)} style={{ background: 'white', padding: '1.5rem', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 8px 0 rgba(0,0,0,0.1)' }}>
                <div>
                  <h4 style={{ fontWeight: '900', fontSize: '1.25rem', color: '#1e293b' }}>{food.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>⭐ Favorito Familiar</span>
                </div>
                <div style={{ background: '#f43f5e', color: 'white', padding: '0.5rem', borderRadius: '15px' }}><Plus /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {menuItems.map((item, i) => (
          item.link ? (
            <Link key={i} to={item.link} style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{ background: item.bg, padding: '2rem', borderRadius: '30px', textAlign: 'center', border: `4px solid white`, boxShadow: '0 8px 0 rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ color: item.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--p-text)' }}>{item.title}</h3>
              </div>
            </Link>
          ) : (
            <div key={i} onClick={item.action} style={{ background: item.bg, padding: '2rem', borderRadius: '30px', textAlign: 'center', border: `4px solid white`, boxShadow: '0 8px 0 rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ color: item.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <h3 style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--p-text)' }}>{item.title}</h3>
            </div>
          )
        ))}
      </div>

      <div className="card" style={{ borderRadius: '30px', marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ justifyContent: 'center' }}><Utensils size={24} color="#f43f5e" /> Mi Comida de Hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {['Desayuno', 'Lunch', 'Comida', 'Cena'].map(meal => {
             const slot = weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === kidName);
             const food = foods.find(f => f.id === slot?.foodId);
             if (!food) return null;
             return (
               <div key={meal} onClick={() => slot && toggleAte(slot.id)} style={{ padding: '1.25rem', background: slot?.ate ? '#dcfce7' : '#f8fafc', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: slot?.ate ? '2px solid #22c55e' : '2px solid transparent' }}>
                 <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{meal}: {food.name}</span>
                 {slot?.ate ? <div style={{ background: '#22c55e', color: 'white', borderRadius: '50%', padding: '0.2rem' }}><Check size={18}/></div> : <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #cbd5e1' }} />}
               </div>
             );
          })}
        </div>
      </div>

      <div className="card" style={{ borderRadius: '30px' }}>
        <h3 className="card-title" style={{ justifyContent: 'center' }}><Star size={24} color="#f59e0b" fill="#f59e0b" /> Retos Pendientes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {[...myChores, ...mySchool].slice(0, 3).map((item: any) => (
            <div key={item.id} onClick={() => item.user ? toggleChore(item.id) : toggleSchoolTask(item.id)} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #cbd5e1' }} />
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.name || item.title}</span>
            </div>
          ))}
          {myChores.length === 0 && mySchool.length === 0 && (
            <p style={{ textAlign: 'center', fontWeight: '700', color: '#10b981' }}>✨ ¡Día perfecto! ✨</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KidZone;
