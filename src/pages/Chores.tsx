import { useState } from 'react';
import { CheckCircle2, Circle, Plus, X, Trash2, Edit2, Users, Clock, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Chore } from '../context/DataContext';
import IconPicker from '../components/IconPicker';
import DayChips from '../components/DayChips';
import { iconFor, choreIcon } from '../utils/icons';
import { isChoreOn, isChoreDoneOn, isWeekly, choreDays, describeDays, addDays, dowOf, DAY_SHORT, habitStreak } from '../utils/habits';
import { todayKey } from '../utils/dates';

const FREQS = ['Diario', 'Lunes a Viernes', 'Fin de semana', 'Días específicos', 'Semanal'];

const Chores = () => {
  const { role, viewMode, user: currentUser } = useUser();
  const { chores, toggleChore, addChore, updateChore, deleteChore, members, routines, routineLogs, choreLogs, habitsSince } = useData();

  const isKid = viewMode === 'child';
  const today = todayKey();
  const [filterMember, setFilterMember] = useState<string>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario
  const kidNames = members.filter(m => m.role === 'child').map(m => m.name);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [assignedTo, setAssignedTo] = useState(kidNames[0] || 'Familia');
  const [freq, setFreq] = useState('Diario');
  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState('');
  const [points, setPoints] = useState(20);

  const allMembers = ['Familia', ...members.map(m => m.name)];
  const shownIcon = icon || iconFor(name, '✅');

  const reset = () => {
    setName(''); setIcon(''); setAssignedTo(kidNames[0] || 'Familia'); setFreq('Diario'); setDays([]); setTime(''); setPoints(20);
    setEditingId(null); setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: name.trim(), user: assignedTo, freq, points,
      icon: icon || undefined,
      days: freq === 'Días específicos' && days.length ? days : undefined,
      time: time || undefined,
    };
    if (editingId) updateChore(editingId, data);
    else addChore(data);
    reset();
  };

  const startEdit = (c: Chore) => {
    setEditingId(c.id); setName(c.name); setIcon(c.icon || ''); setAssignedTo(c.user);
    setFreq(c.days?.length ? 'Días específicos' : FREQS.includes(c.freq) ? c.freq : 'Diario');
    setDays(c.days || []); setTime(c.time || ''); setPoints(c.points); setShowForm(true);
  };

  const visible = (isKid
    ? chores.filter(c => c.user === currentUser?.name || c.user === 'Familia')
    : chores.filter(c => filterMember === 'Todos' || c.user === filterMember)
  ).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  const todayList = visible.filter(c => isChoreOn(c, today));
  const pending = todayList.filter(c => c.status === 'Pendiente');
  const done = todayList.filter(c => c.status === 'Hecho');
  const otherDays = visible.filter(c => !isChoreOn(c, today));

  const logs = { routines, chores, routineLogs, choreLogs };
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const scheduleText = (c: Chore) => (isWeekly(c.freq) ? 'Una vez por semana' : describeDays(choreDays(c)));

  const row = (c: Chore) => {
    const isDone = c.status === 'Hecho';
    const streak = !isWeekly(c.freq) && c.user !== 'Familia' ? habitStreak(c.user, 'chore', c.id, today, logs, habitsSince) : 0;
    return (
      <div key={c.id} className={`chore-row${isDone ? ' done' : ''}`}>
        <button className="chore-check" onClick={() => toggleChore(c.id, currentUser?.name)} aria-label={isDone ? 'Desmarcar' : 'Marcar como hecha'} aria-pressed={isDone}>
          {isDone ? <CheckCircle2 size={24} color="var(--success)" /> : <Circle size={24} color="var(--border)" strokeWidth={2} />}
        </button>
        <span className="chore-ico" aria-hidden>{choreIcon(c)}</span>
        <div className="chore-main">
          <p className="chore-name">{c.name}</p>
          <p className="chore-meta">
            <span className="badge badge-blue">{members.find(m => m.name === c.user)?.avatar} {c.user}</span>
            <span>{scheduleText(c)}</span>
            {c.time && <span><Clock size={11} style={{ verticalAlign: '-1px' }} /> {c.time}</span>}
            {streak >= 2 && <span className="chore-streak"><Flame size={11} style={{ verticalAlign: '-1px' }} /> {streak} días</span>}
          </p>
        </div>
        {!isWeekly(c.freq) && (
          <div className="chore-dots" aria-label="Últimos 7 días">
            {last7.map(k => {
              const on = isChoreOn(c, k);
              const ok = on && k >= habitsSince && isChoreDoneOn(c, k, choreLogs);
              const state = !on ? 'off' : ok ? 'ok' : k === today || k < habitsSince ? 'wait' : 'miss';
              return <i key={k} className={state} title={`${k}${!on ? ' · no tocaba' : ok ? ' · hecha' : ''}`}><small>{DAY_SHORT[dowOf(k)]}</small></i>;
            })}
          </div>
        )}
        <span className="chore-pts">+{c.points}</span>
        {role === 'parent' && (
          <div className="chore-actions">
            <button className="btn-icon" onClick={() => startEdit(c)} aria-label="Editar"><Edit2 size={14} /></button>
            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteChore(c.id)} aria-label="Borrar"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Tareas del hogar</h1>
          <p className="page-subtitle">Qué toca hoy, en qué días y cómo van los últimos 7 días</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Nueva tarea
          </button>
        )}
      </header>

      {!isKid && (
        <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
          {['Todos', ...members.map(m => m.name), 'Familia'].map(m => (
            <button key={m} className={`tab-btn${filterMember === m ? ' active' : ''}`} onClick={() => setFilterMember(m)}>{m}</button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={reset} aria-label="Cerrar"><X size={16} /></button>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {editingId ? 'Editar tarea' : 'Nueva tarea del hogar'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre y dibujito *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <IconPicker value={shownIcon} onChange={setIcon} />
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Dar de comer al perro" style={{ flex: 1 }} />
                </div>
                <span className="text-xs text-muted">El dibujito ayuda a los niños que todavía no leen. Se sugiere solo; tócalo para cambiarlo.</span>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Asignar a</label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                    {allMembers.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hora (opcional)</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">¿Cuándo toca?</label>
                <div className="seg seg-wrap" role="group">
                  {FREQS.map(f => (
                    <button key={f} type="button" className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>{f === 'Semanal' ? '1 vez por semana' : f}</button>
                  ))}
                </div>
                {freq === 'Días específicos' && <DayChips value={days} onChange={setDays} />}
                <span className="text-xs text-muted">
                  {freq === 'Semanal' ? 'Se puede hacer cualquier día; se reinicia cada lunes.' : 'Se reinicia cada día y solo aparece los días que toca.'}
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Puntos al completar</label>
                <input type="number" min="0" max="200" value={points} onChange={e => setPoints(Number(e.target.value))} />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }} disabled={freq === 'Días específicos' && days.length === 0}>
                {editingId ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </form>
          </div>
        </div>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h3 className="eyebrow" style={{ marginBottom: '0.75rem' }}>Toca hoy · {done.length}/{todayList.length} hechas</h3>
        <div className="chore-list">
          {todayList.length === 0 && <div className="card"><p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1rem' }}>Hoy no toca ninguna tarea</p></div>}
          {pending.map(row)}
          {done.map(row)}
        </div>
      </section>

      {otherDays.length > 0 && (
        <section>
          <h3 className="eyebrow" style={{ marginBottom: '0.75rem' }}>Otros días</h3>
          <div className="chore-list muted">{otherDays.map(row)}</div>
        </section>
      )}

      {visible.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <Users size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontWeight: 700 }}>Sin tareas asignadas</h3>
            <p>Agrega responsabilidades para cada miembro de la familia</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chores;
