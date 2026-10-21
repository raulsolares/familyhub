import { useState } from 'react';
import { ACTIVITY_ICONS } from '../utils/icons';

interface Props {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

/** Botón con el dibujito actual; al tocarlo muestra la paleta para cambiarlo */
const IconPicker = ({ value, onChange, label = 'Elegir dibujito' }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="icon-pick">
      <button type="button" className="icon-pick-btn" onClick={() => setOpen(o => !o)} aria-label={label} aria-expanded={open}>
        {value}
      </button>
      {open && (
        <>
          <span className="icon-pick-scrim" onClick={() => setOpen(false)} />
          <span className="icon-pick-pop" role="listbox" aria-label={label}>
            {ACTIVITY_ICONS.map(ic => (
              <button
                key={ic} type="button" role="option" aria-selected={ic === value}
                className={ic === value ? 'on' : ''}
                onClick={() => { onChange(ic); setOpen(false); }}
              >{ic}</button>
            ))}
          </span>
        </>
      )}
    </span>
  );
};

export default IconPicker;
