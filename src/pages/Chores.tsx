import { useState } from 'react';
import { Clock, CheckCircle, List, X, Calendar as CalendarIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const Chores = () => {
  const { role } = useUser();
  const { chores, toggleChore, addChore, routines, routineLogs, toggleRoutineTask } = useData();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [user, setUser] = useState('Alan');
  const [freq, setFreq] = useState('Diario');

  const todayDate = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChore({ name, user, freq, points: 20 });
    setName('');
    setShowForm(false);
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Agenda Diaria y Tareas</h1>
          <p className="page-subtitle">Visualiza y completa las actividades de hoy</p>
        </div>
        {role === 'parent' && <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nueva Tarea</button>}
      </header>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Nueva Tarea</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Tarea</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Asignar a</label>
                <select value={user} onChange={(e) => setUser(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="Familia">Familia (Compartida)</option>
                  <option>Alan</option>
                  <option>Aria</option>
                  <option>Raúl</option>
                  <option>Tania</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Frecuencia</label>
                <input value={freq} onChange={(e) => setFreq(e.target.value)} type="text" placeholder="Ej: Diario, Lunes, Mar/Jue" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Crear Tarea</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Listado Diario por Bloques */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}><CalendarIcon size={20} color="var(--p-primary)" /> Rutinas (Cronológico)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {routines.map(routine => (
              <div key={routine.id} style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border)' }}>
                <div style={{ position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--p-primary)', border: '4px solid var(--p-background)' }} />
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--p-primary)' }}>{routine.time}</span>
                    <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{routine.icon} {routine.name}</h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'var(--p-surface)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>{routine.member}</span>
                </div>
                <div className="card" style={{ padding: '1rem', background: 'var(--p-surface)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {routine.tasks.map((t, i) => {
                      const isTaskDone = routineLogs.includes(`${todayDate}_${routine.id}_${i}`);
                      return (
                        <div key={i} onClick={() => toggleRoutineTask(routine.id, i, routine.member)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={isTaskDone} readOnly style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                          <span style={{ fontWeight: '500', textDecoration: isTaskDone ? 'line-through' : 'none', color: isTaskDone ? 'var(--p-text-muted)' : 'var(--p-text)' }}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {routines.length === 0 && <p style={{ color: 'var(--p-text-muted)', textAlign: 'center' }}>No hay rutinas configuradas.</p>}
          </div>
        </div>

        {/* Tareas del Hogar */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}><List size={20} color="var(--p-primary)" /> Responsabilidades del Hogar</h3>
          <div className="card" style={{ padding: '0.5rem' }}>
            {chores.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div 
                    onClick={() => toggleChore(task.id)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: task.status === 'Hecho' ? '#dcfce7' : 'var(--p-background)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: task.status === 'Hecho' ? '1px solid #166534' : '1px solid var(--border)'
                    }}
                  >
                    {task.status === 'Hecho' ? <CheckCircle size={20} color="#10b981" /> : <Clock size={18} color="var(--p-text-muted)" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '1rem', textDecoration: task.status === 'Hecho' ? 'line-through' : 'none', color: task.status === 'Hecho' ? 'var(--p-text-muted)' : 'var(--p-text)' }}>{task.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'white', background: 'var(--p-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{task.user}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>• {task.freq}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>+{task.points} pts</span>
                </div>
              </div>
            ))}
            {chores.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--p-text-muted)' }}>No hay responsabilidades asignadas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chores;
