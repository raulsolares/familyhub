import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShoppingBasket, X, Save, Edit2, MessageSquare, Trash2 } from 'lucide-react';
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
  bought: boolean;
}

const ShoppingList = () => {
  const { weeklyMenu, foods, products, addProduct, updateProduct, deleteProduct, shoppingNotes, addShoppingNote, deleteShoppingNote } = useData();
  
  const [menuItems, setMenuItems] = useState<ShoppingItem[]>([]);
  const [manualItems, setManualItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fh_manual_shopping_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'list' | 'catalog'>('list');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Formularios
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number | ''>('');
  const [pQty, setPQty] = useState<number | ''>('');
  const [pUnit, setPUnit] = useState('pzas');
  const [pCategory, setPCategory] = useState('Abarrotes');
  
  const [newNote, setNewNote] = useState('');
  
  // Extra list form
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraId, setExtraId] = useState('');
  const [extraQty, setExtraQty] = useState<number>(1);

  const categories = ['Frutas y Verduras', 'Abarrotes', 'Lácteos', 'Carnes', 'Limpieza', 'Higiene', 'Otros'];

  useEffect(() => {
    localStorage.setItem('fh_manual_shopping_v8', JSON.stringify(manualItems));
  }, [manualItems]);

  const generateFromMenu = () => {
    const aggregation = new Map<string, { name: string, qty: number, unit: string }>();
    
    weeklyMenu.forEach(slot => {
      const food = foods.find(f => f.id === slot.foodIds[0]); // Simplificado para demo, idealmente itera foodIds
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

    const items: ShoppingItem[] = Array.from(aggregation.values()).map((val, idx) => {
      // Buscar si existe en catálogo para obtener precio estimado
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

    setMenuItems(items);
  };

  useEffect(() => {
    generateFromMenu();
  }, [weeklyMenu, foods, products]);

  const allItems = [...menuItems, ...manualItems];
  const total = allItems.reduce((acc, item) => acc + item.price, 0);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: pName, price: Number(pPrice), defaultQty: Number(pQty), unit: pUnit, category: pCategory };
    if (editingProduct) updateProduct(editingProduct.id, payload);
    else addProduct(payload);
    
    setPName(''); setPPrice(''); setPQty(''); setEditingProduct(null); setShowProductForm(false);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p); setPName(p.name); setPPrice(p.price); setPQty(p.defaultQty); setPUnit(p.unit); setPCategory(p.category);
    setShowProductForm(true);
  };

  const addExtraFromCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === extraId);
    if (!prod) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: prod.name,
      qty: extraQty * prod.defaultQty,
      unit: prod.unit,
      price: extraQty * prod.price,
      category: prod.category,
      fromMenu: false,
      bought: false
    };
    setManualItems([...manualItems, newItem]);
    setShowAddExtra(false);
    setExtraQty(1);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if(newNote.trim()) {
      addShoppingNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Súper Inteligente</h1>
          <p className="page-subtitle">Calcula ingredientes y gestiona tu catálogo de productos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('list')} className="btn-primary" style={{ background: activeTab === 'list' ? 'var(--p-primary)' : 'var(--p-surface)', color: activeTab === 'list' ? 'white' : 'var(--p-text)', border: '1px solid var(--p-primary)' }}>Lista Actual</button>
          <button onClick={() => setActiveTab('catalog')} className="btn-primary" style={{ background: activeTab === 'catalog' ? 'var(--p-primary)' : 'var(--p-surface)', color: activeTab === 'catalog' ? 'white' : 'var(--p-text)', border: '1px solid var(--p-primary)' }}>Catálogo Base</button>
        </div>
      </header>

      {/* Catálogo de Productos */}
      {activeTab === 'catalog' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="card-title">Catálogo de Precios y Productos</h3>
            <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="btn-primary">+ Nuevo Producto</button>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: '1rem', alignItems: 'end' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Nombre</label><input required value={pName} onChange={e => setPName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Categoría</label><select value={pCategory} onChange={e => setPCategory(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Precio ($)</label><input required type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Cant.</label><input required type="number" value={pQty} onChange={e => setPQty(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Unidad</label><select value={pUnit} onChange={e => setPUnit(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}><option>pzas</option><option>ml</option><option>gr</option><option>kg</option><option>lt</option><option>paq</option></select></div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}><Save size={16}/></button>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ textAlign: 'left', padding: '1rem' }}>Producto</th><th style={{ textAlign: 'left', padding: '1rem' }}>Presentación</th><th style={{ textAlign: 'right', padding: '1rem' }}>Precio Base</th><th style={{ textAlign: 'right', padding: '1rem' }}></th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>{p.name} <span style={{ fontSize: '0.65rem', background: 'var(--p-background)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>{p.category}</span></td>
                  <td style={{ padding: '1rem' }}>{p.defaultQty} {p.unit}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', color: 'var(--p-primary)' }}>${p.price}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleEditProduct(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}><Edit2 size={16} color="var(--p-text-muted)"/></button>
                    <button onClick={() => deleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lista Actual */}
      {activeTab === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Lista Consolidada</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowAddExtra(true)} className="btn-primary" style={{ background: 'var(--p-surface)', color: 'var(--p-primary)', border: '2px solid var(--p-primary)' }}>+ Agregar del Catálogo</button>
              </div>
            </div>

            {showAddExtra && (
              <form onSubmit={addExtraFromCatalog} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div style={{ flex: 2 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Producto del Catálogo</label><select required value={extraId} onChange={e => setExtraId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }}><option value="">Selecciona...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.defaultQty}{p.unit}) - ${p.price}</option>)}</select></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Cantidad a comprar</label><input required type="number" min="1" value={extraQty} onChange={e => setExtraQty(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem' }}>Añadir</button>
                <button type="button" onClick={() => setShowAddExtra(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem' }}><X color="#ef4444"/></button>
              </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ textAlign: 'left', padding: '1rem' }}>Producto</th><th style={{ textAlign: 'right', padding: '1rem' }}>Cant. Total</th><th style={{ textAlign: 'right', padding: '1rem' }}>Est. $</th><th style={{ textAlign: 'right', padding: '1rem' }}></th></tr></thead>
              <tbody>
                {allItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '700' }}>{item.name}</span>
                        {item.fromMenu && <span style={{ fontSize: '0.6rem', background: '#eef2ff', color: 'var(--p-primary)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>MENÚ</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', color: 'var(--p-primary)' }}>{item.qty} {item.unit}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>${item.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{!item.fromMenu && <button onClick={() => setManualItems(manualItems.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 className="card-title"><MessageSquare size={20}/> Notas y Avisos</h3>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Ej: Traer leche deslactosada..." style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>+</button>
              </form>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {shoppingNotes.map(note => (
                  <div key={note.id} style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #f59e0b', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{note.text}</span>
                    <button onClick={() => deleteShoppingNote(note.id)} style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer' }}><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title"><Tag size={20}/> Resumen</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '1rem' }}><span>Subtotal:</span><span>${total.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--p-text-muted)', marginTop: '0.5rem' }}><span>Artículos:</span><span>{allItems.length}</span></div>
              <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: 'var(--p-primary)' }}><span>Total Estimado:</span><span>${total.toFixed(2)}</span></div>
              
              <Link to="/shopping/mode" style={{ textDecoration: 'none' }}>
                <button style={{ marginTop: '1.5rem', width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', boxShadow: '0 8px 15px rgba(16, 185, 129, 0.3)' }}>
                  <ShoppingBasket size={20}/> Ir al Súper
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
