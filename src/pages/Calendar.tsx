import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Link2, Trash2, Edit2, Repeat, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { FamilyEvent, CalendarFeed } from '../context/DataContext';
import { useUser } from '../context/UserContext';
import { useCalendarFeeds } from '../hooks/useCalendarFeeds';
import { buildAgenda, isFor } from '../utils/agenda';
import type { AgendaItem } from '../utils/agenda';
import { todayKey, daysUntil } from '../utils/dates';
import EventSheet from '../components/EventSheet';
import EventForm from '../components/EventForm';
import SyncBadge from '../components/SyncBadge';
import FeedForm from '../components/FeedForm';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const pad = (n: number) => String(n).padStart(2, '0');

const ago = (ts?: number) => {
  if (!ts) return 'cargando…';
  const min = Math.round((Date.now() - ts) / 60000);
  return min < 1 ? 'actualizado ahora' : min < 60 ? `actualizado hace ${min} min` : `actualizado hace ${Math.round(min / 60)} h`;
};

const Calendar = () => {
  const { schoolTasks, familyEvents, members, deleteFamilyEvent, deleteCalendarFeed } = useData();
  const { viewMode, user } = useUser();
  const { feeds, refresh } = useCalendarFeeds();
  const isKid = viewMode === 'child';

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const today = todayKey();
  const [selected, setSelected] = useState<string>(today);
  const [viewing, setViewing] = useState<AgendaItem | null>(null);
  const [form, setForm] = useState<{ editing: FamilyEvent | null; date: string } | null>(null);
  const [feedForm, setFeedForm] = useState<{ editing: CalendarFeed | null } | null>(null);
  const [whoFilter, setWhoFilter] = useState<string>('Todos');

  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthFrom = `${year}-${pad(month + 1)}-01`;
  const monthTo = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelected(today); };

  // Rango amplio: el mes visible + próximos 60 días + el día seleccionado
  const end60 = (() => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toLocaleDateString('en-CA'); })();
  const from = [monthFrom, today, selected].sort()[0];
  const to = [monthTo, end60, selected].sort().reverse()[0];
  const who = isKid ? (user?.name || '') : whoFilter;
  const items = buildAgenda({ familyEvents, schoolTasks, feeds }, from, to)
    .filter(i => who === 'Todos' || isFor(i, who));

  const itemsFor = (key: string) => items.filter(i => i.date === key);

  const cells: (number | null)[] = [...Array(firstOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const avatarOf = (name: string) => (name === 'Familia' ? '👨‍👩‍👧‍👦' : members.find(m => m.name === name)?.avatar || '👤');
  const selectedItems = itemsFor(selected);
  const upcoming = items.filter(i => i.date >= today).slice(0, 8);
  const selDate = (() => { const [y, m, d] = selected.split('-').map(Number); return new Date(y, m - 1, d); })();

  const openItem = (i: AgendaItem) => setViewing(i);
  const canEdit = (i: AgendaItem) => !isKid && i.kind === 'family' && !!i.event;

  const row = (ev: AgendaItem, showDate = false) => {
    const d = daysUntil(ev.date);
    const [y, m, dd] = ev.date.split('-').map(Number);
    return (
      <button key={ev.key} className="agenda-row" onClick={() => openItem(ev)}>
        <span className="agenda-row-bar" style={{ background: ev.color }} />
        <span className="agenda-row-main">
          <span className="agenda-row-title">
            {ev.title}
            {ev.repeatText && <Repeat size={11} aria-label="Se repite" />}
            {ev.kind === 'feed' && <Link2 size={11} aria-label="Calendario suscrito" />}
          </span>
          <span className="agenda-row-meta">
            {showDate && `${new Date(y, m - 1, dd).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} · `}
            {ev.time ? `${ev.time}${ev.endTime ? `–${ev.endTime}` : ''}` : 'Todo el día'}
            {' · '}{ev.who.map(avatarOf).join('')}
            {ev.assignments?.length ? ` · ${ev.assignments.length} responsable${ev.assignments.length > 1 ? 's' : ''}` : ''}
          </span>
        </span>
        {showDate && <span className={`agenda-row-when${d <= 1 ? ' soon' : ''}`}>{d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `${d} d`}</span>}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-subtitle">Eventos de la familia, escuela y calendarios suscritos</p>
        </div>
        {!isKid && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setFeedForm({ editing: null })}><Link2 size={14} /> Suscribir Google Calendar</button>
            <button className="btn-primary" onClick={() => setForm({ editing: null, date: selected })}><Plus size={15} /> Nuevo evento</button>
          </div>
        )}
      </header>

      {!isKid && <div style={{ marginBottom: '0.75rem' }}><SyncBadge /></div>}

      {!isKid && (
        <div className="member-tabs" style={{ marginBottom: '1rem' }}>
          {['Todos', 'Familia', ...members.map(m => m.name)].map(n => (
            <button key={n} className={`member-tab${whoFilter === n ? ' on' : ''}`} onClick={() => setWhoFilter(n)}>
              {n === 'Todos' ? '🗓️' : avatarOf(n)} {n}
            </button>
          ))}
        </div>
      )}

      <div className="split-main">
        <div className="panel cal-panel">
          <div className="cal-head">
            <button onClick={prevMonth} className="btn-icon" aria-label="Mes anterior"><ChevronLeft size={18} /></button>
            <div style={{ textAlign: 'center' }}>
              <h2 className="cal-month">{MONTHS[month]} {year}</h2>
              <button onClick={goToday} className="cal-today">Ir a hoy</button>
            </div>
            <button onClick={nextMonth} className="btn-icon" aria-label="Mes siguiente"><ChevronRight size={18} /></button>
          </div>

          <div className="cal-grid cal-weekdays">
            {WEEK_DAYS.map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const key = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayItems = itemsFor(key);
              return (
                <div key={idx} className={`cal-day${key === today ? ' today' : ''}${key === selected ? ' sel' : ''}`}
                  onClick={() => setSelected(key)} onDoubleClick={() => !isKid && setForm({ editing: null, date: key })}>
                  <span className="cal-num">{day}</span>
                  <div className="cal-chips">
                    {dayItems.slice(0, 3).map(ev => (
                      <button key={ev.key} className="cal-chip2" style={{ background: ev.color }} title={ev.title}
                        onClick={e => { e.stopPropagation(); setSelected(key); openItem(ev); }}>
                        {ev.time && <b>{ev.time}</b>} {ev.title}
                      </button>
                    ))}
                    {dayItems.length > 3 && <span className="cal-more">+{dayItems.length - 3}</span>}
                  </div>
                  {dayItems.length > 0 && (
                    <div className="cal-dots">{dayItems.slice(0, 4).map(ev => <i key={ev.key} style={{ background: ev.color }} />)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section className="panel">
            <div className="panel-head">
              <h3 style={{ textTransform: 'capitalize' }}>{selDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              {!isKid && <button className="btn-icon" onClick={() => setForm({ editing: null, date: selected })} aria-label="Agregar evento este día"><Plus size={16} /></button>}
            </div>
            <div className="panel-body agenda-list">
              {selectedItems.length === 0
                ? <p className="text-sm text-muted">Nada programado este día</p>
                : selectedItems.map(ev => row(ev))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head"><h3>Próximamente</h3></div>
            <div className="panel-body agenda-list">
              {upcoming.length === 0
                ? <p className="text-sm text-muted">Sin eventos próximos</p>
                : upcoming.map(ev => row(ev, true))}
            </div>
          </section>

          {!isKid && (
            <section className="panel">
              <div className="panel-head">
                <h3>Calendarios suscritos</h3>
                <button className="btn-icon" onClick={() => setFeedForm({ editing: null })} aria-label="Suscribir calendario"><Plus size={16} /></button>
              </div>
              <div className="panel-body">
                {feeds.length === 0 ? (
                  <p className="text-sm text-muted">Conecta el calendario de Google de la escuela, del fútbol o del trabajo para verlo aquí. Se actualiza solo.</p>
                ) : (
                  <ul className="device-list">
                    {feeds.map(({ feed, events, fetchedAt, error, loading }) => (
                      <li key={feed.id}>
                        <i className="feed-dot" style={{ background: feed.color }} />
                        <span>
                          <b>{feed.name}</b><br />
                          <small style={error ? { color: 'var(--danger)' } : undefined}>
                            {error ? <><AlertTriangle size={11} style={{ verticalAlign: '-1px' }} /> {error}</> : loading ? 'actualizando…' : `${events.length} eventos · ${ago(fetchedAt)}`}
                          </small>
                        </span>
                        <button className="btn-icon" onClick={() => refresh(feed.id)} aria-label={`Actualizar ${feed.name}`}><RefreshCw size={14} /></button>
                        <button className="btn-icon" onClick={() => setFeedForm({ editing: feed })} aria-label={`Editar ${feed.name}`}><Edit2 size={14} /></button>
                        <button className="btn-icon" onClick={() => deleteCalendarFeed(feed.id)} aria-label={`Quitar ${feed.name}`}><Trash2 size={14} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {viewing && (
        <EventSheet
          item={viewing}
          onClose={() => setViewing(null)}
          onEdit={canEdit(viewing) ? () => { setForm({ editing: viewing.event!, date: viewing.event!.date }); setViewing(null); } : undefined}
          onDelete={canEdit(viewing) ? () => { deleteFamilyEvent(viewing.event!.id); setViewing(null); } : undefined}
        />
      )}
      {form && <EventForm editing={form.editing} defaultDate={form.date} onClose={() => setForm(null)} />}
      {feedForm && <FeedForm editing={feedForm.editing} onClose={() => setFeedForm(null)} />}
    </div>
  );
};

export default Calendar;
