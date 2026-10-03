import { weekStartKey, nextWeekStartKey, weekRange } from '../utils/dates';

interface Props {
  value: string;
  onChange: (week: string) => void;
  /** Texto pequeño bajo cada opción (p. ej. cuántas comidas lleva) */
  note?: (week: string) => string | undefined;
  className?: string;
}

/** Selector entre esta semana y la próxima */
const WeekSwitch = ({ value, onChange, note, className = '' }: Props) => {
  const weeks = [
    { key: weekStartKey(), label: 'Esta semana' },
    { key: nextWeekStartKey(), label: 'Próxima semana' },
  ];
  return (
    <div className={`week-switch ${className}`} role="tablist" aria-label="Semana">
      {weeks.map(w => (
        <button key={w.key} role="tab" aria-selected={value === w.key} className={value === w.key ? 'on' : ''} onClick={() => onChange(w.key)}>
          <b>{w.label}</b>
          <small>{weekRange(w.key)}{note?.(w.key) ? ` · ${note(w.key)}` : ''}</small>
        </button>
      ))}
    </div>
  );
};

export default WeekSwitch;
