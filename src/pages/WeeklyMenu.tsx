import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Copy, ShoppingCart, BookOpen, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import FoodPicker from '../components/FoodPicker';
import { MEALS, MEAL_EMOJI, foodEmoji, getFoodUsage } from '../utils/food';
import { WEEK_DAYS, todayName } from '../utils/dates';

const WeeklyMenu = () => {
  const { weeklyMenu, foods, members, foodGroupLimits, assignMeal, clearWeeklyMenu } = useData();
  const [member, setMember] = useState(members.find(m => m.role === 'child')?.name || members[0]?.name || '');
  const [picking, setPicking] = useState<{ day: string; meal: string } | null>(null);
  const [confirmNewWeek, setConfirmNewWeek] = useState(false);
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const today = todayName();

  // Si hay datos en tiempos de comida extra (versiones anteriores), también se muestran
  const meals = [...MEALS, ...['Snack', 'Merienda'].filter(m => weeklyMenu.some(w => w.meal === m && w.foodIds.length))];

  const slotFor = (day: string, meal: string, who = member) =>
    weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === who && w.foodIds.length > 0);
  const filled = (who: string) => weeklyMenu.filter(w => w.member === who && w.foodIds.length > 0).length;

  const kids = members.filter(m => m.role === 'child');
  const memberObj = members.find(m => m.name === member);

  const copyDay = (from: string, to: string[]) => {
    meals.forEach(meal => {
      const src = slotFor(from, meal);
      to.forEach(d => assignMeal(d, meal, src?.foodIds || [], member, src?.quantities || {}));
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
          <Link to="/shopping" className="btn-secondary" style={{ textDecoration: 'none' }}><ShoppingCart size={14} /> Lista de súper</Link>
          {weeklyMenu.length > 0 && (
            <button className="btn-secondary" onClick={() => setConfirmNewWeek(true)}><RefreshCw size={14} /> Nueva semana</button>
          )}
        </div>
      </header>

      <div className="planner-toolbar">
        <div className="member-tabs" role="tablist">
          {members.map(m => (
            <button key={m.id} role="tab" aria-selected={member === m.name} className={`member-tab${member === m.name ? ' on' : ''}`} onClick={() => setMember(m.name)}>
              {m.avatar} {m.name} <small>{filled(m.name)}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Escritorio: cuadrícula */}
      <div className="week-grid">
        <div className="wg-head" />
        {WEEK_DAYS.map(d => (
          <div key={d} className={`wg-head${d === today ? ' today' : ''}`}>
            {d}
            <button className="btn-icon" style={{ padding: '2px', marginLeft: '2px' }} title={`Copiar ${d} a otros días`} aria-label={`Copiar ${d}`} onClick={() => setCopyFrom(d)}><Copy size={11} /></button>
          </div>
        ))}
        {meals.map(meal => (
          <div key={meal} style={{ display: 'contents' }}>
            <div className="wg-meal">{MEAL_EMOJI[meal]} {meal}</div>
            {WEEK_DAYS.map(day => {
              const { slot, items } = cellContent(day, meal);
              return (
                <div key={day}>
                  <button className={`wg-cell${day === today ? ' today' : ''}${slot?.ate ? ' ate' : ''}`} onClick={() => setPicking({ day, meal })} aria-label={`${meal} del ${day}`}>
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
              <button className="btn-icon" style={{ padding: '2px' }} aria-label={`Copiar ${day}`} onClick={() => setCopyFrom(day)}><Copy size={13} /></button>
            </div>
            {meals.map(meal => {
              const { slot, items } = cellContent(day, meal);
              return (
                <button key={meal} className="week-day-row" onClick={() => setPicking({ day, meal })}>
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

      {picking && memberObj && (
        <FoodPicker mode="parent" member={member} day={picking.day} meal={picking.meal} onClose={() => setPicking(null)} />
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
            <div className="sheet-head"><h2 className="sheet-title">¿Empezar una semana nueva?</h2></div>
            <div className="sheet-body"><p className="text-sm text-muted">Se borra el menú de toda la familia y los topes semanales se reinician. Los platillos del catálogo se quedan.</p></div>
            <div className="sheet-foot" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setConfirmNewWeek(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => { clearWeeklyMenu(); setConfirmNewWeek(false); }}>Sí, nueva semana</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyMenu;
