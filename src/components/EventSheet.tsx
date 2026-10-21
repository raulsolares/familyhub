import { X, Clock, MapPin, Repeat, Users, Link2, Edit2, Trash2, ListChecks } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { AgendaItem } from '../utils/agenda';

const longDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  const s = new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

interface Props {
  item: AgendaItem;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Vista completa de un evento: fecha, hora, quién, quién hace qué, notas, repetición y origen */
const EventSheet = ({ item, onClose, onEdit, onDelete }: Props) => {
  const { members } = useData();
  const avatar = (n: string) => (n === 'Familia' ? '👨‍👩‍👧‍👦' : members.find(m => m.name === n)?.avatar || '👤');
  const time = item.time ? `${item.time}${item.endTime ? ` – ${item.endTime}` : ''}` : 'Todo el día';

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet event-sheet" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()} role="dialog" aria-label={item.title}>
        <div className="event-sheet-bar" style={{ background: item.color }} />
        <div className="sheet-head">
          <div style={{ minWidth: 0 }}>
            <p className="sheet-kicker">
              {item.kind === 'school' ? `Escuela · ${item.category}` : item.kind === 'feed' ? `Calendario · ${item.feedName}` : 'Evento familiar'}
            </p>
            <h2 className="sheet-title" style={{ fontSize: '1.3rem' }}>{item.title}</h2>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="sheet-body">
          <ul className="event-facts">
            <li><Clock size={16} /><span><b>{longDate(item.date)}</b><br />{time}</span></li>
            {item.repeatText && <li><Repeat size={16} /><span>{item.repeatText}</span></li>}
            {item.location && <li><MapPin size={16} /><span>{item.location}</span></li>}
            <li><Users size={16} /><span className="event-who">{item.who.map(n => <span key={n} className="who-chip">{avatar(n)} {n}</span>)}</span></li>
            {item.feedName && <li><Link2 size={16} /><span>Viene de “{item.feedName}”. Se edita en ese calendario.</span></li>}
          </ul>

          {item.assignments && item.assignments.length > 0 && (
            <div className="event-block">
              <h4><ListChecks size={15} /> Quién hace qué</h4>
              <ul className="assign-list">
                {item.assignments.map((a, i) => (
                  <li key={i}><span className="who-chip">{avatar(a.member)} {a.member}</span><span>{a.task}</span></li>
                ))}
              </ul>
            </div>
          )}

          {item.notes && (
            <div className="event-block">
              <h4>Notas</h4>
              <p className="event-notes">{item.notes}</p>
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="sheet-foot" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            {onDelete && <button className="btn-secondary" style={{ color: 'var(--danger)' }} onClick={onDelete}><Trash2 size={14} /> {item.event?.repeat ? 'Borrar serie' : 'Borrar'}</button>}
            {onEdit && <button className="btn-primary" onClick={onEdit}><Edit2 size={14} /> Editar</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSheet;
