import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, X, Save, Edit2, Trash2, Plus, Check, Archive, Package } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Product, Food } from '../context/DataContext';

type Tab = 'lista' | 'extras' | 'catalogo';

const UNITS = ['pzas', 'kg', 'gr', 'lt', 'ml', 'paq', 'bolsa', 'caja'];
const CATEGORIES = ['Frutas y Verduras', 'Proteínas', 'Lácteos', 'Abarrotes', 'Limpieza', 'Higiene', 'Panadería', 'Otros'];

const ShoppingList = () => {
  const {
    weeklyMenu, foods, products, addProduct, updateProduct, deleteProduct,
    customShoppingItems, addCustomShoppingItem, toggleCustomShoppingItem,
    deleteCustomShoppingItem, clearCustomShoppingItems,
  } = useData();

  const [activeTab, setActiveTab] = useState<Tab>('lista');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Product form
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pQty, setPQty] = useState<number>(1);
  const [pUnit, setPUnit] = useState('pzas');
  const [pCategory, setPCategory] = useState('Abarrotes');

  // Extra item form
  const [extraName, setExtraName] = useState('');
  const [extraQty, setExtraQty] = useState<number>(1);
  const [extraUnit, setExtraUnit] = useState('pzas');

  // Computed: ingredientes del menú
  const getMenuItems = () => {
    const agg = new Map<string, { name: string; qty: number; unit: string }>();
    weeklyMenu.forEach(slot => {
      slot.foodIds.forEach(fid => {
        const food = foods.find((f: Food) => f.id === fid);
        const multiplier = slot.quantities?.[fid] || 1;
        food?.ingredients.forEach(ing => {
          const key = `${ing.name.toLowerCase()}_${ing.unit}`;
          const ex = agg.get(key);
          if (ex) ex.qty += ing.amount * multiplier;
          else agg.set(key, { name: ing.name, qty: ing.amount * multiplier, unit: ing.unit });
        });
      });
    });
    return Array.from(agg.values()).map((val, idx) => {
      const prod = products.find((p: Product) => p.name.toLowerCase() === val.name.toLowerCase());
      return {
        id: `menu_${idx}`,
        name: val.name,
        qty: val.qty,
        unit: val.unit,
        price: prod ? (val.qty / prod.defaultQty) * prod.price : 0,
        category: prod?.category || 'Sin clasificar',
      };
    });
  };

  const menuItems = getMenuItems();
  const total = menuItems.reduce((acc, i) => acc + i.price, 0);
  const checkedExtras = customShoppingItems.filter(i => i.checked).length;
  const totalExtras = customShoppingItems.length;

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: pName, price: pPrice, defaultQty: pQty, unit: pUnit, category: pCategory };
    editingProduct ? updateProduct(editingProduct.id, payload) : addProduct(payload);
    setPName(''); setPPrice(0); setPQty(1); setEditingProduct(null); setShowProductForm(false);
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName.trim()) return;
    addCustomShoppingItem({ name: extraName.trim(), qty: extraQty, unit: extraUnit });
    setExtraName(''); setExtraQty(1); setExtraUnit('pzas');
  };

  const handleArchive = () => {
    clearCustomShoppingItems();
    setShowArchiveConfirm(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Lista del Súper</h1>
          <p className="page-subtitle">Ingredientes del menú + artículos extra</p>
        </div>
        <Link to="/shopping/mode">
          <button className="btn-primary" style={{ background: '#10b981', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShoppingBasket size={16} /> IR AL SÚPER
          </button>
        </Link>
      </header>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab-btn${activeTab === 'lista' ? ' active' : ''}`} onClick={() => setActiveTab('lista')}>
          Ingredientes del menú
        </button>
        <button className={`tab-btn${activeTab === 'extras' ? ' active' : ''}`} onClick={() => setActiveTab('extras')}>
          Otros artículos
          {totalExtras > 0 && (
            <span style={{ marginLeft: '6px', background: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.65rem', padding: '0 6px', fontWeight: '800' }}>
              {checkedExtras}/{totalExtras}
            </span>
          )}
        </button>
        <button className={`tab-btn${activeTab === 'catalogo' ? ' active' : ''}`} onClick={() => setActiveTab('catalogo')}>
          Catálogo de precios
        </button>
      </div>

      {/* ── INGREDIENTES DEL MENÚ ── */}
      {activeTab === 'lista' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Ingredientes necesarios esta semana</h3>
            {menuItems.length === 0 ? (
              <div className="empty-state">
                <Package size={32} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <p>El menú semanal está vacío</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {menuItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{item.name}</span>
                    <span style={{ fontWeight: '800', color: 'var(--p-primary)', fontSize: '0.875rem', width: '80px', textAlign: 'right' }}>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1)} {item.unit}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--p-text-muted)', width: '60px', textAlign: 'right' }}>{item.price > 0 ? `$${item.price.toFixed(0)}` : '—'}</span>
                    <span className="badge badge-gray" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'var(--p-primary)', color: 'white', alignSelf: 'start' }}>
            <h3 className="card-title" style={{ color: 'white', marginBottom: '1rem' }}>Presupuesto estimado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.85, fontSize: '0.875rem' }}>Ingredientes</span>
                <span style={{ fontWeight: '800' }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: '700' }}>TOTAL</span>
                <span style={{ fontWeight: '900' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OTROS ARTÍCULOS ── */}
      {activeTab === 'extras' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Lista de extras */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="card-title">Lista de esta semana</h3>
              {totalExtras > 0 && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-text-muted)' }}
                  onClick={() => setShowArchiveConfirm(true)}
                >
                  <Archive size={14} /> Archivar y nueva lista
                </button>
              )}
            </div>

            {/* Confirm archive */}
            {showArchiveConfirm && (
              <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: 'var(--radius)', border: '1px solid #fed7aa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <p style={{ flex: 1, fontWeight: '600', fontSize: '0.875rem', color: '#92400e' }}>
                  ¿Archivar esta lista y empezar una nueva?
                </p>
                <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem', background: 'var(--warning)' }} onClick={handleArchive}>
                  Sí, archivar
                </button>
                <button className="btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => setShowArchiveConfirm(false)}>
                  Cancelar
                </button>
              </div>
            )}

            {customShoppingItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <Package size={32} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Agrega artículos que necesitas comprar esta semana</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {/* Pendientes primero */}
                {customShoppingItems.filter(i => !i.checked).map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <button onClick={() => toggleCustomShoppingItem(item.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--border)', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{item.name}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--p-text-muted)' }}>{item.qty} {item.unit}</span>
                    <button className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => deleteCustomShoppingItem(item.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {/* Comprados */}
                {customShoppingItems.filter(i => i.checked).length > 0 && (
                  <>
                    <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--p-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem', padding: '0 0.25rem' }}>
                      Comprados ({customShoppingItems.filter(i => i.checked).length})
                    </p>
                    {customShoppingItems.filter(i => i.checked).map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #86efac', opacity: 0.75 }}>
                        <button onClick={() => toggleCustomShoppingItem(item.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'var(--success)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="white" strokeWidth={3} />
                        </button>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem', flex: 1, textDecoration: 'line-through', color: 'var(--p-text-muted)' }}>{item.name}</span>
                        <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--p-text-muted)' }}>{item.qty} {item.unit}</span>
                        <button className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => deleteCustomShoppingItem(item.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Agregar artículo */}
          <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Plus size={16} color="var(--p-primary)" /> Agregar artículo
            </h3>
            <form onSubmit={handleAddExtra} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="form-label">Artículo *</label>
                <input required value={extraName} onChange={e => setExtraName(e.target.value)} placeholder="Ej: Papel de baño" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input type="number" min="1" value={extraQty} onChange={e => setExtraQty(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <select value={extraUnit} onChange={e => setExtraUnit(e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                <Plus size={15} /> Agregar
              </button>
            </form>

            {totalExtras > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>Progreso</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-text-muted)' }}>{checkedExtras}/{totalExtras}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(checkedExtras / totalExtras) * 100}%`, background: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-primary)' }} />
                </div>
                {checkedExtras === totalExtras && totalExtras > 0 && (
                  <p style={{ marginTop: '0.625rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
                    <Check size={14} /> ¡Lista completa! Puedes archivarla.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CATÁLOGO DE PRECIOS ── */}
      {activeTab === 'catalogo' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 className="card-title">Productos y precios de referencia</h3>
            <button onClick={() => setShowProductForm(true)} className="btn-primary"><Plus size={15} /> Nuevo</button>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} style={{ background: 'var(--p-background)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', alignItems: 'end', border: '1px solid var(--border)' }}>
              <div className="form-group"><label className="form-label">Nombre</label><input required value={pName} onChange={e => setPName(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Precio ($)</label><input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} /></div>
              <div className="form-group"><label className="form-label">Unidad</label><select value={pUnit} onChange={e => setPUnit(e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Categoría</label><select value={pCategory} onChange={e => setPCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', flex: 1 }}><Save size={15} /></button>
                <button type="button" className="btn-ghost" onClick={() => { setShowProductForm(false); setEditingProduct(null); setPName(''); }}><X size={15} /></button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {products.map((p: Product) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{p.name} <span style={{ fontWeight: '500', color: 'var(--p-text-muted)', fontSize: '0.75rem' }}>({p.defaultQty}{p.unit})</span></span>
                <span style={{ fontWeight: '800', color: 'var(--p-primary)', fontSize: '0.875rem' }}>${p.price.toFixed(2)}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                <button onClick={() => { setEditingProduct(p); setPName(p.name); setPPrice(p.price); setPQty(p.defaultQty); setPUnit(p.unit); setPCategory(p.category); setShowProductForm(true); setActiveTab('catalogo'); }} className="btn-icon"><Edit2 size={13} /></button>
                <button onClick={() => deleteProduct(p.id)} className="btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
              </div>
            ))}
            {products.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <p>Agrega productos para estimar precios automáticamente</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
