import { useState } from 'react';
import { Search, Edit2, Trash2, UtensilsCrossed, X, Plus, Minus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Food, Ingredient } from '../context/DataContext';

const FoodManager = () => {
  const { role } = useUser();
  const { foods, addFood, deleteFood, updateFood } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Comida');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 0, unit: 'pzas' }]);

  const categories = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Cena', 'Merienda'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    const foodData = { name, category, ingredients: validIngredients };

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
    setIngredients([{ name: '', amount: 0, unit: 'pzas' }]);
    setEditingFood(null);
    setShowForm(false);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setCategory(food.category);
    setIngredients(food.ingredients);
    setShowForm(true);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngs = [...ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setIngredients(newIngs);
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', amount: 0, unit: 'pzas' }]);
  const removeIngredientRow = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Catálogo de Alimentos</h1>
          <p className="page-subtitle">Gestiona tus platillos e ingredientes con precisión</p>
        </div>
        {role === 'parent' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Platillo</button>
        )}
      </header>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={resetForm} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>{editingFood ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Nombre del platillo</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Categoría</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                  Ingredientes Detallados
                  <button type="button" onClick={addIngredientRow} style={{ padding: '0.2rem 0.5rem', background: '#eef2ff', color: 'var(--p-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Añadir</button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input placeholder="Nombre" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} style={{ flex: 2, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                      <input type="number" placeholder="Cant." value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                      <select value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <option value="pzas">pzas</option>
                        <option value="ml">ml</option>
                        <option value="gr">gr</option>
                        <option value="kg">kg</option>
                        <option value="lt">lt</option>
                        <option value="paq">paq</option>
                      </select>
                      {ingredients.length > 1 && <button type="button" onClick={() => removeIngredientRow(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={16}/></button>}
                    </div>
                  ))}
                </div>
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
              placeholder="Buscar platillo..." 
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                {food.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span>{ing.name}</span>
                    <span style={{ fontWeight: '700', color: 'var(--p-primary)' }}>{ing.amount} {ing.unit}</span>
                  </div>
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
