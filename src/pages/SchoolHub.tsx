import { useState } from 'react';
import { Backpack, BookOpen, PartyPopper, Clock, Calendar, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { SchoolTask } from '../context/DataContext';

const SchoolHub = () => {
  const { role } = useUser();
  const { schoolTasks, addSchoolTask, updateSchoolTask, deleteSchoolTask, toggleSchoolTask } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<SchoolTask | null>(null);

  // Form states
  const [child, setChild] = useState('Mateo');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'material' | 'academic' | 'social'>('material');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = { child, title, desc, date, type };

    if (editingTask) {
      updateSchoolTask(editingTask.id, taskData);
    } else {
      addSchoolTask(taskData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setChild('Mateo');
    setTitle('');
    setDesc('');
    setDate('');
    setType('material');
    setEditingTask(null);
    setShowForm(false);
  };

  const handleEdit = (task: SchoolTask) => {
    setEditingTask(task);
    setChild(task.child);
    setTitle(task.title);
    setDesc(task.desc);
    setDate(task.date);
    setType(task.type);
    setShowForm(true);
  };

  const pendingTasks = schoolTasks.filter(t => !t.completed && t.type !== 'social');
  const socialEvents = schoolTasks.filter(t => t.type === 'social');

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Módulo Escolar</h1>
          <p className="page-subtitle">Tareas, materiales y eventos académicos con fechas reales</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Agregar Pendiente</button>
        )}
      </header>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={resetForm} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Editar Pendiente' : 'Nuevo Pendiente'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Niño</label>
                <select value={child} onChange={(e) => setChild(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option>Mateo</option>
                  <option>Sofía</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Título</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Descripción</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '60px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Fecha del Evento</label>
                  <input 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    type="date" 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Tipo</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="material">Material (Mochila)</option>
                    <option value="academic">Tarea/Examen</option>
                    <option value="social">Evento/Convivio</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                {editingTask ? 'Guardar Cambios' : 'Crear Pendiente'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title"><Clock size={20} color="var(--p-primary)" /> Próximos Pendientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {pendingTasks.map(item => (
              <div key={item.id} style={{ 
                padding: '1.25rem', 
                background: '#f8fafc', 
                borderRadius: '16px', 
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                  <div 
                    onClick={() => toggleSchoolTask(item.id)}
                    style={{ 
                      marginTop: '0.2rem',
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      border: '2px solid #cbd5e1',
                      cursor: 'pointer'
                    }} 
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '999px', 
                        fontSize: '0.7rem', 
                        fontWeight: '700',
                        background: item.child === 'Mateo' ? '#eef2ff' : '#fff1f2',
                        color: item.child === 'Mateo' ? '#4f46e5' : '#f43f5e'
                      }}>
                        {item.child}
                      </span>
                      <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{item.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.75rem' }}>
                      {item.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', fontWeight: '600' }}>
                        <Calendar size={14} /> Fecha: {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--p-text-muted)' }}>
                        {item.type === 'material' ? <Backpack size={14}/> : <BookOpen size={14}/>} 
                        {item.type === 'material' ? 'Material' : 'Académico'}
                      </span>
                    </div>
                  </div>
                </div>
                {role === 'parent' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--p-text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Editar</button>
                    <button onClick={() => deleteSchoolTask(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Borrar</button>
                  </div>
                )}
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--p-text-muted)' }}>No hay pendientes académicos en este momento.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><PartyPopper size={20} color="#f59e0b" /> Eventos Sociales</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {socialEvents.map(item => (
              <div key={item.id} style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '12px', position: 'relative' }}>
                {role === 'parent' && (
                  <button onClick={() => deleteSchoolTask(item.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#b45309' }}><X size={16} /></button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: '700', color: '#92400e' }}>{item.title}</span>
                  <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: '800' }}>{item.child}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#b45309' }}>{new Date(item.date).toLocaleDateString()}</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <strong>Detalles:</strong> {item.desc}
                </p>
              </div>
            ))}
            {socialEvents.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--p-text-muted)', fontSize: '0.85rem' }}>Sin eventos sociales próximos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolHub;
