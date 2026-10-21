import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket, X, Save, Edit2, Trash2, Plus, Check,
  RefreshCw, Package, MessageSquare, FileText, BookOpen,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useShoppingWeek } from '../hooks/useShoppingWeek';
import { weekStartKey } from '../utils/dates';
import WeekSwitch from '../components/WeekSwitch';
import type { Product, Food, ExtraItem } from '../context/DataContext';

type Tab = 'lista' | 'extras' | 'notas' | 'catalogo';
type CatalogTab = 'extras' | 'precios';

const UNITS = ['pzas', 'kg', 'gr', 'lt', 'ml', 'paq', 'bolsa', 'caja'];
const EXTRA_CATS = ['Limpieza', 'Higiene', 'Bebidas', 'Botanas', 'Panadería', 'Papelería', 'Mascotas', 'Otros'];
const PRICE_CATS = ['Frutas y Verduras', 'Proteínas', 'Lácteos', 'Abarrotes', 'Limpieza', 'Higiene', 'Panadería', 'Otros'];

const ShoppingList = () => {
  const {
    foods, products, addProduct, updateProduct, deleteProduct,
    customShoppingItems, addCustomShoppingItem, toggleCustomShoppingItem,
    deleteCustomShoppingItem, clearCustomShoppingItems,
    extraItems, addExtraItem, updateExtraItem, deleteExtraItem,
    shoppingNotes, addShoppingNote, deleteShoppingNote,
  } = useData();
  const { week, setWeek, menu: weeklyMenu } = useShoppingWeek();

  const [activeTab, setActiveTab] = useState<Tab>('lista');
  const [catalogTab, setCatalogTab] = useState<CatalogTab>('extras');

  // Confirmación borrar extra de la lista
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Confirmación limpiar lista
  const [confirmClear, setConfirmClear] = useState(false);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pQty, setPQty] = useState<number>(1);
  const [pUnit, setPUnit] = useState('pzas');
  const [pCategory, setPCategory] = useState('Abarrotes');

  // Extra catalog form
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [eName, setEName] = useState('');
  const [eUnit, setEUnit] = useState('pzas');
  const [eCategory, setECategory] = useState('Limpieza');
  const [ePrice, setEPrice] = useState<number | ''>('');

  // Add extra to list
  const [extraListName, setExtraListName] = useState('');
  const [extraListQty, setExtraListQty] = useState<number>(1);
  const [extraListUnit, setExtraListUnit] = useState('pzas');
  const [extraListPrice, setExtraListPrice] = useState<number | ''>('');

  // Notes
  const [noteText, setNoteText] = useState('');

  // ── Computed: ingredientes del menú ─────────────────────────────────────────
  const getMenuItems = () => {
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
    if (editingProduct) updateProduct(editingProduct.id, payload); else addProduct(payload);
    setPName(''); setPPrice(0); setPQty(1); setEditingProduct(null); setShowProductForm(false);
  };

  const handleExtraFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eName.trim()) return;
    const payload = { name: eName.trim(), unit: eUnit, category: eCategory, price: ePrice ? Number(ePrice) : undefined };
    if (editingExtra) updateExtraItem(editingExtra.id, payload); else addExtraItem(payload);
    setEName(''); setEUnit('pzas'); setECategory('Limpieza'); setEPrice(''); setEditingExtra(null); setShowExtraForm(false);
  };

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraListName.trim()) return;
    addCustomShoppingItem({ name: extraListName.trim(), qty: extraListQty, unit: extraListUnit, price: extraListPrice ? Number(extraListPrice) : undefined });
    // Si tiene precio, guardar en catálogo de extras si no existe
    if (extraListPrice && !extraItems.some(ei => ei.name.toLowerCase() === extraListName.trim().toLowerCase())) {
      addExtraItem({ name: extraListName.trim(), unit: extraListUnit, category: 'Otros', price: Number(extraListPrice) });
    } else if (extraListPrice) {
      const existing = extraItems.find(ei => ei.name.toLowerCase() === extraListName.trim().toLowerCase());
      if (existing) updateExtraItem(existing.id, { price: Number(extraListPrice) });
    }
    setExtraListName(''); setExtraListQty(1); setExtraListUnit('pzas'); setExtraListPrice('');
  };

  const addFromCatalog = (item: ExtraItem) => {
    addCustomShoppingItem({ name: item.name, qty: 1, unit: item.unit });
  };

  const handleDeleteConfirmed = (id: string) => {
    deleteCustomShoppingItem(id);
    setConfirmDeleteId(null);
  };

  const tabCount = (tab: Tab) => {
    if (tab === 'extras') return totalExtras > 0 ? `${checkedExtras}/${totalExtras}` : null;
    if (tab === 'notas') return shoppingNotes.length > 0 ? shoppingNotes.length : null;
    return null;
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'lista',    label: 'Ingredientes', icon: <Package size={13} /> },
    { key: 'extras',   label: 'Extras',       icon: <ShoppingBasket size={13} /> },
    { key: 'notas',    label: 'Notas',        icon: <MessageSquare size={13} /> },
    { key: 'catalogo', label: 'Catálogos',    icon: <BookOpen size={13} /> },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Lista del Súper</h1>
          <p className="page-subtitle">Ingredientes del menú, extras, notas y catálogos</p>
        </div>
        <Link to={`/shopping/mode?week=${week}`} className="btn-primary" style={{ background: '#10b981', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}>
          <ShoppingBasket size={16} /> IR AL SÚPER
        </Link>
      </header>

      <div style={{ marginBottom: '1rem' }}>
        <p className="eyebrow" style={{ marginBottom: '0.375rem' }}>Ingredientes del menú de</p>
        <WeekSwitch value={week} onChange={setWeek} note={w => (w === week ? `${weeklyMenu.filter(x => x.foodIds.length).length} comidas` : undefined)} />
      </div>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
        {tabs.map(t => {
          const count = tabCount(t.key);
          return (
            <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {t.icon}{t.label}
              {count !== null && (
                <span style={{ background: activeTab === t.key ? 'rgba(255,255,255,0.3)' : 'var(--p-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.65rem', padding: '0 6px', fontWeight: '800' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── INGREDIENTES DEL MENÚ ── */}
      {activeTab === 'lista' && (
        <div className="split split-2-1">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Ingredientes necesarios {week === weekStartKey() ? 'esta semana' : 'la próxima semana'}</h3>
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
                    <span className="badge badge-gray shop-cat" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{item.category}</span>
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

      {/* ── EXTRAS ── */}
      {activeTab === 'extras' && (
        <div className="split split-side">

          {/* Lista de esta semana */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="card-title">Lista de esta semana</h3>
              {totalExtras > 0 && (
                <button
                  onClick={() => setConfirmClear(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--p-background)', color: 'var(--p-text-muted)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <RefreshCw size={13} /> Nueva lista
                </button>
              )}
            </div>

            {confirmClear && (
              <div style={{ padding: '0.875rem 1rem', background: '#fff7ed', borderRadius: 'var(--radius)', border: '1px solid #fed7aa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <p style={{ flex: 1, fontWeight: '600', fontSize: '0.85rem', color: '#92400e' }}>¿Borrar toda la lista de extras?</p>
                <button onClick={() => { clearCustomShoppingItems(); setConfirmClear(false); }} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', background: 'var(--warning)' }}>Sí, limpiar</button>
                <button onClick={() => setConfirmClear(false)} className="btn-ghost" style={{ fontSize: '0.8rem' }}>Cancelar</button>
              </div>
            )}

            {customShoppingItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <Package size={32} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Agrega artículos del catálogo o manualmente →</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {customShoppingItems.filter(i => !i.checked).map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: confirmDeleteId === item.id ? '1px solid #fca5a5' : '1px solid var(--border)', transition: 'border-color 0.15s' }}>
                    <button onClick={() => toggleCustomShoppingItem(item.id)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--border)', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
                    <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{item.name}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--p-text-muted)' }}>{item.qty} {item.unit}</span>
                    {item.price && <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--p-primary)' }}>${item.price.toFixed(2)}</span>}
                    {confirmDeleteId === item.id ? (
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444' }}>¿Seguro?</span>
                        <button onClick={() => handleDeleteConfirmed(item.id)} style={{ padding: '2px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>Sí</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '2px 8px', background: 'var(--p-background)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>No</button>
                      </div>
                    ) : (
                      <button className="btn-icon" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => setConfirmDeleteId(item.id)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}

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

            {totalExtras > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${(checkedExtras / totalExtras) * 100}%`, background: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-primary)' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: checkedExtras === totalExtras ? 'var(--success)' : 'var(--p-text-muted)', flexShrink: 0 }}>{checkedExtras}/{totalExtras}</span>
              </div>
            )}
          </div>

          {/* Panel derecho: agregar manual + catálogo rápido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Agregar manual */}
            <div className="card" style={{ position: 'sticky', top: '1rem' }}>
              <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <Plus size={14} color="var(--p-primary)" /> Agregar artículo
              </h3>
              <form onSubmit={handleAddToList} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input required value={extraListName} onChange={e => {
                  setExtraListName(e.target.value);
                  // Auto-completar precio y unidad del catálogo
                  const found = extraItems.find(ei => ei.name.toLowerCase() === e.target.value.trim().toLowerCase());
                  if (found) { if (found.price) setExtraListPrice(found.price); setExtraListUnit(found.unit); }
                }} placeholder="Ej: Papel de baño" style={{ padding: '0.625rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                <div className="grid-3" style={{ gap: '0.5rem' }}>
                  <input type="number" min="1" value={extraListQty} onChange={e => setExtraListQty(Number(e.target.value))} placeholder="Cant." style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                  <select value={extraListUnit} onChange={e => setExtraListUnit(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input type="number" min="0" step="0.01" value={extraListPrice} onChange={e => setExtraListPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="$Precio" style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
                  <Plus size={15} /> Agregar a la lista
                </button>
              </form>

              {/* Catálogo rápido */}
              {extraItems.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--p-text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Del catálogo</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {extraItems.map(item => {
                      const alreadyAdded = customShoppingItems.some(c => c.name.toLowerCase() === item.name.toLowerCase() && !c.checked);
                      return (
                        <button
                          key={item.id}
                          onClick={() => !alreadyAdded && addFromCatalog(item)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: alreadyAdded ? '#f0fdf4' : 'var(--p-background)', border: `1px solid ${alreadyAdded ? '#86efac' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: alreadyAdded ? 'default' : 'pointer', textAlign: 'left' }}
                        >
                          <div>
                            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--p-text)' }}>{item.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', marginLeft: '0.375rem' }}>{item.unit}</span>
                          </div>
                          {alreadyAdded ? <Check size={14} color="var(--success)" /> : <Plus size={14} color="var(--p-primary)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTAS ── */}
      {activeTab === 'notas' && (
        <div className="split split-side">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--p-primary)" /> Notas para el súper
            </h3>
            {shoppingNotes.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <MessageSquare size={32} color="var(--p-text-subtle)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Sin notas. Agrega recordatorios que quieras ver al ir al súper.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {shoppingNotes.map(note => (
                  <div key={note.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', background: '#fffbeb', borderRadius: 'var(--radius)', border: '1px solid #fcd34d' }}>
                    <MessageSquare size={14} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>{note.text}</span>
                    <button onClick={() => deleteShoppingNote(note.id)} className="btn-icon" style={{ color: '#b45309', flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              <Plus size={14} color="var(--p-primary)" /> Nueva nota
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Ej: Revisar ofertas de detergente, comprar la marca X de leche..."
                rows={3}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.875rem', resize: 'vertical' }}
              />
              <button
                onClick={() => { if (noteText.trim()) { addShoppingNote(noteText.trim()); setNoteText(''); } }}
                disabled={!noteText.trim()}
                className="btn-primary"
                style={{ justifyContent: 'center', opacity: noteText.trim() ? 1 : 0.5 }}
              >
                <Plus size={15} /> Agregar nota
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--p-text-muted)', marginTop: '0.75rem' }}>
              Las notas aparecen en la pantalla "Ir al súper" como recordatorios.
            </p>
          </div>
        </div>
      )}

      {/* ── CATÁLOGOS ── */}
      {activeTab === 'catalogo' && (
        <div>
          {/* Sub-tabs */}
          <div className="tab-list" style={{ marginBottom: '1.5rem' }}>
            <button className={`tab-btn${catalogTab === 'extras' ? ' active' : ''}`} onClick={() => setCatalogTab('extras')}>
              <Package size={13} style={{ marginRight: 4 }} /> Artículos extra
            </button>
            <button className={`tab-btn${catalogTab === 'precios' ? ' active' : ''}`} onClick={() => setCatalogTab('precios')}>
              <Save size={13} style={{ marginRight: 4 }} /> Precios de ingredientes
            </button>
          </div>

          {/* Catálogo extras */}
          {catalogTab === 'extras' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="card-title">Catálogo de artículos del hogar</h3>
                <button onClick={() => { setShowExtraForm(true); setEditingExtra(null); setEName(''); setEUnit('pzas'); setECategory('Limpieza'); }} className="btn-primary"><Plus size={15} /> Nuevo</button>
              </div>

              {showExtraForm && (
                <form onSubmit={handleExtraFormSubmit} style={{ background: 'var(--p-background)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem', alignItems: 'end', border: '1px solid var(--border)' }}>
                  <div className="form-group"><label className="form-label">Nombre</label><input required value={eName} onChange={e => setEName(e.target.value)} placeholder="Ej: Jabón de trastes" /></div>
                  <div className="form-group"><label className="form-label">Unidad</label><select value={eUnit} onChange={e => setEUnit(e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Categoría</label><select value={eCategory} onChange={e => setECategory(e.target.value)}>{EXTRA_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Precio ($)</label><input type="number" min="0" step="0.01" value={ePrice} onChange={e => setEPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" /></div>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button type="submit" className="btn-primary" style={{ justifyContent: 'center', flex: 1 }}><Save size={15} /></button>
                    <button type="button" className="btn-ghost" onClick={() => { setShowExtraForm(false); setEditingExtra(null); setEPrice(''); }}><X size={15} /></button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {extraItems.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 0' }}>
                    <p>Agrega artículos que compras regularmente (limpieza, higiene, etc.)</p>
                  </div>
                ) : (
                  extraItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.875rem', flex: 1 }}>{item.name} <span style={{ fontWeight: '500', color: 'var(--p-text-muted)', fontSize: '0.75rem' }}>({item.unit})</span></span>
                      {item.price && <span style={{ fontWeight: '800', color: 'var(--p-primary)', fontSize: '0.875rem' }}>${item.price.toFixed(2)}</span>}
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                      <button onClick={() => { setEditingExtra(item); setEName(item.name); setEUnit(item.unit); setECategory(item.category); setEPrice(item.price ?? ''); setShowExtraForm(true); }} className="btn-icon"><Edit2 size={13} /></button>
                      <button onClick={() => deleteExtraItem(item.id)} className="btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Catálogo precios */}
          {catalogTab === 'precios' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 className="card-title">Precios de ingredientes de referencia</h3>
                <button onClick={() => setShowProductForm(true)} className="btn-primary"><Plus size={15} /> Nuevo</button>
              </div>

              {showProductForm && (
                <form onSubmit={handleProductSubmit} style={{ background: 'var(--p-background)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', alignItems: 'end', border: '1px solid var(--border)' }}>
                  <div className="form-group"><label className="form-label">Nombre</label><input required value={pName} onChange={e => setPName(e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Precio ($)</label><input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label">Unidad</label><select value={pUnit} onChange={e => setPUnit(e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Categoría</label><select value={pCategory} onChange={e => setPCategory(e.target.value)}>{PRICE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
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
                    <button onClick={() => { setEditingProduct(p); setPName(p.name); setPPrice(p.price); setPQty(p.defaultQty); setPUnit(p.unit); setPCategory(p.category); setShowProductForm(true); }} className="btn-icon"><Edit2 size={13} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="empty-state" style={{ padding: '2rem 0' }}>
                    <p>Agrega productos para estimar el presupuesto automáticamente</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
