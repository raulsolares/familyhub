import { useState } from 'react';
import { ChefHat, Check, Users, User } from 'lucide-react';
import { useData } from '../context/DataContext';

const MEALS = ['Desayuno', 'Lunch', 'Comida', 'Cena'];
const MEAL_EMOJI: Record<string, string> = { Desayuno: '🌅', Lunch: '🥪', Comida: '🍽️', Cena: '🌙' };

type ViewMode = 'comida' | 'persona';

const PrepView = () => {
  const { weeklyMenu, foods, members } = useData();
  const [filterMeal, setFilterMeal] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<ViewMode>('comida');

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = dayNames[new Date().getDay()];

  const visibleMeals = filterMeal === 'Todos' ? MEALS : [filterMeal];

  const getFood = (fid: string) => foods.find(f => f.id === fid);
  const getSlot = (meal: string, memberName: string) =>
    weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === memberName);

  // ── RESUMEN TOTAL ───────────────────────────────────────────────────────────
  const prepSummary: Record<string, { food: ReturnType<typeof getFood>; members: string[]; qty: number }> = {};
  visibleMeals.forEach(meal => {
    members.forEach(m => {
      const slot = getSlot(meal, m.name);
      if (!slot) return;
      slot.foodIds.forEach(fid => {
        const food = getFood(fid);
        if (!food) return;
        const qty = slot.quantities?.[fid] || 1;
        if (!prepSummary[food.id]) prepSummary[food.id] = { food, members: [], qty: 0 };
        prepSummary[food.id].members.push(m.name);
        prepSummary[food.id].qty += qty;
      });
    });
  });
  const anyData = Object.keys(prepSummary).length > 0;

  // ── FOOD CARD ───────────────────────────────────────────────────────────────
  const FoodCard = ({ foodId, qty, memberNames }: { foodId: string; qty: number; memberNames: string[] }) => {
    const food = getFood(foodId);
    if (!food) return null;
    return (
      <div style={{ background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{food.name}</p>
            {food.calories && <p style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>{food.calories} kcal/porción</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {qty > 1 && (
              <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '1px 7px', borderRadius: '9999px' }}>×{qty}</span>
            )}
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {memberNames.map(n => {
                const m = members.find(x => x.name === n);
                return <span key={n} title={n} style={{ fontSize: '1rem' }}>{m?.avatar || '👤'}</span>;
              })}
            </div>
          </div>
        </div>
        {food.ingredients.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {food.ingredients.map((ing, i) => (
              <span key={i} style={{ fontSize: '0.72rem', fontWeight: '600', background: 'var(--p-background)', color: 'var(--p-text-muted)', padding: '2px 7px', borderRadius: '9999px', border: '1px solid var(--border)' }}>
                {qty > 1 ? `${ing.name} ${ing.amount * qty}${ing.unit}` : `${ing.name} ${ing.amount}${ing.unit}`}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Vista de Preparación</h1>
          <p className="page-subtitle">{today} — {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</p>
        </div>
        <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ChefHat size={14} /> Modo Cocina
        </span>
      </header>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tab-list">
          {['Todos', ...MEALS].map(m => (
            <button key={m} className={`tab-btn${filterMeal === m ? ' active' : ''}`} onClick={() => setFilterMeal(m)}>
              {m !== 'Todos' ? MEAL_EMOJI[m] + ' ' : ''}{m}
            </button>
          ))}
        </div>

        {/* Toggle vista */}
        <div style={{ display: 'flex', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '3px', gap: '2px', marginLeft: 'auto' }}>
          <button
            onClick={() => setViewMode('comida')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', background: viewMode === 'comida' ? 'var(--p-primary)' : 'transparent', color: viewMode === 'comida' ? 'white' : 'var(--p-text-muted)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <ChefHat size={13} /> Por comida
          </button>
          <button
            onClick={() => setViewMode('persona')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: 'calc(var(--radius) - 2px)', border: 'none', background: viewMode === 'persona' ? 'var(--p-primary)' : 'transparent', color: viewMode === 'persona' ? 'white' : 'var(--p-text-muted)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <User size={13} /> Por persona
          </button>
        </div>
      </div>

      {/* Resumen de qué preparar */}
      {anyData && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <ChefHat size={16} color="var(--warning)" /> Qué preparar en total
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {Object.values(prepSummary).map(({ food, members: mbs, qty }) => (
              food ? <FoodCard key={food.id} foodId={food.id} qty={qty} memberNames={mbs} /> : null
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA POR COMIDA ── */}
      {viewMode === 'comida' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {visibleMeals.map(meal => {
            const slotsForMeal = members
              .map(m => ({ member: m, slot: getSlot(meal, m.name) }))
              .filter(x => x.slot && x.slot.foodIds.some(fid => getFood(fid)));
            if (slotsForMeal.length === 0) return null;

            return (
              <div key={meal} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1.25rem', background: 'var(--p-background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{MEAL_EMOJI[meal]}</span>
                  <h3 style={{ fontWeight: '800', fontSize: '1rem' }}>{meal}</h3>
                  <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
                    <Users size={11} style={{ marginRight: 3 }} />{slotsForMeal.length} pedidos
                  </span>
                </div>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {slotsForMeal.map(({ member, slot }) => (
                    <div key={member.id} style={{ background: slot!.ate ? '#f0fdf4' : 'var(--p-background)', borderRadius: 'var(--radius)', border: `1px solid ${slot!.ate ? '#86efac' : 'var(--border)'}`, overflow: 'hidden' }}>
                      <div style={{ padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '1.1rem' }}>{member.avatar}</span>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', flex: 1 }}>{member.name}</span>
                        {slot!.ate && <Check size={14} color="var(--success)" />}
                      </div>
                      <div style={{ padding: '0.625rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {slot!.foodIds.map(fid => {
                          const food = getFood(fid);
                          if (!food) return null;
                          const qty = slot!.quantities?.[fid] || 1;
                          return (
                            <div key={fid}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{food.name}</span>
                                {qty > 1 && <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '0 5px', borderRadius: '9999px' }}>×{qty}</span>}
                                {food.calories && <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>{food.calories * qty} kcal</span>}
                              </div>
                              {food.ingredients.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                  {food.ingredients.map((ing, i) => (
                                    <span key={i} style={{ fontSize: '0.7rem', fontWeight: '600', background: 'var(--p-surface)', color: 'var(--p-text-muted)', padding: '1px 6px', borderRadius: '9999px', border: '1px solid var(--border)' }}>
                                      {ing.name} {ing.amount * qty}{ing.unit}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA POR PERSONA ── */}
      {viewMode === 'persona' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {members.map(member => {
            const memberSlots = visibleMeals
              .map(meal => ({ meal, slot: getSlot(meal, member.name) }))
              .filter(x => x.slot && x.slot.foodIds.some(fid => getFood(fid)));
            if (memberSlots.length === 0) return null;

            return (
              <div key={member.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1.25rem', background: 'var(--p-background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.375rem' }}>{member.avatar}</span>
                  <h3 style={{ fontWeight: '800', fontSize: '1rem' }}>{member.name}</h3>
                </div>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {memberSlots.map(({ meal, slot }) => (
                    <div key={meal}>
                      <p style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--p-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                        {MEAL_EMOJI[meal]} {meal}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {slot!.foodIds.map(fid => {
                          const food = getFood(fid);
                          if (!food) return null;
                          const qty = slot!.quantities?.[fid] || 1;
                          return (
                            <div key={fid} style={{ padding: '0.5rem 0.75rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: food.ingredients.length > 0 ? '0.25rem' : 0 }}>
                                <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{food.name}</span>
                                {qty > 1 && <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '0 5px', borderRadius: '9999px' }}>×{qty}</span>}
                              </div>
                              {food.ingredients.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                                  {food.ingredients.map((ing, i) => (
                                    <span key={i} style={{ fontSize: '0.68rem', fontWeight: '600', background: 'var(--p-surface)', color: 'var(--p-text-muted)', padding: '1px 5px', borderRadius: '9999px', border: '1px solid var(--border)' }}>
                                      {ing.name} {ing.amount * qty}{ing.unit}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!anyData && (
        <div className="card">
          <div className="empty-state">
            <ChefHat size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontWeight: '700' }}>Sin pedidos para hoy</h3>
            <p>Nadie ha seleccionado comida para {today} aún</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepView;
