import { useState } from 'react';
import { Clock, CheckCircle, List, X, Calendar as CalendarIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const Chores = () => {
  const { role } = useUser();
  const { chores, toggleChore, addChore } = useData();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [user, setUser] = useState('Mateo');
  const [freq, setFreq] = useState('Diario');

  const routines = [
    { id: 1, name: 'Rutina Mañanera', time: '07:00 - 08:00', tasks: ['Hacer cama', 'Desayunar', 'Dientes'] },
    { id: 2, name: 'Hora de Tareas', time: '16:00 - 17:30', tasks: ['Revisar mochila', 'Hacer deberes'] },
    { id: 3, name: 'Rutina de Noche', time: '20:00 - 21:00', tasks: ['Pijama', 'Leer cuento', 'Dormir'] },
  ];

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
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Asignar a</label>
                <select value={user} onChange={(e) => setUser(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option>Mateo</option>
                  <option>Sofía</option>
                  <option>Papá</option>
                  <option>Mamá</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Frecuencia</label>
                <input value={freq} onChange={(e) => setFreq(e.target.value)} type="text" placeholder="Ej: Diario, Lunes, Mar/Jue" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Crear Tarea</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Listado Diario por Bloques */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}><CalendarIcon size={20} color="var(--p-primary)" /> Listado Diario (Cronológico)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {routines.map(routine => (
              <div key={routine.id} style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid #e2e8f0' }}>
                <div style={{ position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--p-primary)', border: '4px solid white' }} />
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--p-primary)' }}>{routine.time}</span>
                  <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{routine.name}</h4>
                </div>
                <div className="card" style={{ padding: '1rem', background: 'white' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {routine.tasks.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <span style={{ fontWeight: '500' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tareas del Hogar */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}><List size={20} color="var(--p-primary)" /> Responsabilidades del Hogar</h3>
          <div className="card" style={{ padding: '0.5rem' }}>
            {chores.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div 
                    onClick={() => toggleChore(task.id)}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: task.status === 'Hecho' ? '#dcfce7' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: task.status === 'Hecho' ? '1px solid #166534' : '1px solid #cbd5e1'
                    }}
                  >
                    {task.status === 'Hecho' ? <CheckCircle size={20} color="#10b981" /> : <Clock size={18} color="#cbd5e1" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '1rem', textDecoration: task.status === 'Hecho' ? 'line-through' : 'none', color: task.status === 'Hecho' ? '#94a3b8' : 'var(--p-text)' }}>{task.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'white', background: task.user === 'Mateo' ? '#4f46e5' : '#ec4899', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{task.user}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>• {task.freq}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>+20 pts</span>
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
