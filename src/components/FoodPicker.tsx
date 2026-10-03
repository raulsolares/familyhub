import { useState } from 'react';
import { X, Minus, Plus, Lock, Search, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { getFoodUsage, remainingFor, foodEmoji, MEAL_EMOJI } from '../utils/food';
import { sounds } from '../utils/audio';

interface Props {
  mode: 'kid' | 'parent';
  member: string;
  day: string;
  meal: string;
  onClose: () => void;
  onSaved?: () => void;
  /** En lugar de guardar directo (p. ej. pedir permiso a papás) */
  onSubmit?: (foodIds: string[], quantities: Record<string, number>) => void;
  submitLabel?: string;
  title?: string;
}

/**
 * Selector de platillos para un tiempo de comida.
 * - Niños: mosaico grande con emojis; los topes semanales bloquean.
 * - Papás: lista compacta con búsqueda; los topes solo avisan y se puede aplicar a varios miembros.
 */
const FoodPicker = ({ mode, member, day, meal, onClose, onSaved, onSubmit, submitLabel, title }: Props) => {
  const { foods, weeklyMenu, members, foodGroupLimits, assignMeal } = useData();
  const isKid = mode === 'kid';

  const slot = weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === member);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    slot?.foodIds.forEach(fid => { init[fid] = slot.quantities?.[fid] || 1; });
    return init;
  });
  const [search, setSearch] = useState('');
  const [allMeals, setAllMeals] = useState(false);
  const [alsoFor, setAlsoFor] = useState<string[]>([]);
  const [msg, setMsg] = useState('');

  const memberIsKid = members.some(m => m.name === member && m.role === 'child');
  const usage = getFoodUsage(weeklyMenu, foods, member, { day, meal });
  const left = (fid: string) => {
    const food = foods.find(f => f.id === fid);
    return food && memberIsKid ? remainingFor(food, usage, quantities, foods, foodGroupLimits) : Infinity;
  };

  const visible = foods
    .filter(f => allMeals || search || f.categories.includes(meal))
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(!!b.isFavorite) - Number(!!a.isFavorite) || a.name.localeCompare(b.name));

  const add = (fid: string) => {
    const food = foods.find(f => f.id === fid);
    if (isKid && left(fid) <= 0) {
      const foodLeft = food?.maxPerWeek ? food.maxPerWeek - (usage.byFood[fid] || 0) - (quantities[fid] || 0) : Infinity;
      setMsg(foodLeft <= 0 ? `Ya no te quedan ${food?.name} esta semana 🙈` : `Ya usaste todos tus ${food?.group} de esta semana 🙈`);
      sounds.error();
      return;
    }
    if (isKid) sounds.select();
    setMsg('');
    setQuantities(q => ({ ...q, [fid]: (q[fid] || 0) + 1 }));
  };
  const remove = (fid: string) => {
    if (isKid) sounds.deselect();
    setMsg('');
    setQuantities(q => {
      const cur = q[fid] || 0;
      if (cur <= 1) { const n = { ...q }; delete n[fid]; return n; }
      return { ...q, [fid]: cur - 1 };
    });
  };

  const save = () => {
    const ids = Object.keys(quantities);
    if (onSubmit) { onSubmit(ids, quantities); onClose(); return; }
    [member, ...alsoFor].forEach(m => assignMeal(day, meal, ids, m, quantities));
    if (isKid) sounds.save();
    onSaved?.();
    onClose();
  };

  const selectedIds = Object.keys(quantities);
  const limitChips = memberIsKid ? Object.entries(foodGroupLimits).map(([g, lim]) => {
    const inSel = selectedIds.filter(fid => foods.find(f => f.id === fid)?.group === g).reduce((s, fid) => s + quantities[fid], 0);
    return { g, lim, left: lim - (usage.byGroup[g] || 0) - inSel };
  }) : [];

  // ── Vista niños ────────────────────────────────────────────────────────────
  if (isKid) {
    return (
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet kid-sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-head">
            <div>
              <p className="kid-sheet-kicker">{MEAL_EMOJI[meal]} {meal} · {day}</p>
              <h2 className="kid-sheet-title">{title || '¿Qué se te antoja?'}</h2>
            </div>
            <button className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
          </div>

          {limitChips.length > 0 && (
            <div className="limit-chips">
              {limitChips.map(c => (
                <span key={c.g} className={`limit-chip${c.left <= 0 ? ' out' : ''}`}>
                  {c.g}: {Math.max(0, c.left)} de {c.lim}
                </span>
              ))}
            </div>
          )}
          {msg && <div className="kid-msg" role="alert">{msg}</div>}

          <div className="sheet-body">
            {visible.length === 0 ? (
              <p className="kid-empty">Todavía no hay platillos para {meal}. ¡Pídeselos a papá o mamá!</p>
            ) : (
              <div className="food-tiles">
                {visible.map(f => {
                  const qty = quantities[f.id] || 0;
                  const l = left(f.id);
                  const locked = l <= 0 && qty === 0;
                  return (
                    <div key={f.id} className={`food-tile${qty ? ' on' : ''}${locked ? ' locked' : ''}`}>
                      <button className="food-tile-main" onClick={() => add(f.id)} aria-label={`Agregar ${f.name}`}>
                        <span className="food-tile-emoji">{foodEmoji(f)}</span>
                        <span className="food-tile-name">{f.name}</span>
                        <span className="food-tile-note">
                          {locked ? <><Lock size={11} /> Se acabaron</> : l === Infinity ? ' ' : `Quedan ${l}`}
                        </span>
                      </button>
                      {qty > 0 && (
                        <div className="food-tile-qty">
                          <button onClick={() => remove(f.id)} aria-label="Quitar uno"><Minus size={14} strokeWidth={3} /></button>
                          <span>{qty}</span>
                          <button onClick={() => add(f.id)} disabled={l <= 0} aria-label="Agregar uno"><Plus size={14} strokeWidth={3} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sheet-foot">
            <div className="kid-tray" aria-label="Tu plato">
              {selectedIds.length === 0
                ? <span className="kid-tray-empty">Tu plato está vacío</span>
                : selectedIds.map(fid => {
                  const f = foods.find(x => x.id === fid);
                  return f ? <span key={fid} className="kid-tray-item">{foodEmoji(f)}{quantities[fid] > 1 && <sup>×{quantities[fid]}</sup>}</span> : null;
                })}
            </div>
            <button className="kid-save" onClick={save} disabled={!selectedIds.length && !slot}>
              {submitLabel || (selectedIds.length ? '¡Listo! 🎉' : 'Dejar vacío')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista papás ────────────────────────────────────────────────────────────
  const others = members.filter(m => m.name !== member);
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet parent-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <p className="sheet-kicker">{day} · {meal}</p>
            <h2 className="sheet-title">Menú de {member}</h2>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="picker-tools">
          <div className="search-box">
            <Search size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar platillo" />
          </div>
          <div className="seg">
            <button className={!allMeals ? 'on' : ''} onClick={() => setAllMeals(false)}>{meal}</button>
            <button className={allMeals ? 'on' : ''} onClick={() => setAllMeals(true)}>Todos</button>
          </div>
        </div>

        {limitChips.length > 0 && (
          <div className="limit-chips parent">
            {limitChips.map(c => (
              <span key={c.g} className={`limit-chip${c.left < 0 ? ' out' : ''}`}>{c.g}: {Math.max(0, c.left)}/{c.lim} restantes</span>
            ))}
          </div>
        )}

        <div className="sheet-body">
          {visible.length === 0 && <p className="text-sm text-muted" style={{ padding: '1rem 0', textAlign: 'center' }}>Sin resultados. Agrega platillos en el Catálogo.</p>}
          <ul className="food-rows">
            {visible.map(f => {
              const qty = quantities[f.id] || 0;
              const l = left(f.id);
              const over = memberIsKid && l < 0;
              return (
                <li key={f.id} className={`food-row${qty ? ' on' : ''}`}>
                  <button className="food-row-main" onClick={() => (qty ? remove(f.id) : add(f.id))}>
                    <span className="food-row-emoji">{foodEmoji(f)}</span>
                    <span className="food-row-text">
                      <span className="food-row-name">{f.name}</span>
                      <span className="food-row-meta">
                        {[f.group, f.maxPerWeek ? `máx ${f.maxPerWeek}/sem` : null, f.calories ? `${f.calories} kcal` : null].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {over && <span className="food-row-warn"><AlertTriangle size={12} /> Excede tope</span>}
                    {memberIsKid && !over && l !== Infinity && <span className="food-row-left">{l} libres</span>}
                  </button>
                  {qty > 0 ? (
                    <div className="stepper">
                      <button onClick={() => remove(f.id)} aria-label="Menos"><Minus size={13} /></button>
                      <span>{qty}</span>
                      <button onClick={() => setQuantities(q => ({ ...q, [f.id]: (q[f.id] || 0) + 1 }))} aria-label="Más"><Plus size={13} /></button>
                    </div>
                  ) : (
                    <button className="row-add" onClick={() => add(f.id)} aria-label={`Agregar ${f.name}`}><Plus size={15} /></button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sheet-foot parent">
          {others.length > 0 && (
            <div className="also-for">
              <span>Aplicar también a</span>
              {others.map(m => (
                <button key={m.id} className={`chip${alsoFor.includes(m.name) ? ' on' : ''}`}
                  onClick={() => setAlsoFor(a => a.includes(m.name) ? a.filter(x => x !== m.name) : [...a, m.name])}>
                  {m.avatar} {m.name}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {slot && <button className="btn-secondary" onClick={() => { setQuantities({}); [member, ...alsoFor].forEach(m => assignMeal(day, meal, [], m)); onClose(); }}>Vaciar</button>}
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={save}>
              Guardar{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPicker;
