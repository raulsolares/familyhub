import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Copy, ShoppingCart, BookOpen, Check, Lock, Unlock, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import FoodPicker from '../components/FoodPicker';
import { MEALS, MEAL_EMOJI, foodEmoji, getFoodUsage } from '../utils/food';
import { WEEK_DAYS, todayName, weekStartKey, nextWeekStartKey, weekRange } from '../utils/dates';
import WeekSwitch from '../components/WeekSwitch';
import { useMealChanges } from '../hooks/useMealChanges';

const FAMILY = '__familia';

const WeeklyMenu = () => {
  const { menuOf, foods, members, foodGroupLimits, assignMeal, clearWeeklyMenu, isMenuLocked, unlockMenu, lockMenu } = useData();
  const thisWeek = weekStartKey();
  const nextWeek = nextWeekStartKey();
  const [week, setWeek] = useState(thisWeek);
  const weeklyMenu = menuOf(week);
  const isNext = week === nextWeek;
  const mealChanges = useMealChanges();
  const [member, setMember] = useState(FAMILY);
  const [picking, setPicking] = useState<{ day: string; meal: string; member: string } | null>(null);
  const [confirmNewWeek, setConfirmNewWeek] = useState(false);
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const today = isNext ? '' : todayName();

  // Si hay datos en tiempos de comida extra (versiones anteriores), también se muestran
  const meals = [...MEALS, ...['Snack', 'Merienda'].filter(m => weeklyMenu.some(w => w.meal === m && w.foodIds.length))];

  const slotFor = (day: string, meal: string, who = member) =>
    weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === who && w.foodIds.length > 0);
  const filled = (who: string) => weeklyMenu.filter(w => w.member === who && w.foodIds.length > 0).length;
  const countOf = (wk: string) => menuOf(wk).filter(w => w.foodIds.length > 0).length;

  /** Copia todo el menú de esta semana a la próxima (para no empezar de cero) */
  const copyThisWeek = () => {
    menuOf(thisWeek).forEach(w => assignMeal(w.day, w.meal, w.foodIds, w.member, w.quantities, nextWeek));
  };

  const kids = members.filter(m => m.role === 'child');
  const isFamily = member === FAMILY;
  const memberObj = members.find(m => m.name === member);
  const pick = (day: string, meal: string, who = member) => setPicking({ day, meal, member: who });

  /** Vista familia: una línea por miembro dentro de cada comida */
  const familyLines = (day: string, meal: string, compact: boolean) => members.map(m => {
    const slot = slotFor(day, meal, m.name);
    const items = slot ? slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean) : [];
    return (
      <button key={m.id} className={`fam-line${items.length ? '' : ' empty'}${slot?.ate ? ' ate' : ''}`} onClick={() => pick(day, meal, m.name)} aria-label={`${meal} del ${day} de ${m.name}`}>
        <span className="fam-av">{m.avatar}</span>
        {items.length
          ? <span className="fam-food">{compact ? items.map(f => foodEmoji(f!)).join('') : items.map(f => `${foodEmoji(f!)} ${f!.name}`).join(', ')}</span>
          : <span className="fam-food muted">{compact ? '·' : 'Sin asignar'}</span>}
      </button>
    );
  });

  const copyDay = (from: string, to: string[]) => {
    meals.forEach(meal => {
      const src = slotFor(from, meal);
      to.forEach(d => assignMeal(d, meal, src?.foodIds || [], member, src?.quantities || {}, week));
    });
    setCopyFrom(null);
  };

  const cellContent = (day: string, meal: string) => {
    const slot = slotFor(day, meal);
    const items = slot ? slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean) : [];
    return { slot, items };
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Menú semanal</h1>
          <p className="page-subtitle">Toca un espacio para elegir platillos. Los niños eligen los suyos desde su pantalla.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/food" className="btn-secondary" style={{ textDecoration: 'none' }}><BookOpen size={14} /> Platillos</Link>
          <Link to={`/shopping?week=${week}`} className="btn-secondary" style={{ textDecoration: 'none' }}><ShoppingCart size={14} /> Súper de esta lista</Link>
          {weeklyMenu.length > 0 && (
            <button className="btn-secondary" onClick={() => setConfirmNewWeek(true)}><RefreshCw size={14} /> Vaciar semana</button>
          )}
        </div>
      </header>

      <div className="week-bar">
        <WeekSwitch value={week} onChange={setWeek} note={wk => { const n = countOf(wk); return n ? `${n} comidas` : 'vacía'; }} />
        {isNext && countOf(nextWeek) === 0 && countOf(thisWeek) > 0 && (
          <button className="btn-secondary" onClick={copyThisWeek}><Copy size={14} /> Copiar la semana actual</button>
        )}
      </div>
      {isNext && (
        <p className="notice" style={{ marginBottom: '1rem' }}>
          Estás planeando la próxima semana ({weekRange(nextWeek)}). La lista del súper puede armarse con este menú.
        </p>
      )}

      <div className="planner-toolbar">
        <div className="member-tabs" role="tablist">
          <button role="tab" aria-selected={isFamily} className={`member-tab${isFamily ? ' on' : ''}`} onClick={() => setMember(FAMILY)}>
            👨‍👩‍👧‍👦 Familia
          </button>
          {members.map(m => (
            <button key={m.id} role="tab" aria-selected={member === m.name} className={`member-tab${member === m.name ? ' on' : ''}`} onClick={() => setMember(m.name)}>
              {m.avatar} {m.name} <small>{filled(m.name)}</small>{m.role === 'child' && isMenuLocked(m.name, week) && <Lock size={11} />}
            </button>
          ))}
        </div>
      </div>

      {memberObj?.role === 'child' && (
        <div className={`notice${isMenuLocked(member, week) ? '' : ' warn'}`} style={{ marginBottom: '1rem', alignItems: 'center' }}>
          {isMenuLocked(member, week) ? <Lock size={16} /> : <Unlock size={16} />}
          <span style={{ flex: 1 }}>
            {isMenuLocked(member, week)
              ? <><b>{member} ya confirmó {isNext ? 'la próxima semana' : 'su semana'}.</b> Si quiere cambiar algo, te llega una solicitud para aprobar. Tú sí puedes editar.</>
              : <><b>{member} aún no confirma {isNext ? 'la próxima semana' : 'su semana'}.</b> Puede elegir y cambiar libremente hasta que la confirme.</>}
          </span>
          {isMenuLocked(member, week)
            ? <button className="btn-xs" onClick={() => unlockMenu(member, week)}><Unlock size={12} /> Desbloquear</button>
            : <button className="btn-xs" onClick={() => lockMenu(member, week)}><Lock size={12} /> Confirmar por {member}</button>}
        </div>
      )}

      {mealChanges.pending.length > 0 && (
        <div className="panel" style={{ marginBottom: '1rem' }}>
          <div className="panel-head"><h3>Cambios por aprobar</h3></div>
          <div className="attention-list">
            {mealChanges.pending.map(r => {
              const d = mealChanges.describe(r);
              return (
                <div key={r.id} className="attention-item">
                  <span className="attention-icon amber">{members.find(m => m.name === r.member)?.avatar}</span>
                  <div className="attention-text"><b>{r.member}: {d.title}</b><span>{d.detail}</span></div>
                  <div className="attention-actions">
                    <button className="btn-xs" onClick={() => mealChanges.resolve(r.id, false)} aria-label="Rechazar cambio"><X size={13} /></button>
                    <button className="btn-xs primary" onClick={() => mealChanges.resolve(r.id, true)}><Check size={13} /> Aprobar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Escritorio: cuadrícula */}
      <div className="week-grid">
        <div className="wg-head" />
        {WEEK_DAYS.map(d => (
          <div key={d} className={`wg-head${d === today ? ' today' : ''}`}>
            {d}
            {!isFamily && <button className="btn-icon" style={{ padding: '2px', marginLeft: '2px' }} title={`Copiar ${d} a otros días`} aria-label={`Copiar ${d}`} onClick={() => setCopyFrom(d)}><Copy size={11} /></button>}
          </div>
        ))}
        {meals.map(meal => (
          <div key={meal} style={{ display: 'contents' }}>
            <div className="wg-meal">{MEAL_EMOJI[meal]} {meal}</div>
            {WEEK_DAYS.map(day => {
              const { slot, items } = cellContent(day, meal);
              if (isFamily) return <div key={day} className={`wg-fam${day === today ? ' today' : ''}`}>{familyLines(day, meal, true)}</div>;
              return (
                <div key={day}>
                  <button className={`wg-cell${day === today ? ' today' : ''}${slot?.ate ? ' ate' : ''}`} onClick={() => pick(day, meal)} aria-label={`${meal} del ${day}`}>
                    {items.length ? (
                      <>
                        <span className="wg-emojis">{items.map(f => foodEmoji(f!)).join('')}</span>
                        <span className="wg-names">{items.map(f => {
                          const q = slot!.quantities?.[f!.id] || 1;
                          return q > 1 ? `${f!.name} ×${q}` : f!.name;
                        }).join(', ')}{slot?.ate ? ' ✓' : ''}</span>
                      </>
                    ) : <Plus size={16} className="wg-add" />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Celular: lista por día */}
      <div className="week-list">
        {WEEK_DAYS.map(day => (
          <div key={day} className="week-day">
            <div className={`week-day-head${day === today ? ' today' : ''}`}>
              <span>{day}{day === today ? ' · hoy' : ''}</span>
              {!isFamily && <button className="btn-icon" style={{ padding: '2px' }} aria-label={`Copiar ${day}`} onClick={() => setCopyFrom(day)}><Copy size={13} /></button>}
            </div>
            {meals.map(meal => {
              const { slot, items } = cellContent(day, meal);
              if (isFamily) return (
                <div key={meal} className="week-day-fam">
                  <span className="wd-meal">{MEAL_EMOJI[meal]} {meal}</span>
                  <div>{familyLines(day, meal, false)}</div>
                </div>
              );
              return (
                <button key={meal} className="week-day-row" onClick={() => pick(day, meal)}>
                  <span className="wd-meal">{MEAL_EMOJI[meal]} {meal}</span>
                  <span className="wd-food">
                    {items.length
                      ? <>{items.map(f => `${foodEmoji(f!)} ${f!.name}`).join(', ')}{slot?.ate && <Check size={13} color="var(--success)" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}</>
                      : <span className="wd-empty">Sin asignar</span>}
                  </span>
                  <Plus size={15} color="var(--p-text-subtle)" />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Topes de la semana por niño */}
      {kids.length > 0 && Object.keys(foodGroupLimits).length > 0 && (
        <div className="panel" style={{ marginTop: '1.25rem' }}>
          <div className="panel-head">
            <h3>Topes semanales</h3>
            <Link to="/food">Ajustar</Link>
          </div>
          <div className="panel-body limits-summary">
            {kids.map(k => {
              const usage = getFoodUsage(weeklyMenu, foods, k.name);
              return (
                <div key={k.id} className="limit-meter">
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{k.avatar} {k.name}</p>
                  {Object.entries(foodGroupLimits).map(([g, lim]) => {
                    const used = usage.byGroup[g] || 0;
                    return (
                      <div key={g} className="limit-meter-row">
                        <span>{g}</span>
                        <div className="limit-meter-bar"><div className={used >= lim ? 'full' : ''} style={{ width: `${Math.min(100, (used / Math.max(lim, 1)) * 100)}%` }} /></div>
                        <b>{used}/{lim}</b>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {picking && (
        <FoodPicker mode="parent" member={picking.member} day={picking.day} meal={picking.meal} week={week} onClose={() => setPicking(null)} />
      )}

      {copyFrom && (
        <div className="sheet-overlay" onClick={() => setCopyFrom(null)}>
          <div className="sheet" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-head">
              <div>
                <p className="sheet-kicker">{member}</p>
                <h2 className="sheet-title">Copiar el {copyFrom} a…</h2>
              </div>
            </div>
            <div className="sheet-body">
              <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>Reemplaza el menú de esos días con el del {copyFrom}.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                <button className="chip" onClick={() => copyDay(copyFrom, WEEK_DAYS.filter(d => d !== copyFrom && !['Sábado', 'Domingo'].includes(d)))}>Lunes a viernes</button>
                <button className="chip" onClick={() => copyDay(copyFrom, WEEK_DAYS.filter(d => d !== copyFrom))}>Toda la semana</button>
                {WEEK_DAYS.filter(d => d !== copyFrom).map(d => (
                  <button key={d} className="chip" onClick={() => copyDay(copyFrom, [d])}>{d}</button>
                ))}
              </div>
            </div>
            <div className="sheet-foot"><button className="btn-secondary" onClick={() => setCopyFrom(null)}>Cancelar</button></div>
          </div>
        </div>
      )}

      {confirmNewWeek && (
        <div className="sheet-overlay" onClick={() => setConfirmNewWeek(false)}>
          <div className="sheet" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="sheet-head"><h2 className="sheet-title">¿Vaciar {isNext ? 'la próxima semana' : 'esta semana'}?</h2></div>
            <div className="sheet-body"><p className="text-sm text-muted">Se borra el menú de toda la familia de {weekRange(week)} y sus confirmaciones. Los platillos del catálogo se quedan.</p></div>
            <div className="sheet-foot" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setConfirmNewWeek(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { clearWeeklyMenu(week); setConfirmNewWeek(false); }}>Sí, vaciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyMenu;
