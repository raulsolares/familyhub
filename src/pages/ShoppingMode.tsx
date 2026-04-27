import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowLeft, MessageSquare } from 'lucide-react';
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
  const { weeklyMenu, foods, products, shoppingNotes } = useData();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    // 1. Generar lista agregada del menú
    const aggregation = new Map<string, { name: string, qty: number, unit: string }>();
    
    weeklyMenu.forEach(slot => {
      const food = foods.find(f => f.id === slot.foodIds[0]); // Para demo
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

    const menuItems: ShoppingItem[] = Array.from(aggregation.values()).map((val, idx) => {
      const catMatch = products.find(p => p.name.toLowerCase() === val.name.toLowerCase());
      const estPrice = catMatch ? (val.qty / catMatch.defaultQty) * catMatch.price : 0;
      return {
        id: `menu_${idx}`,
        name: val.name,
        qty: val.qty,
        unit: val.unit,
        price: estPrice,
        category: catMatch?.category || 'Despensa',
        fromMenu: true,
        bought: false
      };
    });

    // 2. Obtener lista manual
    const savedManual = localStorage.getItem('fh_manual_shopping_v8');
    const manualItems: ShoppingItem[] = savedManual ? JSON.parse(savedManual) : [];

    setItems([...menuItems, ...manualItems]);
  }, [weeklyMenu, foods, products]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const boughtCount = items.filter(i => i.bought).length;
  const totalBought = items.filter(i => i.bought).reduce((acc, i) => acc + i.price, 0);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '120px' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--p-surface)', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
        <Link to="/shopping" style={{ color: 'var(--p-text)' }}><ArrowLeft /></Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900' }}>🛒 En el Súper</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)' }}>Lista inteligente sincronizada</p>
        </div>
      </header>

      {shoppingNotes.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>
            <MessageSquare size={16}/> Avisos Importantes
          </h3>
          <ul style={{ paddingLeft: '1.5rem', color: '#92400e', fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>
            {shoppingNotes.map(n => <li key={n.id} style={{ marginBottom: '0.2rem' }}>{n.text}</li>)}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--p-text-muted)', marginTop: '2rem' }}>No hay productos en la lista.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              style={{ 
                padding: '1.25rem', 
                background: item.bought ? '#f0fdf4' : 'var(--p-surface)', 
                borderRadius: '16px', 
                border: `2px solid ${item.bought ? '#22c55e' : 'transparent'}`,
                boxShadow: item.bought ? 'none' : 'var(--shadow-premium)',
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: item.bought ? 0.7 : 1
              }}
            >
              {item.bought ? <CheckCircle2 color="#22c55e" size={28} /> : <Circle color="var(--p-text-muted)" size={28} />}
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontWeight: '800', 
                  fontSize: '1.1rem',
                  textDecoration: item.bought ? 'line-through' : 'none',
                  color: item.bought ? '#166534' : 'var(--p-text)'
                }}>
                  {item.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  {item.fromMenu && <span style={{ fontSize: '0.6rem', background: item.bought ? '#dcfce7' : '#eef2ff', color: item.bought ? '#166534' : 'var(--p-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>MENÚ</span>}
                  <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', fontWeight: '700' }}>{item.qty} {item.unit}</p>
                </div>
              </div>
              <div style={{ fontWeight: '900', color: item.bought ? '#166534' : 'var(--p-primary)' }}>
                ${item.price.toFixed(2)}
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
          <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>Progreso: {boughtCount} de {items.length}</p>
          <p style={{ fontSize: '1.25rem', fontWeight: '900' }}>Total: ${totalBought.toFixed(2)}</p>
        </div>
        <Link to="/shopping" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'white', color: 'var(--p-primary)', border: 'none', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            Terminar
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ShoppingMode;
