import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowLeft, MessageSquare, Package, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Food, Product } from '../context/DataContext';

interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  category: string;
  source: 'menu' | 'extra';
  bought: boolean;
}

const ShoppingMode = () => {
  const { weeklyMenu, foods, products, shoppingNotes, customShoppingItems } = useData();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    // 1. Ingredientes del menú (agregados)
    const agg = new Map<string, { name: string; qty: number; unit: string }>();
    weeklyMenu.forEach(slot => {
      slot.foodIds.forEach(fid => {
        const food = foods.find((f: Food) => f.id === fid);
        const mult = slot.quantities?.[fid] || 1;
        food?.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase()}_${ing.unit}`;
          const ex = agg.get(key);
          if (ex) ex.qty += ing.amount * mult;
          else agg.set(key, { name: ing.name, qty: ing.amount * mult, unit: ing.unit });
        });
      });
    });

    const menuItems: ShoppingItem[] = Array.from(agg.values()).map((val, idx) => {
      const prod = products.find((p: Product) => p.name.toLowerCase() === val.name.toLowerCase());
      return {
        id: `menu_${idx}`,
        name: val.name,
        qty: val.qty,
        unit: val.unit,
        price: prod ? (val.qty / prod.defaultQty) * prod.price : 0,
        category: prod?.category || 'Ingredientes',
        source: 'menu',
        bought: false,
      };
    });

    // 2. Extras no comprados de la semana
    const extraItems: ShoppingItem[] = customShoppingItems
      .filter(i => !i.checked)
      .map(i => ({
        id: `extra_${i.id}`,
        name: i.name,
        qty: i.qty,
        unit: i.unit,
        price: 0,
        category: 'Extras',
        source: 'extra' as const,
        bought: false,
      }));

    setItems([...menuItems, ...extraItems]);
  }, [weeklyMenu, foods, products, customShoppingItems]);

  const toggleItem = (id: string) =>
    setItems(prev => prev.map(item => item.id === id ? { ...item, bought: !item.bought } : item));

  const boughtCount = items.filter(i => i.bought).length;
  const totalPrice = items.filter(i => i.bought).reduce((acc, i) => acc + i.price, 0);

  const menuCount = items.filter(i => i.source === 'menu').length;
  const extraCount = items.filter(i => i.source === 'extra').length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '120px' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--p-surface)', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
        <Link to="/shopping" style={{ color: 'var(--p-text)' }}><ArrowLeft /></Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900' }}>🛒 En el Súper</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)' }}>
            {menuCount > 0 && `${menuCount} ingredientes`}{menuCount > 0 && extraCount > 0 && ' · '}{extraCount > 0 && `${extraCount} extras`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>{boughtCount}/{items.length}</p>
          <div style={{ width: '60px', height: '6px', background: 'var(--p-background)', borderRadius: '999px', marginTop: '3px' }}>
            <div style={{ height: '100%', width: `${items.length ? (boughtCount / items.length) * 100 : 0}%`, background: 'var(--success)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </header>

      {/* Notas */}
      {shoppingNotes.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>
            <MessageSquare size={16} /> Notas
          </h3>
          <ul style={{ paddingLeft: '1.5rem', color: '#92400e', fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>
            {shoppingNotes.map(n => <li key={n.id} style={{ marginBottom: '0.2rem' }}>{n.text}</li>)}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--p-text-muted)', marginTop: '3rem' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontWeight: '700' }}>Lista vacía</p>
          <p style={{ fontSize: '0.875rem' }}>Planifica el menú o agrega extras para ver la lista</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {/* Pendientes */}
          {items.filter(i => !i.bought).map(item => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                padding: '1rem 1.25rem',
                background: 'var(--p-surface)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Circle color="var(--p-text-muted)" size={26} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--p-text)' }}>{item.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', background: item.source === 'menu' ? '#eef2ff' : '#f0fdf4', color: item.source === 'menu' ? 'var(--p-primary)' : 'var(--success)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>
                    {item.source === 'menu' ? 'MENÚ' : 'EXTRA'}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', fontWeight: '700' }}>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}</p>
                </div>
              </div>
              {item.price > 0 && (
                <div style={{ fontWeight: '900', color: 'var(--p-primary)', fontSize: '0.9rem' }}>
                  ${item.price.toFixed(0)}
                </div>
              )}
            </div>
          ))}

          {/* Comprados */}
          {items.filter(i => i.bought).length > 0 && (
            <>
              <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--p-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0' }}>
                <Tag size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Comprados ({items.filter(i => i.bought).length})
              </p>
              {items.filter(i => i.bought).map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    padding: '0.875rem 1.25rem',
                    background: '#f0fdf4',
                    borderRadius: '14px',
                    border: '2px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    opacity: 0.75,
                  }}
                >
                  <CheckCircle2 color="#22c55e" size={26} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem', textDecoration: 'line-through', color: '#166534' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: '600' }}>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}</p>
                  </div>
                  {item.price > 0 && <span style={{ fontWeight: '800', color: '#15803d' }}>${item.price.toFixed(0)}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Footer fijo */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        background: 'var(--p-primary)',
        color: 'white',
        padding: '1.125rem 1.5rem',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>
            {boughtCount} de {items.length} artículos
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: '900' }}>
            {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '—'}
          </p>
        </div>
        <Link to="/shopping" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'white', color: 'var(--p-primary)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.875rem' }}>
            Terminar
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ShoppingMode;
