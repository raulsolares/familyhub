import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Tag, ShoppingBasket, X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  price: number;
  category: string;
  fromMenu: boolean;
  bought: boolean;
}

const ShoppingList = () => {
  const { weeklyMenu, foods } = useData();
  
  // Extraer ingredientes únicos del menú
  const [menuItems, setMenuItems] = useState<ShoppingItem[]>([]);
  const [manualItems, setManualItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fh_manual_shopping');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', name: 'Detergente Líquido', qty: '1 galón', price: 180, category: 'Limpieza', fromMenu: false, bought: false }
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);

  useEffect(() => {
    localStorage.setItem('fh_manual_shopping', JSON.stringify(manualItems));
  }, [manualItems]);

  const generateFromMenu = () => {
    const ingredientsMap = new Map<string, ShoppingItem>();
    
    weeklyMenu.forEach(slot => {
      const food = foods.find(f => f.id === slot.foodId);
      if (food) {
        food.ingredients.forEach(ing => {
          if (!ingredientsMap.has(ing)) {
            ingredientsMap.set(ing, {
              id: `menu_${ing}`,
              name: ing,
              qty: '1 pza/paq',
              price: 30, // Precio estimado por defecto
              category: 'Despensa',
              fromMenu: true,
              bought: false
            });
          }
        });
      }
    });

    setMenuItems(Array.from(ingredientsMap.values()));
  };

  useEffect(() => {
    // Autogenerar al cargar si el menú tiene items
    if (weeklyMenu.length > 0) {
      generateFromMenu();
    }
  }, [weeklyMenu, foods]);

  const allItems = [...menuItems, ...manualItems];
  const total = allItems.reduce((acc, item) => acc + item.price, 0);

  const addManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      qty: '1',
      price: newItemPrice,
      category: 'Extra',
      fromMenu: false,
      bought: false
    };
    setManualItems([...manualItems, newItem]);
    setNewItemName('');
    setNewItemPrice(0);
    setShowForm(false);
  };

  const deleteManualItem = (id: string) => {
    setManualItems(manualItems.filter(i => i.id !== id));
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Lista de Súper</h1>
        <p className="page-subtitle">Gestiona tus compras y estima tu presupuesto</p>
      </header>

      {/* Modal Agregar Producto */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Agregar Producto</h3>
            <form onSubmit={addManualItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Producto</label>
                <input required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Precio Estimado ($)</label>
                <input required value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Añadir a la lista</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Productos en la lista</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/shopping/mode" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                  <ShoppingBasket size={16} /> Ir de Compras
                </button>
              </Link>
              <button onClick={generateFromMenu} style={{ padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                <Download size={16} /> Sincronizar Menú
              </button>
              <button onClick={() => setShowForm(true)} style={{ padding: '0.5rem 1rem', background: 'var(--p-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                <Plus size={16} /> Agregar Extra
              </button>
            </div>
          </div>

          {allItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--p-text-muted)', padding: '2rem' }}>No hay productos en la lista. Agrega extras o sincroniza tu menú.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Producto</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>Categoría</th>
                  <th style={{ textAlign: 'right', padding: '1rem' }}>Precio Est.</th>
                  <th style={{ textAlign: 'right', padding: '1rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {allItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                        {item.fromMenu && <span style={{ fontSize: '0.7rem', background: '#eef2ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>MENÚ</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{item.category}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {!item.fromMenu && (
                        <button onClick={() => deleteManualItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="card-title"><Tag size={20} /> Resumen de Compra</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--p-text-muted)' }}>
              <span>Artículos:</span>
              <span>{allItems.length}</span>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.05)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', color: 'var(--p-primary)' }}>
              <span>Total Estimado:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/shopping/mode" style={{ textDecoration: 'none' }}>
              <button style={{ marginTop: '1rem', width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                Iniciar Compra
              </button>
            </Link>
            <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', textAlign: 'center' }}>
              Los precios son estimados para control de presupuesto familiar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
