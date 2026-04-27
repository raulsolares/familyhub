import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  category: string;
  fromMenu: boolean;
  bought: boolean;
}

const ShoppingMode = () => {
  const { weeklyMenu, foods } = useData();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    // 1. Generar lista agregada del menú
    const aggregation = new Map<string, { name: string, qty: number, unit: string }>();
    
    weeklyMenu.forEach(slot => {
      const food = foods.find(f => f.id === slot.foodId);
      if (food) {
        food.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase()}_${ing.unit}`;
          const existing = aggregation.get(key);
          if (existing) {
            existing.qty += ing.amount;
          } else {
            aggregation.set(key, { name: ing.name, qty: ing.amount, unit: ing.unit });
          }
        });
      }
    });

    const menuItems: ShoppingItem[] = Array.from(aggregation.values()).map((val, idx) => ({
      id: `menu_${idx}`,
      name: val.name,
      qty: val.qty,
      unit: val.unit,
      price: 0,
      category: 'Despensa',
      fromMenu: true,
      bought: false
    }));

    // 2. Obtener lista manual
    const savedManual = localStorage.getItem('fh_manual_shopping_v4');
    const manualItems: ShoppingItem[] = savedManual ? JSON.parse(savedManual) : [];

    setItems([...menuItems, ...manualItems]);
  }, [weeklyMenu, foods]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const boughtCount = items.filter(i => i.bought).length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/shopping" style={{ color: 'var(--p-text)' }}><ArrowLeft /></Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>🛒 En el Súper</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)' }}>Marcando lo que ya está en el carrito</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--p-text-muted)', marginTop: '2rem' }}>No hay productos en la lista.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              style={{ 
                padding: '1.25rem', 
                background: item.bought ? '#f0fdf4' : 'white', 
                borderRadius: '16px', 
                border: `2px solid ${item.bought ? '#22c55e' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {item.bought ? <CheckCircle2 color="#22c55e" size={28} /> : <Circle color="#cbd5e1" size={28} />}
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontWeight: '700', 
                  fontSize: '1.125rem',
                  textDecoration: item.bought ? 'line-through' : 'none',
                  color: item.bought ? '#166534' : 'var(--p-text)'
                }}>
                  {item.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  {item.fromMenu && <span style={{ fontSize: '0.6rem', background: item.bought ? '#dcfce7' : '#eef2ff', color: item.bought ? '#166534' : '#4338ca', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>MENÚ</span>}
                  <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)', fontWeight: '700' }}>{item.qty} {item.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '90%', 
        maxWidth: '500px',
        background: 'var(--p-primary)',
        color: 'white',
        padding: '1.25rem',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Llevas {boughtCount} de {items.length}</p>
          <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>¡Buen progreso!</p>
        </div>
        <Link to="/shopping" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'white', color: 'var(--p-primary)', border: 'none', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
            Terminar
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ShoppingMode;
