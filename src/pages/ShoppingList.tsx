import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Tag, ShoppingBasket, X } from 'lucide-react';
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

const ShoppingList = () => {
  const { weeklyMenu, foods } = useData();
  
  const [menuItems, setMenuItems] = useState<ShoppingItem[]>([]);
  const [manualItems, setManualItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fh_manual_shopping_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    localStorage.setItem('fh_manual_shopping_v4', JSON.stringify(manualItems));
  }, [manualItems]);

  const generateFromMenu = () => {
    const aggregation = new Map<string, { name: string, qty: number, unit: string, category: string }>();
    
    weeklyMenu.forEach(slot => {
      const food = foods.find(f => f.id === slot.foodId);
      if (food) {
        food.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase()}_${ing.unit}`;
          const existing = aggregation.get(key);
          if (existing) {
            existing.qty += ing.amount;
          } else {
            aggregation.set(key, { 
              name: ing.name, 
              qty: ing.amount, 
              unit: ing.unit, 
              category: 'Alimentos' 
            });
          }
        });
      }
    });

    const items: ShoppingItem[] = Array.from(aggregation.values()).map((val, idx) => ({
      id: `menu_${idx}`,
      name: val.name,
      qty: val.qty,
      unit: val.unit,
      price: 0, // Podríamos estimar precio base por unidad en el futuro
      category: val.category,
      fromMenu: true,
      bought: false
    }));

    setMenuItems(items);
  };

  useEffect(() => {
    generateFromMenu();
  }, [weeklyMenu, foods]);

  const allItems = [...menuItems, ...manualItems];

  const addManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      qty: 1,
      unit: 'pzas',
      price: 0,
      category: 'Extra',
      fromMenu: false,
      bought: false
    };
    setManualItems([...manualItems, newItem]);
    setNewItemName('');
    setShowForm(false);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Lista de Súper Inteligente</h1>
        <p className="page-subtitle">Cantidades exactas calculadas según tu menú semanal</p>
      </header>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Agregar Producto Extra</h3>
            <form onSubmit={addManualItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Nombre del producto..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              <button type="submit" className="btn-primary">Añadir</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="card-title">🛒 Mi Lista de Compras</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/shopping/mode"><button className="btn-primary" style={{ background: '#10b981' }}><ShoppingBasket size={16}/> Ir al Súper</button></Link>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16}/> Extra</button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem' }}>Producto</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>Cantidad Total</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {allItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700' }}>{item.name}</span>
                      {item.fromMenu && <span style={{ fontSize: '0.6rem', background: '#eef2ff', color: 'var(--p-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>MENÚ</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', color: 'var(--p-primary)' }}>
                    {item.qty} {item.unit}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!item.fromMenu && <button onClick={() => setManualItems(manualItems.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>}
                  </td>
                </tr>
              ))}
              {allItems.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Tu lista está vacía. Planifica tu menú para autogenerarla.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title"><Tag size={20}/> Notas de Compra</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', marginTop: '0.5rem' }}>
            Las cantidades se calculan sumando cada vez que un ingrediente aparece en el menú de cualquier miembro de la familia.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
            <p style={{ fontWeight: '700', color: '#92400e', fontSize: '0.9rem' }}>💡 Tip familiar:</p>
            <p style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.2rem' }}>Revisa la alacena antes de ir al súper para no comprar de más.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
