import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { CalendarFeed } from '../context/DataContext';
import { EVENT_COLORS } from '../utils/agenda';

/** Suscribirse a un calendario externo por su dirección iCal (Google, iCloud, Outlook) */
const FeedForm = ({ editing, onClose }: { editing: CalendarFeed | null; onClose: () => void }) => {
  const { members, addCalendarFeed, updateCalendarFeed } = useData();
  const [name, setName] = useState(editing?.name || '');
  const [url, setUrl] = useState(editing?.url || '');
  const [color, setColor] = useState(editing?.color || EVENT_COLORS[5]);
  const [who, setWho] = useState<string[]>(editing?.members.length ? editing.members : ['Familia']);
  const [error, setError] = useState('');

  const toggleWho = (n: string) => {
    if (n === 'Familia') { setWho(['Familia']); return; }
    const base = who.filter(w => w !== 'Familia');
    const next = base.includes(n) ? base.filter(w => w !== n) : [...base, n];
    setWho(next.length ? next : ['Familia']);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = url.trim().replace(/^webcal:/i, 'https:');
    if (!/^https:\/\//i.test(clean)) { setError('Pega la dirección completa, empieza con https:// o webcal://'); return; }
    if (/calendar\.google\.com\/calendar\/(u\/\d+\/)?(r|embed)/.test(clean)) {
      setError('Esa es la dirección para ver el calendario en el navegador. Necesitas la “Dirección secreta en formato iCal” (termina en .ics).');
      return;
    }
    const data = { name: name.trim() || 'Calendario', url: clean, color, members: who };
    if (editing) updateCalendarFeed(editing.id, data); else addCalendarFeed(data);
    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form className="sheet" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="sheet-head">
          <div>
            <p className="sheet-kicker">Solo lectura · se actualiza cada 15 minutos</p>
            <h2 className="sheet-title">{editing ? 'Editar calendario' : 'Suscribir un calendario'}</h2>
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="sheet-body event-form">
          <div className="notice" style={{ fontSize: '0.8rem' }}>
            <div>
              <b>En Google Calendar (computadora):</b> Configuración → en “Configuración de mis calendarios” elige el calendario →
              “Integrar el calendario” → copia la <b>Dirección secreta en formato iCal</b>. También funciona con iCloud y Outlook.
            </div>
          </div>
          <label className="ef-field"><span>Nombre</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Fútbol de Alan" /></label>
          <label className="ef-field">
            <span>Dirección iCal</span>
            <input required value={url} onChange={e => { setUrl(e.target.value); setError(''); }} placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" inputMode="url" autoCapitalize="off" autoCorrect="off" />
          </label>
          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div className="ef-field">
            <span>¿De quién son estos eventos?</span>
            <div className="ef-chips">
              {['Familia', ...members.map(m => m.name)].map(n => (
                <button type="button" key={n} className={`chip${who.includes(n) ? ' on' : ''}`} onClick={() => toggleWho(n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="ef-field">
            <span>Color</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {EVENT_COLORS.map(c => <button type="button" key={c} className={`ef-color${color === c ? ' on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`Color ${c}`} />)}
            </div>
          </div>
        </div>
        <div className="sheet-foot" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Suscribir'}</button>
        </div>
      </form>
    </div>
  );
};

export default FeedForm;
