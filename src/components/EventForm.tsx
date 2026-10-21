import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { FamilyEvent, EventRepeat, EventAssignment } from '../context/DataContext';
import { EVENT_COLORS } from '../utils/agenda';
import { describeRepeat } from '../utils/events';

const WEEKDAYS = [{ d: 1, l: 'L' }, { d: 2, l: 'M' }, { d: 3, l: 'M' }, { d: 4, l: 'J' }, { d: 5, l: 'V' }, { d: 6, l: 'S' }, { d: 0, l: 'D' }];
const FREQS: { v: EventRepeat['freq'] | 'none'; l: string }[] = [
  { v: 'none', l: 'No se repite' }, { v: 'daily', l: 'Diario' }, { v: 'weekly', l: 'Semanal' }, { v: 'monthly', l: 'Mensual' }, { v: 'yearly', l: 'Anual' },
];

interface Props {
  editing: FamilyEvent | null;
  defaultDate: string;
  onClose: () => void;
}

const dayOf = (key: string) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d).getDay(); };

const EventForm = ({ editing, defaultDate, onClose }: Props) => {
  const { members, addFamilyEvent, updateFamilyEvent } = useData();
  const [title, setTitle] = useState(editing?.title || '');
  const [date, setDate] = useState(editing?.date || defaultDate);
  const [time, setTime] = useState(editing?.time || '');
  const [endTime, setEndTime] = useState(editing?.endTime || '');
  const [location, setLocation] = useState(editing?.location || '');
  const [who, setWho] = useState<string[]>(editing?.members.length ? editing.members : ['Familia']);
  const [color, setColor] = useState(editing?.color || EVENT_COLORS[0]);
  const [notes, setNotes] = useState(editing?.notes || '');
  const [freq, setFreq] = useState<EventRepeat['freq'] | 'none'>(editing?.repeat?.freq || 'none');
  const [every, setEvery] = useState(editing?.repeat?.interval || 1);
  const [weekdays, setWeekdays] = useState<number[]>(editing?.repeat?.weekdays || []);
  const [until, setUntil] = useState(editing?.repeat?.until || '');
  const [assignments, setAssignments] = useState<EventAssignment[]>(editing?.assignments || []);

  const avatar = (n: string) => (n === 'Familia' ? '👨‍👩‍👧‍👦' : members.find(m => m.name === n)?.avatar || '👤');

  const toggleWho = (name: string) => {
    if (name === 'Familia') { setWho(['Familia']); return; }
    const base = who.filter(w => w !== 'Familia');
    const next = base.includes(name) ? base.filter(w => w !== name) : [...base, name];
    setWho(next.length ? next : ['Familia']);
  };

  const effectiveDays = weekdays.length ? weekdays : [dayOf(date)];
  const toggleDay = (d: number) => {
    const next = effectiveDays.includes(d) ? effectiveDays.filter(x => x !== d) : [...effectiveDays, d];
    setWeekdays(next.length ? next : [dayOf(date)]);
  };

  const repeat: EventRepeat | undefined = freq === 'none' ? undefined : {
    freq,
    interval: every > 1 ? every : undefined,
    weekdays: freq === 'weekly' && !(weekdays.length === 1 && weekdays[0] === dayOf(date)) && weekdays.length ? weekdays : undefined,
    until: until || undefined,
  };

  const setAssign = (i: number, changes: Partial<EventAssignment>) =>
    setAssignments(list => list.map((a, k) => (k === i ? { ...a, ...changes } : a)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data: Omit<FamilyEvent, 'id'> = {
      title: title.trim(), date, time: time || undefined, endTime: time && endTime ? endTime : undefined,
      location: location.trim() || undefined, members: who, color, notes: notes.trim() || undefined,
      repeat, assignments: assignments.filter(a => a.task.trim()).map(a => ({ member: a.member, task: a.task.trim() })),
    };
    if (editing) updateFamilyEvent(editing.id, data); else addFamilyEvent(data);
    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form className="sheet" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="sheet-head">
          <h2 className="sheet-title">{editing ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="sheet-body event-form">
          <label className="ef-field">
            <span>Título</span>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Cumpleaños de la abuela" />
          </label>
          <div className="ef-row">
            <label className="ef-field"><span>Fecha</span><input required type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
            <label className="ef-field"><span>Hora</span><input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
            <label className="ef-field"><span>Termina</span><input type="time" value={endTime} disabled={!time} onChange={e => setEndTime(e.target.value)} /></label>
          </div>

          <div className="ef-field">
            <span>Se repite</span>
            <div className="seg" style={{ flexWrap: 'wrap' }}>
              {FREQS.map(f => <button type="button" key={f.v} className={freq === f.v ? 'on' : ''} onClick={() => setFreq(f.v)}>{f.l}</button>)}
            </div>
            {freq !== 'none' && (
              <div className="ef-repeat">
                <label className="ef-inline">Cada
                  <input type="number" min={1} max={30} value={every} onChange={e => setEvery(Math.max(1, Number(e.target.value) || 1))} />
                  {{ daily: 'día(s)', weekly: 'semana(s)', monthly: 'mes(es)', yearly: 'año(s)' }[freq]}
                </label>
                {freq === 'weekly' && (
                  <div className="ef-days" role="group" aria-label="Días de la semana">
                    {WEEKDAYS.map(w => (
                      <button type="button" key={w.d} className={effectiveDays.includes(w.d) ? 'on' : ''} onClick={() => toggleDay(w.d)} aria-pressed={effectiveDays.includes(w.d)}>{w.l}</button>
                    ))}
                  </div>
                )}
                <label className="ef-inline">Hasta <input type="date" value={until} min={date} onChange={e => setUntil(e.target.value)} /> <small>(opcional)</small></label>
                <p className="ef-hint">{describeRepeat(repeat, date)}</p>
              </div>
            )}
          </div>

          <div className="ef-field">
            <span>¿Para quién?</span>
            <div className="ef-chips">
              {['Familia', ...members.map(m => m.name)].map(n => (
                <button type="button" key={n} className={`chip${who.includes(n) ? ' on' : ''}`} aria-pressed={who.includes(n)} onClick={() => toggleWho(n)}>{avatar(n)} {n}</button>
              ))}
            </div>
          </div>

          <div className="ef-field">
            <span>Quién hace qué</span>
            {assignments.map((a, i) => (
              <div key={i} className="ef-assign">
                <select value={a.member} onChange={e => setAssign(i, { member: e.target.value })} aria-label="Quién">
                  {members.map(m => <option key={m.id} value={m.name}>{m.avatar} {m.name}</option>)}
                </select>
                <input value={a.task} onChange={e => setAssign(i, { task: e.target.value })} placeholder="Ej: lleva el pastel" aria-label="Qué hace" />
                <button type="button" className="btn-icon" onClick={() => setAssignments(list => list.filter((_, k) => k !== i))} aria-label="Quitar"><Trash2 size={15} /></button>
              </div>
            ))}
            <button type="button" className="btn-secondary" style={{ alignSelf: 'flex-start' }}
              onClick={() => setAssignments(list => [...list, { member: (who.find(w => w !== 'Familia') || members[0]?.name || ''), task: '' }])}>
              <Plus size={14} /> Agregar responsable
            </button>
          </div>

          <label className="ef-field"><span>Lugar</span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Opcional" /></label>

          <div className="ef-field">
            <span>Color</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {EVENT_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} className={`ef-color${color === c ? ' on' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          <label className="ef-field"><span>Notas</span><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Opcional" /></label>
        </div>
        <div className="sheet-foot" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editing ? 'Guardar cambios' : 'Agregar evento'}</button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
