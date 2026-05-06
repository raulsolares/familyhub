import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, GraduationCap, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEK_DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const CATEGORY_COLORS: Record<string, string> = {
  'Examen': '#ef4444',
  'Pagar': '#f97316',
  'Llevar material': '#8b5cf6',
  'Evento': '#3b82f6',
  'Sin clases': '#6b7280',
  'Tarea': '#eab308',
  'Otro': '#14b8a6',
};

const Calendar = () => {
  const { schoolTasks, members } = useData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return schoolTasks.filter(t => t.eventDate === dateStr || t.deadline === dateStr);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getMemberAvatar = (name: string) => members.find(m => m.name === name)?.avatar || '👤';

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Calendario Familiar</h1>
        <p className="page-subtitle">Eventos y fechas importantes del hogar</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Calendario */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Navegación mes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={prevMonth} style={{ background: 'var(--p-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            <h2 style={{ fontWeight: '800', fontSize: '1.25rem' }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} style={{ background: 'var(--p-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
            {WEEK_DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.7rem', color: 'var(--p-text-muted)', padding: '0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />;
              const dayStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const events = getEventsForDay(day);
              const isToday = dayStr === todayKey;
              const isSelected = selectedDay === day;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  style={{
                    minHeight: '64px',
                    padding: '0.375rem',
                    borderRadius: '8px',
                    cursor: events.length > 0 || isToday ? 'pointer' : 'default',
                    background: isSelected ? 'var(--p-primary)' : isToday ? 'var(--p-primary-50)' : 'transparent',
                    border: isSelected ? '2px solid var(--p-primary)' : isToday ? '2px solid var(--p-primary)' : '1px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <div style={{
                    fontWeight: isToday || isSelected ? '800' : '600',
                    fontSize: '0.875rem',
                    color: isSelected ? 'white' : isToday ? 'var(--p-primary)' : 'var(--p-text)',
                    marginBottom: '0.25rem',
                  }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {events.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: '700',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          background: isSelected ? 'rgba(255,255,255,0.25)' : (CATEGORY_COLORS[ev.category] || '#14b8a6'),
                          color: isSelected ? 'white' : 'white',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div style={{ fontSize: '0.6rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--p-text-muted)', fontWeight: '700' }}>+{events.length - 2} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Eventos del día seleccionado */}
          {selectedDay && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={15} color="var(--p-primary)" />
                {selectedDay} de {MONTHS[month]}
              </h3>
              {selectedEvents.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', padding: '0.5rem 0' }}>Sin eventos este día</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {selectedEvents.map(ev => (
                    <div key={ev.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: `2px solid ${CATEGORY_COLORS[ev.category] || '#14b8a6'}`, background: 'var(--p-background)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{ev.title}</span>
                        <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>{getMemberAvatar(ev.child)}</span>
                      </div>
                      {ev.desc && <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', marginBottom: '0.375rem' }}>{ev.desc}</p>}
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '999px', background: CATEGORY_COLORS[ev.category] || '#14b8a6', color: 'white' }}>{ev.category}</span>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{ev.child}</span>
                        {ev.eventTime && (
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--p-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={9} /> {ev.eventTime}
                          </span>
                        )}
                        {ev.deadline && ev.deadline !== ev.eventDate && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={9} /> entrega: {new Date(ev.deadline + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Próximos eventos */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={15} color="var(--p-primary)" /> Próximos eventos
            </h3>
            {(() => {
              const upcoming = schoolTasks
                .filter(t => !t.completed && t.eventDate >= todayKey)
                .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                .slice(0, 6);
              if (upcoming.length === 0) return (
                <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)' }}>Sin eventos próximos</p>
              );
              return upcoming.map(ev => {
                const evDate = new Date(ev.eventDate + 'T12:00');
                const daysLeft = Math.ceil((evDate.getTime() - now.setHours(0,0,0,0)) / 86400000);
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '4px', borderRadius: '999px', alignSelf: 'stretch', background: CATEGORY_COLORS[ev.category] || '#14b8a6', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>{getMemberAvatar(ev.child)} {ev.child} · {evDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: daysLeft <= 2 ? 'var(--danger)' : daysLeft <= 5 ? 'var(--warning)' : 'var(--p-text-muted)', flexShrink: 0 }}>
                      {daysLeft === 0 ? 'HOY' : daysLeft < 0 ? 'Venc.' : `${daysLeft}d`}
                    </span>
                  </div>
                );
              });
            })()}
          </div>

          {/* Leyenda */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>Categorías</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{cat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Calendar;
