import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { FamilyEvent } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { todayKey, daysUntil } from '../utils/dates';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEK_DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const EVENT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6'];

const SCHOOL_COLORS: Record<string, string> = {
  'Examen': '#ef4444',
  'Pagar': '#f97316',
  'Llevar material': '#8b5cf6',
  'Evento': '#3b82f6',
  'Sin clases': '#6b7280',
  'Tarea': '#eab308',
  'Otro': '#14b8a6',
};

interface CalItem {
  id: string;
  kind: 'family' | 'school';
  title: string;
  date: string;
  time?: string;
  who: string[];
  color: string;
  detail?: string;
  source?: FamilyEvent;
}

const pad = (n: number) => String(n).padStart(2, '0');

const Calendar = () => {
  const { schoolTasks, familyEvents, members, addFamilyEvent, updateFamilyEvent, deleteFamilyEvent } = useData();
  const { viewMode, user } = useUser();
  const isKid = viewMode === 'child';

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string>(todayKey());

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FamilyEvent | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState('');
  const [who, setWho] = useState<string[]>(['Familia']);
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [notes, setNotes] = useState('');

  const today = todayKey();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelected(today); };

  const items: CalItem[] = [
    ...familyEvents.map(e => ({
      id: e.id, kind: 'family' as const, title: e.title, date: e.date, time: e.time,
      who: e.members, color: e.color || EVENT_COLORS[0], detail: e.notes, source: e,
    })),
    ...schoolTasks.filter(t => t.eventDate).map(t => ({
      id: t.id, kind: 'school' as const, title: `🎒 ${t.title}`, date: t.eventDate, time: t.eventTime,
      who: [t.child], color: SCHOOL_COLORS[t.category] || '#14b8a6', detail: t.category,
    })),
  ].filter(i => !isKid || i.who.includes('Familia') || i.who.includes(user?.name || ''));

  const itemsFor = (key: string) =>
    items.filter(i => i.date === key).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const avatarOf = (name: string) => name === 'Familia' ? '👨‍👩‍👧‍👦' : members.find(m => m.name === name)?.avatar || '👤';

  const openNew = (forDate?: string) => {
    setEditing(null); setTitle(''); setDate(forDate || selected || today); setTime('');
    setWho(['Familia']); setColor(EVENT_COLORS[0]); setNotes(''); setShowForm(true);
  };
  const openEdit = (e: FamilyEvent) => {
    setEditing(e); setTitle(e.title); setDate(e.date); setTime(e.time || '');
    setWho(e.members.length ? e.members : ['Familia']); setColor(e.color || EVENT_COLORS[0]);
    setNotes(e.notes || ''); setShowForm(true);
  };
  const toggleWho = (name: string) => {
    if (name === 'Familia') { setWho(['Familia']); return; }
    const base = who.filter(w => w !== 'Familia');
    const next = base.includes(name) ? base.filter(w => w !== name) : [...base, name];
    setWho(next.length ? next : ['Familia']);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title: title.trim(), date, time: time || undefined, members: who, color, notes: notes.trim() || undefined };
    if (editing) updateFamilyEvent(editing.id, data); else addFamilyEvent(data);
    setShowForm(false);
  };

  const selectedItems = itemsFor(selected);
  const upcoming = items
    .filter(i => i.date >= today)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    .slice(0, 8);
  const selDate = (() => { const [y, m, d] = selected.split('-').map(Number); return new Date(y, m - 1, d); })();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Calendario Familiar</h1>
          <p className="page-subtitle">Eventos de la familia y pendientes de la escuela</p>
        </div>
        {!isKid && (
          <button className="btn-primary" onClick={() => openNew()}><Plus size={15} /> Nuevo evento</button>
        )}
      </header>

      <div className="split-main">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
            <button onClick={prevMonth} className="btn-icon" aria-label="Mes anterior"><ChevronLeft size={18} /></button>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{MONTHS[month]} {year}</h2>
              <button onClick={goToday} style={{ background: 'none', border: 'none', color: 'var(--p-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Ir a hoy</button>
            </div>
            <button onClick={nextMonth} className="btn-icon" aria-label="Mes siguiente"><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.375rem' }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', color: 'var(--p-text-muted)', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const key = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayItems = itemsFor(key);
              const isToday = key === today;
              const isSel = key === selected;
              return (
                <div
                  key={idx}
                  className="cal-cell"
                  onClick={() => setSelected(key)}
                  onDoubleClick={() => !isKid && openNew(key)}
                  style={{
                    minHeight: '72px', padding: '0.3rem', borderRadius: '8px', cursor: 'pointer', minWidth: 0,
                    background: isSel ? 'var(--p-primary-50)' : 'var(--p-background)',
                    border: `2px solid ${isSel || isToday ? 'var(--p-primary)' : 'transparent'}`,
                  }}
                >
                  <div style={{ fontWeight: isToday ? 900 : 600, fontSize: '0.8rem', color: isToday ? 'var(--p-primary)' : 'var(--p-text)' }}>{day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    {dayItems.slice(0, 2).map(ev => (
                      <div key={ev.id} className="cal-chip" style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', borderRadius: '4px',
                        background: ev.color, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{ev.title}</div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="cal-chip" style={{ fontSize: '0.6rem', color: 'var(--p-text-muted)', fontWeight: 700 }}>+{dayItems.length - 2}</div>
                    )}
                    {dayItems.length > 0 && (
                      <div className="cal-dot" style={{ display: 'none', gap: '2px', flexWrap: 'wrap' }}>
                        {dayItems.slice(0, 4).map(ev => (
                          <span key={ev.id} style={{ width: '6px', height: '6px', borderRadius: '50%', background: ev.color }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={15} color="var(--p-primary)" />
                {selDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {!isKid && <button className="btn-icon" onClick={() => openNew(selected)} aria-label="Agregar evento este día"><Plus size={16} /></button>}
            </div>
            {selectedItems.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)' }}>Nada programado este día</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedItems.map(ev => (
                  <div key={ev.id} style={{ padding: '0.625rem 0.75rem', borderRadius: 'var(--radius)', borderLeft: `4px solid ${ev.color}`, background: 'var(--p-background)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ev.title}</span>
                      {ev.kind === 'family' && !isKid && ev.source && (
                        <span style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                          <button className="btn-icon" style={{ padding: '0.2rem' }} onClick={() => openEdit(ev.source!)} aria-label="Editar"><Edit2 size={13} /></button>
                          <button className="btn-icon" style={{ padding: '0.2rem', color: 'var(--danger)' }} onClick={() => deleteFamilyEvent(ev.id)} aria-label="Borrar"><Trash2 size={13} /></button>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
                      <span>{ev.who.map(avatarOf).join(' ')} {ev.who.join(', ')}</span>
                      {ev.time && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Clock size={11} /> {ev.time}</span>}
                      {ev.detail && <span>· {ev.detail}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '0.875rem' }}>Próximamente</h3>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)' }}>Sin eventos próximos</p>
            ) : upcoming.map(ev => {
              const d = daysUntil(ev.date);
              const [y, m, dd] = ev.date.split('-').map(Number);
              return (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ width: '4px', alignSelf: 'stretch', borderRadius: '999px', background: ev.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="truncate" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{ev.title}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>
                      {new Date(y, m - 1, dd).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}{ev.time ? ` · ${ev.time}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: d <= 2 ? 'var(--danger)' : 'var(--p-text-muted)' }}>
                    {d === 0 ? 'HOY' : d === 1 ? 'Mañana' : `${d}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>{editing ? 'Editar evento' : 'Nuevo evento'}</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Cumpleaños de la abuela" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">¿Quién?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {['Familia', ...members.map(m => m.name)].map(n => (
                    <button type="button" key={n} onClick={() => toggleWho(n)} className={`tab-btn${who.includes(n) ? ' active' : ''}`} style={{ border: '1px solid var(--border)' }}>
                      {avatarOf(n)} {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {EVENT_COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer',
                      border: color === c ? '3px solid var(--p-text)' : '3px solid transparent',
                    }} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Opcional" />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>{editing ? 'Guardar cambios' : 'Agregar evento'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
