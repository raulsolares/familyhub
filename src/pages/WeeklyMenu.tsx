import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';

const WeeklyMenu = () => {
  const { weeklyMenu, foods, assignMeal } = useData();

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Merienda', 'Cena'];

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, meal: string } | null>(null);

  const handleSlotClick = (day: string, meal: string) => {
    setSelectedSlot({ day, meal });
    setShowModal(true);
  };

  const handleAssign = (foodId: string) => {
    if (selectedSlot) {
      assignMeal(selectedSlot.day, selectedSlot.meal, foodId);
    }
    setShowModal(false);
    setSelectedSlot(null);
  };

  const getFoodForSlot = (day: string, meal: string) => {
    const item = weeklyMenu.find(w => w.day === day && w.meal === meal);
    if (!item) return null;
    return foods.find(f => f.id === item.foodId);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Menú Semanal</h1>
        <p className="page-subtitle">Asigna platillos de tu catálogo a cada día de la semana</p>
      </header>

      {/* Modal de Asignación */}
      {showModal && selectedSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
              {selectedSlot.meal} del {selectedSlot.day}
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>Comida</th>
              {days.map(day => (
                <th key={day} style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'center' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meals.map(meal => (
              <tr key={meal}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{meal}</td>
                {days.map(day => {
                  const food = getFoodForSlot(day, meal);
                  return (
                    <td key={`${day}-${meal}`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      <div 
                        onClick={() => handleSlotClick(day, meal)}
                        style={{ 
                          padding: '0.5rem', 
                          backgroundColor: food ? '#eef2ff' : '#f1f5f9', 
                          color: food ? 'var(--p-primary)' : 'var(--p-text-muted)',
                          borderRadius: '8px', 
                          fontSize: '0.8rem',
                          minHeight: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: food ? '1px solid #c7d2fe' : '1px dashed #cbd5e1',
                          fontWeight: food ? '700' : '400'
                        }}>
                        {food ? food.name : '+ Agregar'}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title">📖 Mis Recetas / Alimentos</h3>
          <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Gestiona tus platillos favoritos y agrégales ingredientes para la lista de compras.
          </p>
          <Link to="/food">
            <button className="btn-primary">
              Ir al Catálogo de Alimentos
            </button>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">🛒 Lista de Súper Automática</h3>
          <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Se genera basada en todos los ingredientes del menú asignado arriba.
          </p>
          <Link to="/shopping">
            <button style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'white', 
              color: 'var(--p-primary)', 
              border: '2px solid var(--p-primary)', 
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              Ver Lista de Compras
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenu;
