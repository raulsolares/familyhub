import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShoppingBasket, X, Save, Edit2, MessageSquare, Trash2, Plus, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Product } from '../context/DataContext';

interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  category: string;
  fromMenu: boolean;
}

const ShoppingList = () => {
  const { weeklyMenu, foods, products, addProduct, updateProduct, deleteProduct, shoppingNotes, addShoppingNote, deleteShoppingNote } = useData();
  
  const [activeTab, setActiveTab] = useState<'list' | 'catalog'>('list');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pQty, setPQty] = useState<number>(1);
  const [pUnit, setPUnit] = useState('pzas');
  const [pCategory, setPCategory] = useState('Abarrotes');
  const [newNote, setNewNote] = useState('');

  const categories = ['Frutas y Verduras', 'Proteínas', 'Lácteos', 'Abarrotes', 'Limpieza', 'Higiene', 'Otros'];

  // Agregación de ingredientes del menú
  const getMenuItems = () => {
    const aggregation = new Map<string, { name: string, qty: number, unit: string }>();
    weeklyMenu.forEach(slot => {
      slot.foodIds.forEach(fid => {
        const food = foods.find(f => f.id === fid);
        food?.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase()}_${ing.unit}`;
          const existing = aggregation.get(key);
          if (existing) existing.qty += ing.amount;
          else aggregation.set(key, { name: ing.name, qty: ing.amount, unit: ing.unit });
        });
      });
    });

    return Array.from(aggregation.values()).map((val, idx) => {
      const prod = products.find(p => p.name.toLowerCase() === val.name.toLowerCase());
      return {
        id: `menu_${idx}`,
        name: val.name,
        qty: val.qty,
        unit: val.unit,
        price: prod ? (val.qty / prod.defaultQty) * prod.price : 0,
        category: prod?.category || 'Por clasificar',
        fromMenu: true
      };
    });
  };

  const menuItems = getMenuItems();
  const total = menuItems.reduce((acc, item) => acc + item.price, 0);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: pName, price: pPrice, defaultQty: pQty, unit: pUnit, category: pCategory };
    if (editingProduct) updateProduct(editingProduct.id, payload);
    else addProduct(payload);
    resetProductForm();
  };

  const resetProductForm = () => {
    setPName(''); setPPrice(0); setPQty(1); setEditingProduct(null); setShowProductForm(false);
  };

  const quickAddToCatalog = (item: any) => {
    setPName(item.name); setPUnit(item.unit); setPQty(1); setActiveTab('catalog'); setShowProductForm(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Súper Inteligente</h1>
          <p className="page-subtitle">Sincronización total entre menú y catálogo</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('list')} className="btn-primary" style={{ background: activeTab === 'list' ? 'var(--p-primary)' : 'var(--p-surface)', color: activeTab === 'list' ? 'white' : 'var(--p-text)' }}>Lista Actual</button>
          <button onClick={() => setActiveTab('catalog')} className="btn-primary" style={{ background: activeTab === 'catalog' ? 'var(--p-primary)' : 'var(--p-surface)', color: activeTab === 'catalog' ? 'white' : 'var(--p-text)' }}>Catálogo Base</button>
        </div>
      </header>

      {activeTab === 'catalog' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 className="card-title">Gestión de Productos y Precios</h3>
            <button onClick={() => setShowProductForm(true)} className="btn-primary">+ Nuevo Producto</button>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} style={{ background: 'var(--p-background)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end', border: '1px solid var(--border)' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Nombre</label><input required value={pName} onChange={e => setPName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Precio ($)</label><input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Unidad</label><select value={pUnit} onChange={e => setPUnit(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}><option>pzas</option><option>ml</option><option>gr</option><option>kg</option><option>lt</option></select></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Categoría</label><select value={pCategory} onChange={e => setPCategory(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem' }}><Save size={18}/></button>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}><th style={{ padding: '1rem' }}>Producto</th><th style={{ padding: '1rem' }}>Precio Base</th><th style={{ padding: '1rem' }}>Categoría</th><th style={{ padding: '1rem' }}></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{p.name} <span style={{ fontSize: '0.6rem', color: 'var(--p-text-muted)' }}>({p.defaultQty}{p.unit})</span></td>
                    <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--p-primary)' }}>${p.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-blue">{p.category}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                       <button onClick={() => { setEditingProduct(p); setPName(p.name); setPPrice(p.price); setPQty(p.defaultQty); setPUnit(p.unit); setPCategory(p.category); setShowProductForm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}><Edit2 size={16} color="var(--p-text-muted)"/></button>
                       <button onClick={() => deleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 className="card-title">Ingredientes del Menú</h3>
              <Link to="/shopping/mode" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ background: '#10b981', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><ShoppingBasket size={18}/> IR AL SÚPER</button></Link>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}><th style={{ padding: '1rem' }}>Ingrediente</th><th style={{ padding: '1rem' }}>Cant. Necesaria</th><th style={{ padding: '1rem' }}>Costo Est.</th><th style={{ padding: '1rem' }}></th></tr></thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '700' }}>{item.name}</td>
                      <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--p-primary)' }}>{item.qty} {item.unit}</td>
                      <td style={{ padding: '1rem', fontWeight: '700' }}>{item.price > 0 ? `$${item.price.toFixed(2)}` : '--'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {item.price === 0 && <button onClick={() => quickAddToCatalog(item)} style={{ background: 'var(--p-primary)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '700' }}>+ Catálogo</button>}
                      </td>
                    </tr>
                  ))}
                  {menuItems.length === 0 && <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--p-text-muted)' }}>El menú semanal está vacío.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 className="card-title"><MessageSquare size={20}/> Notas y Recordatorios</h3>
              <form onSubmit={e => { e.preventDefault(); if(newNote) { addShoppingNote(newNote); setNewNote(''); }}} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Ej: Traer servilletas..." style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--p-background)', color: 'var(--p-text)' }} />
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem' }}><Plus size={20}/></button>
              </form>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {shoppingNotes.map(n => (
                  <div key={n.id} style={{ background: '#fffbeb', padding: '0.8rem', borderRadius: '12px', border: '1px dashed #f59e0b', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#92400e' }}>{n.text}</span>
                    <button onClick={() => deleteShoppingNote(n.id)} style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer' }}><X size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'var(--p-primary)', color: 'white' }}>
              <h3 className="card-title" style={{ color: 'white' }}><Tag size={20}/> Presupuesto Estimado</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal Ingredientes:</span><span style={{ fontWeight: '800' }}>${total.toFixed(2)}</span></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                    <span style={{ fontWeight: '700' }}>TOTAL:</span>
                    <span style={{ fontWeight: '900' }}>${total.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
