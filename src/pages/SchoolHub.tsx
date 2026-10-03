import { useState } from 'react';
import { Clock, Calendar, X, Plus, Tag, CheckCircle2, Circle, Edit2, Trash2, Settings2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { SchoolTask } from '../context/DataContext';
import { daysUntil } from '../utils/dates';

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Llevar material': { bg: '#eff6ff', text: '#1d4ed8' },
  'Pagar':           { bg: '#fff7ed', text: '#c2410c' },
  'Examen':          { bg: '#fdf2f8', text: '#9d174d' },
  'Evento':          { bg: '#f0fdf4', text: '#166534' },
  'Sin clases':      { bg: '#fef9c3', text: '#713f12' },
  'Tarea':           { bg: '#f5f3ff', text: '#6d28d9' },
  'Otro':            { bg: '#f1f5f9', text: '#475569' },
};

const getCategoryStyle = (cat: string) =>
  categoryColors[cat] || { bg: '#f1f5f9', text: '#475569' };

const getDaysLeft = (dateStr: string) => daysUntil(dateStr);

const SchoolHub = () => {
  const { role, viewMode, user } = useUser();
  const isKid = viewMode === 'child';
  const {
    schoolTasks, addSchoolTask, updateSchoolTask, deleteSchoolTask,
    toggleSchoolTask, members, schoolCategories, updateSchoolCategories,
  } = useData();

  const children = members.filter(m => m.role === 'child');
  const defaultChild = children[0]?.name || '';

  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTask, setEditingTask] = useState<SchoolTask | null>(null);
  const [filterChild, setFilterChild] = useState<string>('Todos');
  const [filterCat, setFilterCat] = useState<string>('Todas');
  const [newCatInput, setNewCatInput] = useState('');

  // Form fields
  const [child, setChild] = useState(defaultChild);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState(schoolCategories[0] || 'Otro');

  const fmtDate = (d: string) => d ? new Date(d + 'T12:00').toLocaleDateString('es-MX') : '—';

  const reset = () => {
    setChild(defaultChild); setTitle(''); setDesc('');
    setEventDate(''); setEventTime(''); setDeadline('');
    setCategory(schoolCategories[0] || 'Otro');
    setEditingTask(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = { title, desc, eventDate, eventTime: eventTime || undefined, deadline: deadline || eventDate, category };
    if (editingTask) {
      updateSchoolTask(editingTask.id, { ...base, child });
    } else if (child === '__todos__') {
      children.forEach(c => addSchoolTask({ ...base, child: c.name }));
    } else {
      addSchoolTask({ ...base, child });
    }
    reset();
  };

  const handleEdit = (task: SchoolTask) => {
    setEditingTask(task);
    setChild(task.child); setTitle(task.title); setDesc(task.desc);
    setEventDate(task.eventDate || ''); setEventTime(task.eventTime || '');
    setDeadline(task.deadline || '');
    setCategory(task.category || schoolCategories[0]);
    setShowForm(true);
  };

  const pendingTasks = schoolTasks
    .filter(t => !t.completed)
    .filter(t => (isKid ? t.child === user?.name : filterChild === 'Todos' || t.child === filterChild))
    .filter(t => filterCat === 'Todas' || t.category === filterCat)
    .map(t => ({ ...t, daysLeft: getDaysLeft(t.deadline || t.eventDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const doneTasks = schoolTasks.filter(t => t.completed && (!isKid || t.child === user?.name));

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Módulo Escolar</h1>
          <p className="page-subtitle">Pendientes, materiales y eventos académicos</p>
        </div>
        {role === 'parent' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setShowCategoryManager(true)}>
              <Settings2 size={15} /> Categorías
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Agregar
            </button>
          </div>
        )}
      </header>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {!isKid && <div className="tab-list">
          {['Todos', ...children.map(c => c.name)].map(name => (
            <button
              key={name}
              className={`tab-btn${filterChild === name ? ' active' : ''}`}
              onClick={() => setFilterChild(name)}
            >
              {name}
            </button>
          ))}
        </div>}
        <div className="tab-list">
          {['Todas', ...schoolCategories].map(cat => (
            <button
              key={cat}
              className={`tab-btn${filterCat === cat ? ' active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modal: formulario */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={reset}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {editingTask ? 'Editar pendiente' : 'Nuevo pendiente escolar'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Niño/a</label>
                <select value={child} onChange={e => setChild(e.target.value)} disabled={!!editingTask}>
                  {!editingTask && <option value="__todos__">Ambos niños</option>}
                  {children.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {schoolCategories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Traer carpeta roja" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción / Detalles</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalles adicionales..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fecha del evento *</label>
                  <input required type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora {category === 'Evento' ? '*' : '(opcional)'}</label>
                  <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha límite de entrega</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', marginTop: '0.25rem' }}>
                  Si vacío, igual a fecha del evento
                </p>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                {editingTask ? 'Guardar cambios' : 'Crear pendiente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: categorías */}
      {showCategoryManager && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowCategoryManager(false)}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              <Tag size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Gestionar Categorías
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {schoolCategories.map(cat => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ ...getCategoryStyle(cat), background: 'none', fontWeight: '600', fontSize: '0.875rem', color: getCategoryStyle(cat).text }}>
                    {cat}
                  </span>
                  <button
                    className="btn-icon"
                    onClick={() => updateSchoolCategories(schoolCategories.filter(c => c !== cat))}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                placeholder="Nueva categoría..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCatInput.trim()) {
                    updateSchoolCategories([...schoolCategories, newCatInput.trim()]);
                    setNewCatInput('');
                  }
                }}
              />
              <button
                className="btn-primary"
                onClick={() => { if (newCatInput.trim()) { updateSchoolCategories([...schoolCategories, newCatInput.trim()]); setNewCatInput(''); }}}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de pendientes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {pendingTasks.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontWeight: '700' }}>Sin pendientes</h3>
              <p>¡Excelente! No hay pendientes escolares en este momento.</p>
            </div>
          </div>
        )}

        {pendingTasks.map(task => {
          const catStyle = getCategoryStyle(task.category);
          const isUrgent = task.daysLeft <= 2;
          return (
            <div key={task.id} className="card" style={{ borderLeft: `3px solid ${isUrgent ? 'var(--danger)' : 'transparent'}`, padding: '1.125rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <button
                  onClick={() => toggleSchoolTask(task.id, isKid)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.125rem', flexShrink: 0 }}
                >
                  <Circle size={22} color="var(--border)" strokeWidth={2} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                    <span className="badge" style={{ background: catStyle.bg, color: catStyle.text }}>{task.category}</span>
                    <span className="badge badge-blue">{task.child}</span>
                    {isUrgent && <span className="badge badge-red">URGENTE</span>}
                  </div>
                  <h4 style={{ fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{task.title}</h4>
                  {task.desc && <p style={{ fontSize: '0.8125rem', color: 'var(--p-text-muted)', marginBottom: '0.5rem' }}>{task.desc}</p>}
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> {fmtDate(task.eventDate)}
                      {task.eventTime && <span style={{ fontWeight: '700', color: 'var(--p-primary)' }}>· {task.eventTime}</span>}
                    </span>
                    {task.deadline && task.deadline !== task.eventDate && (
                      <span style={{ fontSize: '0.75rem', color: isUrgent ? 'var(--danger)' : 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: isUrgent ? '700' : '400' }}>
                        <Clock size={13} /> Límite: {fmtDate(task.deadline)}
                        {task.daysLeft >= 0 && ` (${task.daysLeft === 0 ? 'hoy' : `${task.daysLeft}d`})`}
                      </span>
                    )}
                  </div>
                </div>
                {role === 'parent' && (
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button className="btn-icon" onClick={() => handleEdit(task)}><Edit2 size={14} /></button>
                    <button className="btn-icon" onClick={() => deleteSchoolTask(task.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completados */}
      {doneTasks.length > 0 && (
        <div>
          <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completados ({doneTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {doneTasks.map(task => (
              <div key={task.id} style={{ padding: '0.875rem 1.125rem', background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: 0.6 }}>
                <button onClick={() => toggleSchoolTask(task.id, isKid)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <CheckCircle2 size={22} color="var(--success)" />
                </button>
                <div>
                  <span className="badge" style={{ marginBottom: '0.25rem', ...getCategoryStyle(task.category) }}>{task.category}</span>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--p-text-muted)' }}>{task.title}</p>
                </div>
                <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>{task.child}</span>
                {role === 'parent' && (
                  <button className="btn-icon" onClick={() => deleteSchoolTask(task.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolHub;
