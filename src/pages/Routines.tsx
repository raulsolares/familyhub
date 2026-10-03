import { useState } from 'react';
import { Clock, Plus, X, Trash2, Edit2, CheckCircle2, Circle, Image } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Routine } from '../context/DataContext';
import IconPicker from '../components/IconPicker';
import DayChips from '../components/DayChips';
import { iconFor, stepIcon } from '../utils/icons';
import { describeDays, isRoutineOn } from '../utils/habits';

const ICONS = ['🌅', '🪥', '🍳', '🎒', '📚', '🛁', '🌙', '🏃', '🧹', '🎨', '🎮', '🐾'];

const Routines = () => {
  const { role, viewMode } = useUser();
  const currentUser = useUser().user;
  const { routines, routineLogs, members, addRoutine, updateRoutine, deleteRoutine, toggleRoutineTask } = useData();

  const isKid = viewMode === 'child';
  const [filterMember, setFilterMember] = useState<string>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [time, setTime] = useState('07:00');
  const [member, setMemberField] = useState(members[0]?.name || '');
  const [icon, setIcon] = useState('🌅');
  const [imageUrl, setImageUrl] = useState('');
  const [taskInputs, setTaskInputs] = useState<string[]>(['']);
  /** Emoji elegido por paso ('' = automático según el texto) */
  const [taskIconInputs, setTaskIconInputs] = useState<string[]>(['']);
  const [days, setDays] = useState<number[]>([]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const isTaskDone = (routineId: string, idx: number) =>
    routineLogs.includes(`${todayStr}_${routineId}_${idx}`);

  const reset = () => {
    setName(''); setTime('07:00'); setMemberField(members[0]?.name || '');
    setIcon('🌅'); setImageUrl(''); setTaskInputs(['']); setTaskIconInputs(['']); setDays([]);
    setEditingId(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keep = taskInputs.map((t, i) => ({ t: t.trim(), ic: taskIconInputs[i] || '' })).filter(x => x.t !== '');
    const tasks = keep.map(x => x.t);
    const taskIcons = keep.map(x => x.ic || iconFor(x.t));
    const data = { name, time, member, icon, imageUrl: imageUrl.trim(), tasks, taskIcons, days: days.length && days.length < 7 ? days : [] };
    if (editingId) {
      updateRoutine(editingId, data);
    } else {
      addRoutine(data);
    }
    reset();
  };

  const startEdit = (r: Routine) => {
    setEditingId(r.id); setName(r.name); setTime(r.time);
    setMemberField(r.member); setIcon(r.icon); setImageUrl(r.imageUrl || '');
    setTaskInputs(r.tasks.length > 0 ? [...r.tasks, ''] : ['']);
    setTaskIconInputs(r.tasks.length > 0 ? [...r.tasks.map((_, i) => r.taskIcons?.[i] || ''), ''] : ['']);
    setDays(r.days || []);
    setShowForm(true);
  };

  const updateTask = (idx: number, val: string) => {
    const next = [...taskInputs];
    next[idx] = val;
    if (idx === next.length - 1 && val.trim() !== '') {
      next.push('');
      setTaskIconInputs(ics => [...ics, '']);
    }
    setTaskInputs(next);
  };

  const setTaskIcon = (idx: number, ic: string) =>
    setTaskIconInputs(ics => { const next = [...ics]; next[idx] = ic; return next; });

  const removeTask = (idx: number) => {
    const next = taskInputs.filter((_, i) => i !== idx);
    const nextIcons = taskIconInputs.filter((_, i) => i !== idx);
    if (next.length === 0) { next.push(''); nextIcons.push(''); }
    setTaskInputs(next);
    setTaskIconInputs(nextIcons);
  };

  const visibleRoutines = isKid
    ? routines.filter(r => r.member === currentUser?.name)
    : routines.filter(r => filterMember === 'Todos' || r.member === filterMember);

  const sorted = [...visibleRoutines].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Rutinas</h1>
          <p className="page-subtitle">Bloques de actividades diarias por miembro</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Nueva Rutina
          </button>
        )}
      </header>

      {/* Filtro (solo padres) */}
      {!isKid && (
        <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
          {['Todos', ...members.map(m => m.name)].map(m => (
            <button
              key={m}
              className={`tab-btn${filterMember === m ? ' active' : ''}`}
              onClick={() => setFilterMember(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <button className="modal-close" onClick={reset}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {editingId ? 'Editar rutina' : 'Nueva rutina'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Rutina de mañana" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Miembro</label>
                <select value={member} onChange={e => setMemberField(e.target.value)}>
                  {members.map(m => <option key={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Días (vacío = todos los días)</label>
                <DayChips value={days} onChange={setDays} />
              </div>

              {/* Selector de ícono */}
              <div className="form-group">
                <label className="form-label">Ícono</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      style={{
                        width: '40px', height: '40px', borderRadius: 'var(--radius)',
                        border: `2px solid ${icon === ic ? 'var(--p-primary)' : 'var(--border)'}`,
                        background: icon === ic ? 'var(--p-primary-50)' : 'var(--p-background)',
                        fontSize: '1.25rem', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Image size={13} /> URL de imagen (opcional)
                </label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>

              {/* Pasos */}
              <div className="form-group">
                <label className="form-label">Pasos con dibujito (toca el dibujito para cambiarlo)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {taskInputs.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      <span style={{ width: '20px', fontSize: '0.75rem', color: 'var(--p-text-muted)', textAlign: 'right', flexShrink: 0 }}>
                        {i + 1}.
                      </span>
                      <IconPicker value={taskIconInputs[i] || iconFor(t)} onChange={ic => setTaskIcon(i, ic)} />
                      <input
                        value={t}
                        onChange={e => updateTask(i, e.target.value)}
                        placeholder={`Paso ${i + 1}...`}
                        style={{ flex: 1 }}
                      />
                      {taskInputs.length > 1 && (
                        <button type="button" className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => removeTask(i)}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                {editingId ? 'Guardar cambios' : 'Crear rutina'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de rutinas */}
      {sorted.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Clock size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontWeight: '700' }}>Sin rutinas</h3>
            <p>{role === 'parent' ? 'Crea rutinas para organizar el día familiar' : 'No tienes rutinas asignadas aún'}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sorted.map(routine => {
          const doneTasks = routine.tasks.filter((_, i) => isTaskDone(routine.id, i)).length;
          const total = routine.tasks.length;
          const progress = total > 0 ? (doneTasks / total) * 100 : 0;
          const allDone = total > 0 && doneTasks === total;

          return (
            <div
              key={routine.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                borderLeft: `4px solid ${allDone ? 'var(--success)' : 'var(--p-primary)'}`,
              }}
            >
              {/* Imagen opcional */}
              {routine.imageUrl && (
                <img
                  src={routine.imageUrl}
                  alt={routine.name}
                  style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                />
              )}

              {/* Header de la rutina */}
              <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius)',
                  background: allDone ? '#f0fdf4' : 'var(--p-primary-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.375rem', flexShrink: 0,
                }}>
                  {routine.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{routine.name}</h4>
                    {allDone && <span className="badge badge-green">Completada</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={11} /> {routine.time}
                    </span>
                    <span className="badge badge-blue">{routine.member}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>{describeDays(routine.days)}</span>
                    {!isRoutineOn(routine, todayStr) && total > 0 && <span className="badge">Hoy no toca</span>}
                  </div>
                </div>
                {role === 'parent' && (
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button className="btn-icon" onClick={() => startEdit(routine)}><Edit2 size={14} /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteRoutine(routine.id)}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>

              {/* Barra de progreso */}
              {total > 0 && (
                <div style={{ padding: '0 1.25rem 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>Progreso</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: allDone ? 'var(--success)' : 'var(--p-text-muted)' }}>
                      {doneTasks}/{total}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: allDone ? 'var(--success)' : 'var(--p-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Lista de pasos */}
              {total > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.625rem 1.25rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {routine.tasks.map((task, idx) => {
                      const done = isTaskDone(routine.id, idx);
                      return (
                        <div
                          key={idx}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
                          onClick={() => toggleRoutineTask(routine.id, idx, routine.member)}
                        >
                          {done
                            ? <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                            : <Circle size={18} color="var(--border)" strokeWidth={2} style={{ flexShrink: 0 }} />
                          }
                          <span aria-hidden style={{ fontSize: '1.25rem', width: '1.75rem', textAlign: 'center', flexShrink: 0 }}>{stepIcon(routine, idx)}</span>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: done ? '400' : '500',
                            color: done ? 'var(--p-text-muted)' : 'var(--p-text)',
                            textDecoration: done ? 'line-through' : 'none',
                            flex: 1,
                          }}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Routines;
