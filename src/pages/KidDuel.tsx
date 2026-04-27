import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Trophy, CheckCircle, Zap, Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const KidDuel = () => {
  const { chores, schoolTasks, toggleChore, toggleSchoolTask, points } = useData();
  const [celebrating, setCelebration] = useState<string | null>(null);

  const getKidData = (name: string) => {
    const kidChores = chores.filter(c => c.user === name && c.status === 'Pendiente');
    const kidSchool = schoolTasks.filter(t => t.child === name && !t.completed);
    return { chores: kidChores, school: kidSchool, total: kidChores.length + kidSchool.length };
  };

  const mateo = getKidData('Mateo');
  const sofia = getKidData('Sofía');

  const handleComplete = (id: string, type: 'chore' | 'school', kid: string) => {
    // Sonido de éxito (Mock)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.play().catch(() => {});
    
    if (type === 'chore') toggleChore(id);
    else toggleSchoolTask(id);

    setCelebration(kid);
    setTimeout(() => setCelebration(null), 3000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', margin: '-2.5rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header Duatlón */}
      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}><ArrowLeft /></Link>
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy color="#f59e0b" /> DUELO DE TAREAS <Trophy color="#f59e0b" />
        </h1>
        <div style={{ width: '40px' }} />
      </header>

      {/* Pantalla Dividida */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* Lado Mateo */}
        <div style={{ flex: 1, background: '#eef2ff', padding: '2rem', borderRight: '4px solid #4f46e5', position: 'relative' }}>
          {celebrating === 'Mateo' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', zIndex: 10 }}>🎉 +20</div>}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>👦</div>
            <h2 style={{ fontWeight: '900', color: '#1e1b4b' }}>Mateo</h2>
            <div style={{ background: '#4f46e5', color: 'white', display: 'inline-block', padding: '0.2rem 1rem', borderRadius: '999px', fontWeight: '800' }}>{points.Mateo} pts</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...mateo.chores, ...mateo.school].map((item: any) => (
              <div key={item.id} onClick={() => handleComplete(item.id, item.user ? 'chore' : 'school', 'Mateo')} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 8px 0 #c7d2fe' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #cbd5e1' }} />
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{item.name || item.title}</span>
              </div>
            ))}
            {mateo.total === 0 && <div style={{ textAlign: 'center', marginTop: '3rem' }}><Star size={60} color="#f59e0b" fill="#f59e0b" /><h3 style={{ fontWeight: '900' }}>¡TODO LISTO!</h3></div>}
          </div>
        </div>

        {/* Lado Sofía */}
        <div style={{ flex: 1, background: '#fff1f2', padding: '2rem', position: 'relative' }}>
          {celebrating === 'Sofía' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', zIndex: 10 }}>🎉 +20</div>}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>👧</div>
            <h2 style={{ fontWeight: '900', color: '#881337' }}>Sofía</h2>
            <div style={{ background: '#f43f5e', color: 'white', display: 'inline-block', padding: '0.2rem 1rem', borderRadius: '999px', fontWeight: '800' }}>{points.Sofía} pts</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...sofia.chores, ...sofia.school].map((item: any) => (
              <div key={item.id} onClick={() => handleComplete(item.id, item.user ? 'chore' : 'school', 'Sofía')} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 8px 0 #fecdd3' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #cbd5e1' }} />
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{item.name || item.title}</span>
              </div>
            ))}
            {sofia.total === 0 && <div style={{ textAlign: 'center', marginTop: '3rem' }}><Star size={60} color="#f59e0b" fill="#f59e0b" /><h3 style={{ fontWeight: '900' }}>¡TODO LISTO!</h3></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidDuel;
