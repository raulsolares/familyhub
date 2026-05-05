import { useState } from 'react';
import { ChefHat, Check, Users } from 'lucide-react';
import { useData } from '../context/DataContext';

const MEALS = ['Desayuno', 'Lunch', 'Comida', 'Cena'];

const MEAL_EMOJI: Record<string, string> = {
  Desayuno: '🌅',
  Lunch: '🥪',
  Comida: '🍽️',
  Cena: '🌙',
};

const PrepView = () => {
  const { weeklyMenu, foods, members } = useData();
  const [filterMeal, setFilterMeal] = useState<string>('Todos');

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = dayNames[new Date().getDay()];

  const visibleMeals = filterMeal === 'Todos' ? MEALS : [filterMeal];

  // Para cada tiempo de comida: qué pidió cada miembro
  const getMealSlot = (meal: string, memberName: string) =>
    weeklyMenu.find(w => w.day === today && w.meal === meal && w.member === memberName);

  const getFoodName = (foodId: string) => foods.find(f => f.id === foodId)?.name || foodId;

  // Agrupa todos los items para ver qué hay que preparar en total
  const prepSummary: Record<string, { members: string[]; qty: number }> = {};
  visibleMeals.forEach(meal => {
    members.forEach(m => {
      const slot = getMealSlot(meal, m.name);
      if (!slot || slot.foodIds.length === 0) return;
      slot.foodIds.forEach(fid => {
        const qty = slot.quantities?.[fid] || 1;
        const key = getFoodName(fid);
        if (!prepSummary[key]) prepSummary[key] = { members: [], qty: 0 };
        prepSummary[key].members.push(m.name);
        prepSummary[key].qty += qty;
      });
    });
  });

  const anyMealData = Object.keys(prepSummary).length > 0;

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Vista de Preparación</h1>
          <p className="page-subtitle">
            {today} — {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ChefHat size={14} /> Modo Cocina
        </span>
      </header>

      {/* Filtro de tiempo */}
      <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
        {['Todos', ...MEALS].map(m => (
          <button
            key={m}
            className={`tab-btn${filterMeal === m ? ' active' : ''}`}
            onClick={() => setFilterMeal(m)}
          >
            {m !== 'Todos' ? MEAL_EMOJI[m] + ' ' : ''}{m}
          </button>
        ))}
      </div>

      {/* Resumen de preparación total */}
      {anyMealData && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <ChefHat size={16} color="var(--warning)" /> Qué preparar en total
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(prepSummary).map(([name, info]) => (
              <div key={name} style={{ padding: '0.5rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{name}</span>
                {info.qty > 1 && (
                  <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '0 6px', borderRadius: '9999px' }}>
                    ×{info.qty}
                  </span>
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>
                  ({info.members.join(', ')})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista por tiempo de comida */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {visibleMeals.map(meal => {
          const slotsForMeal = members
            .map(m => ({ member: m, slot: getMealSlot(meal, m.name) }))
            .filter(x => x.slot && x.slot.foodIds.length > 0);

          if (slotsForMeal.length === 0) return null;

          return (
            <div key={meal} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Header del tiempo */}
              <div style={{ padding: '0.875rem 1.25rem', background: 'var(--p-background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{MEAL_EMOJI[meal]}</span>
                <h3 style={{ fontWeight: '800', fontSize: '1rem' }}>{meal}</h3>
                <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
                  <Users size={11} style={{ marginRight: '3px' }} />{slotsForMeal.length} pedidos
                </span>
              </div>

              {/* Pedidos por miembro */}
              <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {slotsForMeal.map(({ member, slot }) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', background: slot!.ate ? '#f0fdf4' : 'var(--p-background)', borderRadius: 'var(--radius)', border: `1px solid ${slot!.ate ? '#86efac' : 'var(--border)'}` }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{member.avatar}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.875rem', width: '60px', flexShrink: 0, color: 'var(--p-text-muted)' }}>
                      {member.name}
                    </span>
                    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {slot!.foodIds.map(fid => {
                        const qty = slot!.quantities?.[fid] || 1;
                        return (
                          <span key={fid} style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {getFoodName(fid)}
                            {qty > 1 && (
                              <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '0 5px', borderRadius: '9999px' }}>
                                ×{qty}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                    {slot!.ate && <Check size={16} color="var(--success)" style={{ flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!anyMealData && (
          <div className="card">
            <div className="empty-state">
              <ChefHat size={36} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontWeight: '700' }}>Sin pedidos para hoy</h3>
              <p>Nadie ha seleccionado comida para {today} aún</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepView;
