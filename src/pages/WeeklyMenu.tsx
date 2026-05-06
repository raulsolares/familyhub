import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { X, CheckCircle2, User, Plus, Minus, RefreshCw } from 'lucide-react';

const WeeklyMenu = () => {
  const { weeklyMenu, foods, assignMeal, toggleAte, clearWeeklyMenu } = useData();
  const [confirmNewWeek, setConfirmNewWeek] = useState(false);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Merienda', 'Cena'];
  const members = ['Raúl', 'Tania', 'Alan', 'Aria'];

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, meal: string, member: string } | null>(null);
  
  // Estado para el modal de asignación múltiple
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [foodQtys, setFoodQtys] = useState<Record<string, number>>({});

  const handleSlotClick = (day: string, meal: string, member: string) => {
    setSelectedSlot({ day, meal, member });
    setSelectedMembers([member]);
    
    // Cargar los platillos actuales de esa celda si existen
    const existing = weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === member);
    setSelectedFoodIds(existing ? existing.foodIds : []);
    setFoodQtys(existing?.quantities || {});

    setShowModal(true);
  };

  const handleAssign = () => {
    if (selectedSlot) {
      selectedMembers.forEach(m => {
        assignMeal(selectedSlot.day, selectedSlot.meal, selectedFoodIds, m, foodQtys);
      });
    }
    setShowModal(false);
    setSelectedSlot(null);
  };

  const toggleModalMember = (m: string) => {
    if (selectedMembers.includes(m)) {
      if (selectedMembers.length > 1) setSelectedMembers(selectedMembers.filter(x => x !== m));
    } else {
      setSelectedMembers([...selectedMembers, m]);
    }
  };

  const toggleModalFood = (id: string) => {
    if (selectedFoodIds.includes(id)) {
      setSelectedFoodIds(selectedFoodIds.filter(x => x !== id));
      setFoodQtys(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setSelectedFoodIds([...selectedFoodIds, id]);
      setFoodQtys(prev => ({ ...prev, [id]: prev[id] || 1 }));
    }
  };

  const setQty = (id: string, delta: number) => {
    setFoodQtys(prev => {
      const next = Math.max(1, (prev[id] || 1) + delta);
      return { ...prev, [id]: next };
    });
  };

  const getMenuForSlot = (day: string, meal: string, member: string) => {
    return weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === member);
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = dayNames[new Date().getDay()];

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Planificación Alimenticia</h1>
          <p className="page-subtitle">Menú personalizado para cada miembro de la familia</p>
        </div>
        {weeklyMenu.length > 0 && (
          <button
            onClick={() => setConfirmNewWeek(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--p-background)', color: 'var(--p-text-muted)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Nueva semana
          </button>
        )}
      </header>

      {confirmNewWeek && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <RefreshCw size={32} color="var(--p-primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>¿Empezar nueva semana?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', marginBottom: '1.5rem' }}>
              Se borrará todo el menú planificado. El catálogo de alimentos se mantiene intacto.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmNewWeek(false)} style={{ flex: 1, padding: '0.75rem', background: 'var(--p-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: '700', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={() => { clearWeeklyMenu(); setConfirmNewWeek(false); }}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--p-primary)', border: 'none', borderRadius: 'var(--radius)', color: 'white', fontWeight: '800', cursor: 'pointer' }}
              >
                Sí, nueva semana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista HOY */}
      <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--p-primary)' }}>
        <h3 className="card-title" style={{ color: 'var(--p-primary)' }}>📅 Resumen de HOY ({today})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {members.map(member => (
            <div key={member} style={{ padding: '1rem', background: 'var(--p-background)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--p-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{member[0]}</div>
                <h4 style={{ fontWeight: '800' }}>{member}</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {meals.map(meal => {
                  const slot = getMenuForSlot(today, meal, member);
                  if (!slot || slot.foodIds.length === 0) return null;
                  
                  const slotFoods = slot.foodIds.map(fid => foods.find(f => f.id === fid)?.name).filter(Boolean);
                  
                  return (
                    <div 
                      key={meal} 
                      onClick={() => slot && toggleAte(slot.id)}
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.5rem', 
                        background: slot.ate ? '#dcfce7' : 'white', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--p-primary)' }}>{meal}:</strong> 
                        <div style={{ fontWeight: '600' }}>{slotFoods.join(' + ')}</div>
                      </div>
                      {slot.ate ? <CheckCircle2 size={16} color="#166534" /> : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #cbd5e1', marginLeft: '0.5rem' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Asignación Múltiple */}
      {showModal && selectedSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Asignar {selectedSlot.meal}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', marginBottom: '1.5rem' }}>{selectedSlot.day}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>¿Para quién es esta comida?</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {members.map(m => (
                  <button 
                    key={m} 
                    onClick={() => toggleModalMember(m)}
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '999px', 
                      border: '1px solid var(--p-primary)',
                      background: selectedMembers.includes(m) ? 'var(--p-primary)' : 'transparent',
                      color: selectedMembers.includes(m) ? 'white' : 'var(--p-primary)',
                      fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>Selecciona platillos y porciones:</p>
              {foods.map(food => {
                const selected = selectedFoodIds.includes(food.id);
                const qty = foodQtys[food.id] || 1;
                return (
                  <div
                    key={food.id}
                    style={{
                      padding: '0.625rem 0.75rem',
                      background: selected ? '#eef2ff' : 'var(--p-background)',
                      border: selected ? '2px solid var(--p-primary)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <button
                      onClick={() => toggleModalFood(food.id)}
                      style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', background: 'var(--p-primary)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', flexShrink: 0 }}>{food.categories[0]}</span>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--p-text)' }}>{food.name}</span>
                        {food.calories && <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)' }}>{food.calories} kcal</span>}
                      </div>
                    </button>
                    {selected ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                        <button onClick={() => setQty(food.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ fontWeight: '800', fontSize: '0.875rem', color: 'var(--p-primary)', width: '24px', textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => setQty(food.id, 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => toggleModalFood(food.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-text-muted)' }}>
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <button onClick={() => { setSelectedFoodIds([]); handleAssign(); }} style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Vaciar
              </button>
              <button onClick={handleAssign} className="btn-primary" style={{ padding: '1rem', borderRadius: '12px' }}>
                Guardar Menú
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Miembro / Comida</th>
              {days.map(day => (
                <th key={day} style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'center' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <React.Fragment key={member}>
                <tr style={{ background: 'var(--p-background)' }}>
                  <td colSpan={8} style={{ padding: '0.5rem 1rem', fontWeight: '800', fontSize: '0.9rem', color: 'var(--p-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} /> {member}
                    </div>
                  </td>
                </tr>
                {meals.map(meal => (
                  <tr key={`${member}-${meal}`}>
                    <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: '600' }}>{meal}</td>
                    {days.map(day => {
                      const slot = getMenuForSlot(day, meal, member);
                      const hasFood = slot && slot.foodIds.length > 0;
                      
                      return (
                        <td key={`${day}-${meal}-${member}`} style={{ padding: '0.25rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                          <div 
                            onClick={() => handleSlotClick(day, meal, member)}
                            style={{ 
                              padding: '0.4rem', 
                              backgroundColor: hasFood ? '#eef2ff' : 'var(--p-background)', 
                              color: hasFood ? 'var(--p-primary)' : 'var(--p-text-muted)',
                              borderRadius: '8px', 
                              fontSize: '0.7rem',
                              minHeight: '50px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: hasFood ? '1px solid #c7d2fe' : '1px dashed var(--border)',
                              fontWeight: hasFood ? '700' : '400',
                              gap: '0.2rem'
                            }}>
                            {hasFood ? (
                              slot.foodIds.map(fid => {
                                const fName = foods.find(f => f.id === fid)?.name;
                                return fName ? <span key={fid}>{fName}</span> : null;
                              })
                            ) : <Plus size={14} color="#cbd5e1" />}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title">📖 Catálogo de Alimentos</h3>
          <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Gestiona los ingredientes detallados para tu lista de súper.
          </p>
          <Link to="/food">
            <button className="btn-primary">Ir al Catálogo</button>
          </Link>
        </div>
        <div className="card">
          <h3 className="card-title">🛒 Lista de Súper Inteligente</h3>
          <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Calcula automáticamente las cantidades basadas en todo el menú familiar.
          </p>
          <Link to="/shopping">
            <button style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--p-surface)', color: 'var(--p-primary)', border: '2px solid var(--p-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600' }}>
              Ver Lista
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenu;
