import { useState } from 'react';
import { Search, Edit2, Trash2, UtensilsCrossed, X, Minus, Star, Clock, AlertCircle } from 'lucide-react';
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
  const [categories, setCategories] = useState<string[]>(['Comida']);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 0, unit: 'pzas' }]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [maxPerWeek, setMaxPerWeek] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  const [prepTime, setPrepTime] = useState<number | ''>('');

  const allCategories = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Cena', 'Merienda'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    const foodData = { 
      name, 
      categories, 
      ingredients: validIngredients,
      isFavorite,
      maxPerWeek: maxPerWeek ? Number(maxPerWeek) : undefined,
      calories: calories ? Number(calories) : undefined,
      prepTime: prepTime ? Number(prepTime) : undefined,
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
    setCategories(['Comida']);
    setIngredients([{ name: '', amount: 0, unit: 'pzas' }]);
    setIsFavorite(false);
    setMaxPerWeek('');
    setCalories('');
    setPrepTime('');
    setEditingFood(null);
    setShowForm(false);
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setCategories(food.categories || ['Comida']);
    setIngredients(food.ingredients);
    setIsFavorite(food.isFavorite || false);
    setMaxPerWeek(food.maxPerWeek || '');
    setCalories(food.calories || '');
    setPrepTime(food.prepTime || '');
    setShowForm(true);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngs = [...ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value as never };
    setIngredients(newIngs);
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const addIngredientRow = () => setIngredients([...ingredients, { name: '', amount: 0, unit: 'pzas' }]);
  const removeIngredientRow = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const sortedFoods = [...foods].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Catálogo de Alimentos</h1>
          <p className="page-subtitle">Base de datos nutricional y logística de comidas</p>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>{editingFood ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
              <button type="button" onClick={() => setIsFavorite(!isFavorite)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Star fill={isFavorite ? '#f59e0b' : 'none'} color={isFavorite ? '#f59e0b' : '#cbd5e1'} size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Nombre del platillo</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Categorías (Selecciona múltiples)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {allCategories.map(cat => (
                    <button 
                      key={cat} 
                      type="button" 
                      onClick={() => toggleCategory(cat)}
                      style={{ 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '999px', 
                        border: '1px solid var(--p-primary)',
                        background: categories.includes(cat) ? 'var(--p-primary)' : 'transparent',
                        color: categories.includes(cat) ? 'white' : 'var(--p-primary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--p-background)', borderRadius: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}><Clock size={12}/> Minutos</label>
                  <input value={prepTime} onChange={(e) => setPrepTime(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Tiempo" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>Calorías (Kcal)</label>
                  <input value={calories} onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Kcal" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>Límite /Semana</label>
                  <input value={maxPerWeek} onChange={(e) => setMaxPerWeek(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Veces" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                  Ingredientes Detallados
                  <button type="button" onClick={addIngredientRow} style={{ padding: '0.2rem 0.5rem', background: 'var(--p-background)', color: 'var(--p-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Añadir</button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input placeholder="Nombre" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} style={{ flex: 2, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <input type="number" placeholder="Cant." value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <select value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <option value="pzas">pzas</option>
                        <option value="ml">ml</option>
                        <option value="gr">gr</option>
                        <option value="kg">kg</option>
                        <option value="lt">lt</option>
                        <option value="paq">paq</option>
                      </select>
                      <button type="button" onClick={() => removeIngredientRow(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={16}/></button>
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
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--p-text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Buscar platillo por nombre..." 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--p-background)', color: 'var(--p-text)' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {sortedFoods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(food => (
          <div key={food.id} className="card" style={{ border: food.isFavorite ? '2px solid #f59e0b' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  {food.isFavorite && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                  {food.categories?.map(cat => (
                     <span key={cat} style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--p-primary)', background: 'var(--p-background)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                       {cat}
                     </span>
                  ))}
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>{food.name}</h3>
                {(food.calories || food.prepTime || food.maxPerWeek) && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>
                    {food.prepTime && <span><Clock size={10}/> {food.prepTime} min</span>}
                    {food.calories && <span>🔥 {food.calories} kcal</span>}
                    {food.maxPerWeek && <span style={{ color: '#ef4444' }}><AlertCircle size={10}/> Max {food.maxPerWeek}/sem</span>}
                  </div>
                )}
              </div>
              {role === 'parent' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(food)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--p-background)', cursor: 'pointer', color: 'var(--p-text)' }}><Edit2 size={14} /></button>
                  <button onClick={() => deleteFood(food.id)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #fecaca', background: 'white', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--p-background)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--p-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <UtensilsCrossed size={12} /> INGREDIENTES ({food.ingredients.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {food.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.2rem' }}>
                    <span>{ing.name}</span>
                    <span style={{ fontWeight: '800', color: 'var(--p-primary)' }}>{ing.amount} {ing.unit}</span>
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
