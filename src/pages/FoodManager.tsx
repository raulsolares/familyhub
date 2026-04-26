import { useState } from 'react';
import { Search, Edit2, Trash2, UtensilsCrossed, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Food } from '../context/DataContext';

const FoodManager = () => {
  const { role } = useUser();
  const { foods, addFood, deleteFood, updateFood } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Comida');
  const [ingredients, setIngredients] = useState('');

  const categories = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Cena', 'Merienda'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foodData = {
      name,
      category,
      ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i !== '')
    };

    if (editingFood) {
      updateFood(editingFood.id, foodData);
    } else {
      addFood(foodData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCategory('Comida');
    setIngredients('');
    setEditingFood(null);
    setShowForm(false);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setCategory(food.category);
    setIngredients(food.ingredients.join(', '));
    setShowForm(true);
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Catálogo de Alimentos</h1>
          <p className="page-subtitle">Gestiona tus platillos e ingredientes</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Platillo</button>
        )}
      </header>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={resetForm} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>{editingFood ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Nombre del platillo</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Categoría</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Ingredientes (separados por coma)</label>
                <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                {editingFood ? 'Guardar Cambios' : 'Crear Platillo'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar platillo o ingrediente..." 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(food => (
          <div key={food.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--p-primary)', background: '#eef2ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {food.category}
                </span>
                <h3 style={{ fontWeight: '800', marginTop: '0.5rem', fontSize: '1.25rem' }}>{food.name}</h3>
              </div>
              {role === 'parent' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(food)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}><Edit2 size={14} /></button>
                  <button onClick={() => deleteFood(food.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca', background: 'white', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UtensilsCrossed size={14} /> INGREDIENTES:
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {food.ingredients.map((ing, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{ing}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodManager;
