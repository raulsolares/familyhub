import { useState } from 'react';
import { CheckCircle2, Circle, Plus, X, Trash2, Edit2, Users } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';

const Chores = () => {
  const { role, viewMode } = useUser();
  const { chores, toggleChore, addChore, updateChore, deleteChore, members } = useData();

  const isKid = viewMode === 'child';
  const currentUser = useUser().user;
  const [filterMember, setFilterMember] = useState<string>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('Alan');
  const [freq, setFreq] = useState('Diario');
  const [points, setPoints] = useState(20);

  const allMembers = ['Familia', ...members.map(m => m.name)];

  const reset = () => {
    setName(''); setAssignedTo('Alan'); setFreq('Diario'); setPoints(20);
    setEditingId(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateChore(editingId, { name, user: assignedTo, freq, points });
    } else {
      addChore({ name, user: assignedTo, freq, points });
    }
    reset();
  };

  const startEdit = (c: typeof chores[0]) => {
    setEditingId(c.id); setName(c.name); setAssignedTo(c.user);
    setFreq(c.freq); setPoints(c.points); setShowForm(true);
  };

  // Si es niño, solo ve sus tareas
  const visibleChores = isKid
    ? chores.filter(c => c.user === currentUser?.name || c.user === 'Familia')
    : chores.filter(c => filterMember === 'Todos' || c.user === filterMember);

  const pending = visibleChores.filter(c => c.status === 'Pendiente');
  const done    = visibleChores.filter(c => c.status === 'Hecho');

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Tareas del Hogar</h1>
          <p className="page-subtitle">Responsabilidades diarias y semanales de la familia</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Nueva Tarea
          </button>
        )}
      </header>

      {/* Filtro miembros (solo padres) */}
      {!isKid && (
        <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
          {['Todos', ...members.map(m => m.name), 'Familia'].map(m => (
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

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={reset}><X size={16} /></button>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {editingId ? 'Editar tarea' : 'Nueva tarea del hogar'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre de la tarea *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Lavar los trastes" />
              </div>
              <div className="form-group">
                <label className="form-label">Asignar a</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                  {allMembers.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Frecuencia</label>
                  <input value={freq} onChange={e => setFreq(e.target.value)} placeholder="Ej: Diario, Lunes, Mar/Jue" />
                </div>
                <div className="form-group">
                  <label className="form-label">Puntos al completar</label>
                  <input type="number" min="0" max="200" value={points} onChange={e => setPoints(Number(e.target.value))} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                {editingId ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pendientes */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pendientes ({pending.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pending.length === 0 && (
            <div className="card">
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1rem' }}>Todo al día ✓</p>
            </div>
          )}
          {pending.map(chore => (
            <div key={chore.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <button onClick={() => toggleChore(chore.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <Circle size={22} color="var(--border)" strokeWidth={2} />
              </button>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{chore.name}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                  <span className="badge badge-blue">{chore.user}</span>
                  <span className="text-xs text-muted">• {chore.freq}</span>
                </div>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--success)', flexShrink: 0 }}>+{chore.points} pts</span>
              {role === 'parent' && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-icon" onClick={() => startEdit(chore)}><Edit2 size={14} /></button>
                  <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteChore(chore.id)}><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completadas */}
      {done.length > 0 && (
        <div>
          <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--p-text-muted)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completadas hoy ({done.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {done.map(chore => (
              <div key={chore.id} style={{ padding: '0.875rem 1.25rem', background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.875rem', opacity: 0.65 }}>
                <button onClick={() => toggleChore(chore.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <CheckCircle2 size={22} color="var(--success)" />
                </button>
                <p style={{ fontWeight: '600', fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--p-text-muted)', flex: 1 }}>{chore.name}</p>
                <span className="badge badge-green">Hecho</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleChores.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <Users size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontWeight: '700' }}>Sin tareas asignadas</h3>
            <p>Agrega responsabilidades para cada miembro de la familia</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chores;
