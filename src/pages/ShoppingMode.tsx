import { useState } from 'react';
import { CheckCircle2, Circle, ArrowLeft, MessageSquare, Package, Tag, DollarSign, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useShoppingWeek } from '../hooks/useShoppingWeek';
import WeekSwitch from '../components/WeekSwitch';
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
  customId?: string; // id en customShoppingItems para extras
}

const ShoppingMode = () => {
  const {
    foods, products, addProduct, updateProduct,
    shoppingNotes, customShoppingItems, updateCustomShoppingItem,
    extraItems, addExtraItem, updateExtraItem,
  } = useData();
  const { week, setWeek, menu: weeklyMenu } = useShoppingWeek();

  // Lo marcado como comprado sobrevive recargas mientras se está en el súper
  const [boughtKeys, setBoughtKeys] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fh_shop_bought') || '[]'); } catch { return []; }
  });
  const saveBought = (next: string[]) => {
    setBoughtKeys(next);
    try { localStorage.setItem('fh_shop_bought', JSON.stringify(next)); } catch { /* sin almacenamiento */ }
  };
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const buildItems = (): ShoppingItem[] => {
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

    const menuItems: ShoppingItem[] = Array.from(agg.entries()).map(([key, val]) => {
      const prod = products.find((p: Product) => p.name.toLowerCase() === val.name.toLowerCase());
      return {
        id: `menu_${key}`,
        name: val.name,
        qty: val.qty,
        unit: val.unit,
        price: prod ? (val.qty / prod.defaultQty) * prod.price : 0,
        category: prod?.category || 'Ingredientes',
        source: 'menu',
        bought: false,
      };
    });

    const extraList: ShoppingItem[] = customShoppingItems
      .filter(i => !i.checked)
      .map(i => {
        // Buscar precio en catálogo de extras si el item no tiene precio propio
        const catalogItem = extraItems.find(ei => ei.name.toLowerCase() === i.name.toLowerCase());
        const price = i.price ?? catalogItem?.price ?? 0;
        return {
          id: `extra_${i.id}`,
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          price,
          category: 'Extras',
          source: 'extra' as const,
          bought: false,
          customId: i.id,
        };
      });

    return [...menuItems, ...extraList].map(i => ({ ...i, bought: boughtKeys.includes(i.id) }));
  };
  const items = buildItems();

  const toggleItem = (id: string) =>
    saveBought(boughtKeys.includes(id) ? boughtKeys.filter(k => k !== id) : [...boughtKeys, id]);

  const savePrice = (item: ShoppingItem) => {
    const price = parseFloat(tempPrice);
    if (isNaN(price) || price < 0) { setEditingPriceId(null); return; }


    if (item.source === 'menu') {
      // Guardar/actualizar en catálogo de productos
      const existing = products.find((p: Product) => p.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        updateProduct(existing.id, { price, defaultQty: item.qty });
      } else {
        addProduct({ name: item.name, price, defaultQty: item.qty, unit: item.unit, category: 'Ingredientes' });
      }
    } else {
      // Guardar en catálogo de extras y en el item de la lista
      if (item.customId) updateCustomShoppingItem(item.customId, { price });
      const existingExtra = extraItems.find(ei => ei.name.toLowerCase() === item.name.toLowerCase());
      if (existingExtra) {
        updateExtraItem(existingExtra.id, { price });
      } else {
        addExtraItem({ name: item.name, unit: item.unit, category: 'Otros', price });
      }
    }
    setEditingPriceId(null);
  };

  const boughtCount = items.filter(i => i.bought).length;
  const totalAll = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalBought = items.filter(i => i.bought).reduce((acc, i) => acc + i.price * i.qty, 0);
  const pendingItems = items.filter(i => !i.bought);
  const boughtItems = items.filter(i => i.bought);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '130px' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--p-surface)', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
        <Link to={`/shopping?week=${week}`} style={{ color: 'var(--p-text)' }} aria-label="Regresar"><ArrowLeft /></Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900' }}>🛒 En el Súper</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--p-text-muted)' }}>{items.length} artículos · est. ${totalAll.toFixed(0)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>{boughtCount}/{items.length}</p>
          <div style={{ width: '60px', height: '6px', background: 'var(--p-background)', borderRadius: '999px', marginTop: '3px' }}>
            <div style={{ height: '100%', width: `${items.length ? (boughtCount / items.length) * 100 : 0}%`, background: 'var(--success)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </header>

      <WeekSwitch value={week} onChange={setWeek} className="full" />
      <div style={{ height: '1rem' }} />

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
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {pendingItems.map(item => (
            <div key={item.id} style={{ background: 'var(--p-surface)', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div
                onClick={() => { if (editingPriceId !== item.id) toggleItem(item.id); }}
                style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
              >
                <Circle color="var(--p-text-muted)" size={24} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                    <span style={{ fontSize: '0.7rem', background: item.source === 'menu' ? '#eef2ff' : '#f0fdf4', color: item.source === 'menu' ? 'var(--p-primary)' : 'var(--success)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                      {item.source === 'menu' ? 'MENÚ' : 'EXTRA'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}</span>
                  </div>
                </div>

                {editingPriceId === item.id ? (
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>$</span>
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempPrice}
                      onChange={e => setTempPrice(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') savePrice(item); if (e.key === 'Escape') setEditingPriceId(null); }}
                      style={{ width: '70px', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--p-primary)', fontSize: '0.875rem', fontWeight: '700' }}
                    />
                    <button onClick={() => savePrice(item)} style={{ padding: '4px 8px', background: 'var(--p-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      <Check size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setEditingPriceId(item.id); setTempPrice(item.price > 0 ? item.price.toFixed(2) : ''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '4px 8px', background: item.price > 0 ? 'var(--p-primary-50)' : 'var(--p-background)', border: `1px solid ${item.price > 0 ? 'var(--p-primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', color: item.price > 0 ? 'var(--p-primary)' : 'var(--p-text-muted)', fontWeight: '800', fontSize: '0.8rem' }}
                  >
                    <DollarSign size={11} />
                    {item.price > 0 ? item.price.toFixed(0) : '—'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {boughtItems.length > 0 && (
            <>
              <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--p-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Tag size={11} /> Comprados ({boughtItems.length})
              </p>
              {boughtItems.map(item => (
                <div key={item.id} onClick={() => toggleItem(item.id)} style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '14px', border: '2px solid #86efac', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', opacity: 0.75 }}>
                  <CheckCircle2 color="#22c55e" size={24} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', textDecoration: 'line-through', color: '#166534' }}>{item.name}</p>
                    <p style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '600' }}>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}</p>
                  </div>
                  {item.price > 0 && <span style={{ fontWeight: '800', color: '#15803d', fontSize: '0.875rem' }}>${item.price.toFixed(0)}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Footer fijo */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', background: 'var(--p-primary)', color: 'white', padding: '1rem 1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>{boughtCount} de {items.length} artículos</p>
          <p style={{ fontSize: '1.25rem', fontWeight: '900' }}>
            {totalBought > 0 ? `$${totalBought.toFixed(2)}` : totalAll > 0 ? `est. $${totalAll.toFixed(2)}` : '—'}
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
