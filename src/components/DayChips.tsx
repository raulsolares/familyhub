import { DAY_SHORT, DAY_ABBR, WEEK_ORDER } from '../utils/habits';

interface Props {
  value: number[];
  onChange: (days: number[]) => void;
}

/** Selector de días de la semana (L M M J V S D). Vacío = todos los días */
const DayChips = ({ value, onChange }: Props) => {
  const toggle = (d: number) => onChange(value.includes(d) ? value.filter(x => x !== d) : [...value, d]);
  return (
    <div className="day-chips" role="group" aria-label="Días">
      {WEEK_ORDER.map(d => (
        <button
          key={d} type="button" title={DAY_ABBR[d]} aria-label={DAY_ABBR[d]} aria-pressed={value.includes(d)}
          className={value.includes(d) ? 'on' : ''}
          onClick={() => toggle(d)}
        >{DAY_SHORT[d]}</button>
      ))}
    </div>
  );
};

export default DayChips;
