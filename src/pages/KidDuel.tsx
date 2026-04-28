import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trophy, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Routine } from '../context/DataContext';

const KidDuel = () => {
  const { routines, points, routineLogs, toggleRoutineTask } = useData();
  const [celebrating, setCelebration] = useState<string | null>(null);
  
  const todayDate = new Date().toISOString().split('T')[0];

  const getKidRoutines = (name: string) => {
    return routines.filter((r: Routine) => r.member === name);
  };

  const alanRoutines = getKidRoutines('Alan');
  const ariaRoutines = getKidRoutines('Aria');

  const handleTaskComplete = (routineId: string, taskIndex: number, kidName: string, totalTasks: number) => {
    const isTaskDone = routineLogs.includes(`${todayDate}_${routineId}_${taskIndex}`);
    if (isTaskDone) return; 
    
    toggleRoutineTask(routineId, taskIndex, kidName);

    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});

    const routineTasksDone = routineLogs.filter(k => k.startsWith(`${todayDate}_${routineId}_`)).length;
    if (routineTasksDone + 1 === totalTasks) {
      setCelebration(kidName);
      setTimeout(() => setCelebration(null), 3000);
      const winAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      winAudio.play().catch(() => {});
    }
  };

  const isRoutineDone = (routineId: string, totalTasks: number) => {
    return routineLogs.filter(k => k.startsWith(`${todayDate}_${routineId}_`)).length === totalTasks;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', margin: '-2.5rem', position: 'relative', overflow: 'hidden' }}>
      
      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}><ArrowLeft /></Link>
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy color="#f59e0b" /> DUELO DE RUTINAS <Trophy color="#f59e0b" />
        </h1>
        <div style={{ width: '40px' }} />
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Lado Alan */}
        <div style={{ flex: 1, background: '#eef2ff', padding: '2rem', borderRight: '4px solid #4f46e5', position: 'relative', overflowY: 'auto' }}>
          {celebrating === 'Alan' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', zIndex: 10 }}>🎉 +30</div>}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>👦</div>
            <h2 style={{ fontWeight: '900', color: '#1e1b4b' }}>Alan</h2>
            <div style={{ background: '#4f46e5', color: 'white', display: 'inline-block', padding: '0.2rem 1rem', borderRadius: '999px', fontWeight: '800' }}>{points.Alan || 0} pts</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {alanRoutines.map((routine: Routine) => {
              const done = isRoutineDone(routine.id, routine.tasks.length);
              return (
                <div key={routine.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 8px 0 #c7d2fe', opacity: done ? 0.6 : 1 }}>
                  <h3 style={{ fontWeight: '900', fontSize: '1.2rem', color: '#1e1b4b', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{routine.icon} {routine.name}</span> <span style={{ color: '#4f46e5' }}>{routine.time}</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {routine.tasks.map((t, i) => {
                      const isTaskDone = routineLogs.includes(`${todayDate}_${routine.id}_${i}`);
                      return (
                        <div key={i} onClick={() => handleTaskComplete(routine.id, i, 'Alan', routine.tasks.length)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isTaskDone ? 'none' : '2px solid #cbd5e1', background: isTaskDone ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isTaskDone && <CheckCircle color="white" size={16} />}
                          </div>
                          <span style={{ fontWeight: '700', textDecoration: isTaskDone ? 'line-through' : 'none', color: isTaskDone ? '#94a3b8' : '#1e293b' }}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {alanRoutines.length === 0 && <div style={{ textAlign: 'center', marginTop: '3rem' }}><Star size={60} color="#f59e0b" fill="#f59e0b" /><h3 style={{ fontWeight: '900' }}>¡Sin rutinas!</h3></div>}
          </div>
        </div>

        {/* Lado Aria */}
        <div style={{ flex: 1, background: '#fff1f2', padding: '2rem', position: 'relative', overflowY: 'auto' }}>
          {celebrating === 'Aria' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', zIndex: 10 }}>🎉 +30</div>}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>👧</div>
            <h2 style={{ fontWeight: '900', color: '#881337' }}>Aria</h2>
            <div style={{ background: '#f43f5e', color: 'white', display: 'inline-block', padding: '0.2rem 1rem', borderRadius: '999px', fontWeight: '800' }}>{points.Aria || 0} pts</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {ariaRoutines.map((routine: Routine) => {
              const done = isRoutineDone(routine.id, routine.tasks.length);
              return (
                <div key={routine.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 8px 0 #fecdd3', opacity: done ? 0.6 : 1 }}>
                  <h3 style={{ fontWeight: '900', fontSize: '1.2rem', color: '#881337', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{routine.icon} {routine.name}</span> <span style={{ color: '#f43f5e' }}>{routine.time}</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {routine.tasks.map((t, i) => {
                      const isTaskDone = routineLogs.includes(`${todayDate}_${routine.id}_${i}`);
                      return (
                        <div key={i} onClick={() => handleTaskComplete(routine.id, i, 'Aria', routine.tasks.length)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isTaskDone ? 'none' : '2px solid #cbd5e1', background: isTaskDone ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isTaskDone && <CheckCircle color="white" size={16} />}
                          </div>
                          <span style={{ fontWeight: '700', textDecoration: isTaskDone ? 'line-through' : 'none', color: isTaskDone ? '#94a3b8' : '#1e293b' }}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {ariaRoutines.length === 0 && <div style={{ textAlign: 'center', marginTop: '3rem' }}><Star size={60} color="#f59e0b" fill="#f59e0b" /><h3 style={{ fontWeight: '900' }}>¡Sin rutinas!</h3></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidDuel;
