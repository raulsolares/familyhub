import { useState } from 'react';
import { Check, Plus, Lock, Clock, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import FoodPicker from './FoodPicker';
import { MEALS, MEAL_EMOJI, foodEmoji, getFoodUsage } from '../utils/food';
import { WEEK_DAYS, todayName, weekStartKey, nextWeekStartKey, dateInWeek } from '../utils/dates';
import { sounds } from '../utils/audio';
import { notify } from '../utils/push';

interface Props {
  kidName: string;
  onPlanned?: () => void;
  onLocked?: () => void;
  onRequested?: () => void;
}

/**
 * Semana de comida del niño.
 * 1) Elige toda la semana y la confirma (queda bloqueada).
 * 2) Después, cada cambio es una solicitud que papá o mamá aprueban.
 */
const KidMealPlanner = ({ kidName, onPlanned, onLocked, onRequested }: Props) => {
  const {
    menuOf, foods, toggleAte, foodGroupLimits, isMenuLocked, lockMenu, mealChangeRequests, requestMealChange, cancelMealChange,
  } = useData();
  const thisWeek = weekStartKey();
  const nextWeek = nextWeekStartKey();
  const [week, setWeekState] = useState(thisWeek);
  const isNext = week === nextWeek;
  const weeklyMenu = menuOf(week);
  const today = isNext ? '' : todayName();
  const todayIdx = isNext ? -1 : WEEK_DAYS.indexOf(today);
  const [day, setDay] = useState(todayName());
  const setWeek = (w: string) => { setWeekState(w); setDay(w === thisWeek ? todayName() : 'Lunes'); };
  const [picking, setPicking] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const locked = isMenuLocked(kidName, week);
  const dateOf = (i: number) => dateInWeek(week, i).getDate();

  const slotFor = (d: string, meal: string) =>
    weeklyMenu.find(w => w.day === d && w.meal === meal && w.member === kidName && w.foodIds.length > 0);
  const filledCount = (d: string) => MEALS.filter(m => slotFor(d, m)).length;
  const totalFilled = WEEK_DAYS.reduce((s, d) => s + filledCount(d), 0);
  const totalSlots = WEEK_DAYS.length * MEALS.length;
  const pendingFor = (d: string, meal: string) =>
    mealChangeRequests.find(r => r.status === 'pending' && r.member === kidName && (r.week || thisWeek) === week && r.day === d && r.meal === meal);
  const isPast = (d: string) => WEEK_DAYS.indexOf(d) < todayIdx;

  const usage = getFoodUsage(weeklyMenu, foods, kidName);
  const groups = Object.entries(foodGroupLimits);
  const dishText = (d: string, meal: string) => {
    const slot = slotFor(d, meal);
    return slot ? slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean).map(f => foodEmoji(f!)).join('') : '—';
  };

  const confirmWeek = () => {
    lockMenu(kidName, week);
    sounds.kidCheer();
    onLocked?.();
    notify({ to: 'parents', title: `🍽️ ${kidName} confirmó su menú${isNext ? ' de la próxima semana' : ''}`, body: `Eligió ${totalFilled} comidas de la semana.`, url: '/menu', tag: `menu-${kidName}` });
  };

  const sendRequest = (req: Parameters<typeof requestMealChange>[0], text: string) => {
    requestMealChange({ ...req, week });
    sounds.save();
    onRequested?.();
    notify({ to: 'parents', title: `🍽️ ${kidName} pide un cambio de comida`, body: text, url: '/', tag: `mealchange-${kidName}-${req.day}-${req.meal}` });
    setChanging(null);
  };

  const tapMeal = (meal: string) => {
    if (!locked) { setPicking(meal); return; }
    if (isPast(day)) { sounds.error(); return; }
    setChanging(meal);
  };

  return (
    <div className="kid-panel kid-panel-food">
      <div className="kid-panel-head">
        <h3>🍽️ Comida de la semana</h3>
        {locked
          ? <span className="kid-lock on"><Lock size={13} /> Confirmada</span>
          : <span className="kid-count">{totalFilled}/{totalSlots}</span>}
      </div>
      <div className="kid-weeks" role="tablist" aria-label="Semana">
        {[{ k: thisWeek, l: '📅 Esta semana' }, { k: nextWeek, l: '🚀 Próxima semana' }].map(w => (
          <button key={w.k} role="tab" aria-selected={week === w.k} className={week === w.k ? 'on' : ''} onClick={() => setWeek(w.k)}>
            {w.l}{isMenuLocked(kidName, w.k) ? ' 🔒' : ''}
          </button>
        ))}
      </div>
      {!locked && (
        <p className="kid-hint">Elige tu comida de toda la semana y luego confírmala. Si después quieres cambiar algo, le pides permiso a papá o mamá.</p>
      )}

      <div className="day-strip" role="tablist">
        {WEEK_DAYS.map((d, i) => {
          const full = filledCount(d);
          return (
            <button key={d} role="tab" aria-selected={day === d} className={`day-pill${day === d ? ' on' : ''}${d === today ? ' today' : ''}${isPast(d) ? ' past' : ''}`} onClick={() => setDay(d)}>
              <span className="day-pill-name">{d.slice(0, 3)}</span>
              <span className="day-pill-num">{dateOf(i)}</span>
              <span className="day-pill-dots">
                {MEALS.map((_, k) => <i key={k} className={k < full ? 'f' : ''} />)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="meal-cards">
        {MEALS.map(meal => {
          const slot = slotFor(day, meal);
          const items = slot ? slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean) : [];
          const pending = pendingFor(day, meal);
          return (
            <div key={meal} className={`meal-card${slot ? ' filled' : ''}${slot?.ate ? ' ate' : ''}${pending ? ' pending' : ''}`}>
              <button className="meal-card-main" onClick={() => tapMeal(meal)}>
                <span className="meal-card-label">{MEAL_EMOJI[meal]} {meal}</span>
                {items.length ? (
                  <span className="meal-card-foods">
                    {items.map(f => <span key={f!.id} title={f!.name}>{foodEmoji(f!)}</span>)}
                  </span>
                ) : (
                  <span className="meal-card-empty">{locked ? '—' : <><Plus size={16} strokeWidth={3} /> Elegir</>}</span>
                )}
                {items.length > 0 && <span className="meal-card-names">{items.map(f => f!.name).join(', ')}</span>}
                {pending && <span className="meal-card-pending"><Clock size={12} /> Esperando permiso</span>}
              </button>
              {slot && day === today && (
                <button className={`ate-btn${slot.ate ? ' on' : ''}`} onClick={() => { toggleAte(slot.id); if (!slot.ate) sounds.success(); }}>
                  <Check size={14} strokeWidth={3} /> {slot.ate ? '¡Me lo comí!' : '¿Ya comiste?'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {groups.length > 0 && (
        <div className="limit-chips" style={{ marginTop: '0.75rem' }}>
          {groups.map(([g, lim]) => {
            const left = lim - (usage.byGroup[g] || 0);
            return <span key={g} className={`limit-chip${left <= 0 ? ' out' : ''}`}>{g}: te quedan {Math.max(0, left)} de {lim}</span>;
          })}
        </div>
      )}

      {!locked && (
        <button className="kid-confirm" onClick={confirmWeek} disabled={totalFilled === 0}>
          <Lock size={18} /> {isNext ? 'Confirmar la próxima semana' : 'Confirmar mi semana'}
        </button>
      )}

      {picking && (
        <FoodPicker mode="kid" member={kidName} day={day} meal={picking} week={week} onClose={() => setPicking(null)} onSaved={onPlanned} />
      )}

      {changing && (() => {
        const pending = pendingFor(day, changing);
        const swapDays = WEEK_DAYS.filter(d => d !== day && !isPast(d));
        return (
          <div className="sheet-overlay" onClick={() => setChanging(null)}>
            <div className="sheet kid-sheet" onClick={e => e.stopPropagation()}>
              <div className="sheet-head">
                <div>
                  <p className="kid-sheet-kicker">{MEAL_EMOJI[changing]} {changing} · {day}</p>
                  <h2 className="kid-sheet-title">¿No se te antoja?</h2>
                </div>
                <button className="sheet-close" onClick={() => setChanging(null)} aria-label="Cerrar"><X size={20} /></button>
              </div>
              <div className="sheet-body">
                {pending ? (
                  <div className="kid-wait">
                    <div style={{ fontSize: '2.5rem' }}>⏳</div>
                    <p>Ya le pediste a papá o mamá este cambio. Te avisamos cuando respondan.</p>
                    <button className="kid-ghost" onClick={() => { cancelMealChange(pending.id); setChanging(null); }}>Cancelar mi solicitud</button>
                  </div>
                ) : (
                  <>
                    <p className="kid-hint" style={{ marginBottom: '0.75rem' }}>Hoy toca: <b style={{ fontSize: '1.25rem' }}>{dishText(day, changing)}</b></p>
                    <h4 className="kid-subhead">🔄 Cambiar con otro día</h4>
                    <div className="swap-grid">
                      {swapDays.map(d => (
                        <button key={d} className="swap-btn"
                          onClick={() => sendRequest({ member: kidName, day, meal: changing, kind: 'swap', swapDay: d }, `Quiere cambiar ${changing.toLowerCase()} del ${day.toLowerCase()} por la del ${d.toLowerCase()}.`)}>
                          <span>{d.slice(0, 3)}</span>
                          <b>{dishText(d, changing)}</b>
                        </button>
                      ))}
                    </div>
                    <h4 className="kid-subhead">🍽️ O elegir otra cosa</h4>
                    <button className="kid-ghost" onClick={() => { setReplacing(changing); setChanging(null); }}>Escoger otro platillo</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {replacing && (
        <FoodPicker
          mode="kid" member={kidName} day={day} meal={replacing} week={week} title="¿Qué quieres en su lugar?" submitLabel="Pedir permiso 📨"
          onClose={() => setReplacing(null)}
          onSubmit={(foodIds, quantities) => sendRequest(
            { member: kidName, day, meal: replacing, kind: 'replace', foodIds, quantities },
            `Quiere cambiar ${replacing.toLowerCase()} del ${day.toLowerCase()}.`,
          )}
        />
      )}
    </div>
  );
};

export default KidMealPlanner;
