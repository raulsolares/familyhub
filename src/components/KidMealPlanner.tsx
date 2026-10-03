import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import FoodPicker from './FoodPicker';
import { MEALS, MEAL_EMOJI, foodEmoji, getFoodUsage } from '../utils/food';
import { WEEK_DAYS, todayName } from '../utils/dates';
import { sounds } from '../utils/audio';

/** Semana de comida del niño: elige día, toca un tiempo de comida y escoge sus platillos */
const KidMealPlanner = ({ kidName, onPlanned }: { kidName: string; onPlanned?: () => void }) => {
  const { weeklyMenu, foods, toggleAte, foodGroupLimits } = useData();
  const today = todayName();
  const [day, setDay] = useState(today);
  const [picking, setPicking] = useState<string | null>(null);

  // Fechas de la semana actual (lunes a domingo)
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const dateOf = (i: number) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d.getDate(); };

  const slotFor = (d: string, meal: string) =>
    weeklyMenu.find(w => w.day === d && w.meal === meal && w.member === kidName && w.foodIds.length > 0);
  const filledCount = (d: string) => MEALS.filter(m => slotFor(d, m)).length;

  const usage = getFoodUsage(weeklyMenu, foods, kidName);
  const groups = Object.entries(foodGroupLimits);

  return (
    <div className="kid-panel kid-panel-food">
      <div className="kid-panel-head">
        <h3>🍽️ Mi comida de la semana</h3>
      </div>

      <div className="day-strip" role="tablist">
        {WEEK_DAYS.map((d, i) => {
          const full = filledCount(d);
          return (
            <button key={d} role="tab" aria-selected={day === d} className={`day-pill${day === d ? ' on' : ''}${d === today ? ' today' : ''}`} onClick={() => setDay(d)}>
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
          const isToday = day === today;
          return (
            <div key={meal} className={`meal-card${slot ? ' filled' : ''}${slot?.ate ? ' ate' : ''}`}>
              <button className="meal-card-main" onClick={() => setPicking(meal)}>
                <span className="meal-card-label">{MEAL_EMOJI[meal]} {meal}</span>
                {items.length ? (
                  <span className="meal-card-foods">
                    {items.map(f => <span key={f!.id} title={f!.name}>{foodEmoji(f!)}</span>)}
                  </span>
                ) : (
                  <span className="meal-card-empty"><Plus size={16} strokeWidth={3} /> Elegir</span>
                )}
                {items.length > 0 && <span className="meal-card-names">{items.map(f => f!.name).join(', ')}</span>}
              </button>
              {slot && isToday && (
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

      {picking && (
        <FoodPicker mode="kid" member={kidName} day={day} meal={picking} onClose={() => setPicking(null)} onSaved={onPlanned} />
      )}
    </div>
  );
};

export default KidMealPlanner;
