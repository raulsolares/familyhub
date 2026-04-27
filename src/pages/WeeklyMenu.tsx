import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { X, CheckCircle2, User } from 'lucide-react';

const WeeklyMenu = () => {
  const { weeklyMenu, foods, assignMeal, toggleAte } = useData();

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Merienda', 'Cena'];
  const members = ['Papá', 'Mamá', 'Mateo', 'Sofía'];

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, meal: string, member: string } | null>(null);

  const handleSlotClick = (day: string, meal: string, member: string) => {
    setSelectedSlot({ day, meal, member });
    setShowModal(true);
  };

  const handleAssign = (foodId: string) => {
    if (selectedSlot) {
      assignMeal(selectedSlot.day, selectedSlot.meal, foodId, selectedSlot.member);
    }
    setShowModal(false);
    setSelectedSlot(null);
  };

  const getFoodForSlot = (day: string, meal: string, member: string) => {
    return weeklyMenu.find(w => w.day === day && w.meal === meal && w.member === member);
  };

  const today = 'Domingo'; // En producción usaríamos new Date().getDay()

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Planificación Alimenticia</h1>
        <p className="page-subtitle">Menú personalizado para cada miembro de la familia</p>
      </header>

      {/* Vista HOY */}
      <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--p-primary)' }}>
        <h3 className="card-title" style={{ color: 'var(--p-primary)' }}>📅 Resumen de HOY ({today})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {members.map(member => (
            <div key={member} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--p-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{member[0]}</div>
                <h4 style={{ fontWeight: '800' }}>{member}</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {meals.map(meal => {
                  const slot = getFoodForSlot(today, meal, member);
                  const food = foods.find(f => f.id === slot?.foodId);
                  if (!food) return null;
                  return (
                    <div 
                      key={meal} 
                      onClick={() => slot && toggleAte(slot.id)}
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.5rem', 
                        background: slot?.ate ? '#dcfce7' : 'white', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}
                    >
                      <span><strong>{meal}:</strong> {food.name}</span>
                      {slot?.ate ? <CheckCircle2 size={14} color="#166534" /> : <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #cbd5e1' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Asignación */}
      {showModal && selectedSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
               {selectedSlot.meal} - {selectedSlot.member} ({selectedSlot.day})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              <button onClick={() => handleAssign('')} style={{ padding: '0.75rem', background: '#fecaca', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Dejar vacío
              </button>
              {foods.map(food => (
                <button 
                  key={food.id} 
                  onClick={() => handleAssign(food.id)}
                  style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: 'var(--p-text)' }}
                >
                  <span style={{ fontSize: '0.7rem', background: '#eef2ff', color: 'var(--p-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>{food.category}</span>
                  {food.name}
                </button>
              ))}
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
                <tr style={{ background: '#f1f5f9' }}>
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
                      const slot = getFoodForSlot(day, meal, member);
                      const food = foods.find(f => f.id === slot?.foodId);
                      return (
                        <td key={`${day}-${meal}-${member}`} style={{ padding: '0.25rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                          <div 
                            onClick={() => handleSlotClick(day, meal, member)}
                            style={{ 
                              padding: '0.4rem', 
                              backgroundColor: food ? '#eef2ff' : '#f8fafc', 
                              color: food ? 'var(--p-primary)' : '#cbd5e1',
                              borderRadius: '8px', 
                              fontSize: '0.75rem',
                              minHeight: '45px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: food ? '1px solid #c7d2fe' : '1px dashed #e2e8f0',
                              fontWeight: food ? '700' : '400'
                            }}>
                            {food ? food.name : '+'}
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
            <button style={{ padding: '0.75rem 1rem', backgroundColor: 'white', color: 'var(--p-primary)', border: '2px solid var(--p-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600' }}>
              Ver Lista
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenu;
