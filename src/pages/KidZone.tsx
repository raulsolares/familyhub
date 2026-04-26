import { Trophy, CheckCircle, GraduationCap, ShoppingBag, Star, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const KidZone = () => {
  const { user } = useUser();
  const { points, chores, schoolTasks, toggleChore, toggleSchoolTask } = useData();

  const kidName = user.name === 'Mateo' ? 'Mateo' : 'Sofía';
  const myPoints = points[kidName] || 0;
  
  const myChores = chores.filter(c => c.user === kidName && c.status === 'Pendiente');
  const mySchool = schoolTasks.filter(t => t.child === kidName && !t.completed);

  const menuItems = [
    { title: 'Mis Tareas', icon: <CheckCircle size={40} />, color: '#4f46e5', link: '/chores', bg: '#eef2ff', count: myChores.length },
    { title: 'Escuela', icon: <GraduationCap size={40} />, color: '#0ea5e9', link: '/school', bg: '#f0f9ff', count: mySchool.length },
    { title: 'Premios', icon: <Trophy size={40} />, color: '#f59e0b', link: '/rewards', bg: '#fffbeb' },
    { title: 'Súper', icon: <ShoppingBag size={40} />, color: '#10b981', link: '/shopping/mode', bg: '#f0fdf4' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
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
          {user.avatar}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {menuItems.map((item, i) => (
          <Link key={i} to={item.link} style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{ 
              background: item.bg, 
              padding: '2rem', 
              borderRadius: '30px', 
              textAlign: 'center',
              border: `4px solid white`,
              boxShadow: '0 8px 0 rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ color: item.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <h3 style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--p-text)' }}>{item.title}</h3>
              {item.count !== undefined && item.count > 0 && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', border: '3px solid white' }}>
                  {item.count}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="card" style={{ borderRadius: '30px' }}>
        <h3 className="card-title" style={{ justifyContent: 'center' }}><Star size={24} color="#f59e0b" fill="#f59e0b" /> Cosas por hacer hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {[...myChores, ...mySchool].slice(0, 3).map((item: any) => (
            <div 
              key={item.id} 
              onClick={() => item.user ? toggleChore(item.id) : toggleSchoolTask(item.id)}
              style={{ 
                padding: '1.25rem', 
                background: '#f8fafc', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #cbd5e1' }} />
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.name || item.title}</span>
            </div>
          ))}
          {myChores.length === 0 && mySchool.length === 0 && (
            <p style={{ textAlign: 'center', fontWeight: '700', color: '#10b981' }}>✨ ¡Todo terminado por hoy! ✨</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KidZone;
