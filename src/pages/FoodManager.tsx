import { useState, useRef } from 'react';
import { Search, Edit2, Trash2, UtensilsCrossed, X, Minus, Star, Clock, AlertCircle, BarChart2, TrendingUp, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import type { Food, Ingredient } from '../context/DataContext';
import { foodEmoji } from '../utils/food';

const EMOJI_CHOICES = ['🍳','🥞','🥣','🍓','🥪','🌮','🍕','🍔','🍝','🍗','🥩','🐟','🍚','🍲','🥗','🥕','🫓','🌭','🍟','🍪','🍦','🍰','🥛','🧃'];

const FoodManager = () => {
  const { role } = useUser();
  const { foods, addFood, deleteFood, updateFood, ingredientItems, addIngredientItem, weeklyMenu, members, foodGroupLimits, setFoodGroupLimit } = useData();
  const [newGroup, setNewGroup] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'catalogo' | 'estadisticas'>('catalogo');
  const [activeIngSuggest, setActiveIngSuggest] = useState<number | null>(null);
  const suggestRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>(['Comida']);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 0, unit: 'pzas' }]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [maxPerWeek, setMaxPerWeek] = useState<number | ''>('');
  const [group, setGroup] = useState('');
  const [emoji, setEmoji] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [prepTime, setPrepTime] = useState<number | ''>('');

  const allCategories = ['Desayuno', 'Snack', 'Lunch', 'Comida', 'Cena', 'Merienda'];
  const allGroups = Array.from(new Set([...foods.map(f => f.group).filter((g): g is string => !!g), ...Object.keys(foodGroupLimits)])).sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    // Auto-add new ingredient names to the global DB
    validIngredients.forEach(ing => {
      const normalized = ing.name.trim().toLowerCase();
      if (!ingredientItems.some(item => item.name.toLowerCase() === normalized)) {
        addIngredientItem({ name: ing.name.trim(), unit: ing.unit, category: '' });
      }
    });
    const foodData = {
      name,
      categories,
      ingredients: validIngredients,
      isFavorite,
      maxPerWeek: maxPerWeek ? Number(maxPerWeek) : undefined,
      group: group.trim() || undefined,
      emoji: emoji.trim() || undefined,
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
    setGroup('');
    setEmoji('');
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
    setGroup(food.group || '');
    setEmoji(food.emoji || '');
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

  // ── ESTADÍSTICAS SEMANALES ───────────────────────────────────────────────────
  // kcal por persona y frecuencia por platillo para la semana visible en weeklyMenu
  const statsPerMember: Record<string, { kcal: number; meals: number }> = {};
  const statsPerFood: Record<string, { food: Food; count: number; memberNames: string[] }> = {};
  members.forEach(m => { statsPerMember[m.name] = { kcal: 0, meals: 0 }; });

  weeklyMenu.forEach(slot => {
    if (!statsPerMember[slot.member]) return;
    slot.foodIds.forEach(fid => {
      const food = foods.find(f => f.id === fid);
      if (!food) return;
      const qty = slot.quantities?.[fid] || 1;
      if (food.calories) statsPerMember[slot.member].kcal += food.calories * qty;
      statsPerMember[slot.member].meals += qty;
      if (!statsPerFood[fid]) statsPerFood[fid] = { food, count: 0, memberNames: [] };
      statsPerFood[fid].count += qty;
      if (!statsPerFood[fid].memberNames.includes(slot.member)) statsPerFood[fid].memberNames.push(slot.member);
    });
  });

  const sortedFoodStats = Object.values(statsPerFood).sort((a, b) => b.count - a.count);
  const maxKcal = Math.max(...Object.values(statsPerMember).map(s => s.kcal), 1);

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Alimentos</h1>
          <p className="page-subtitle">Catálogo nutricional y estadísticas de consumo</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="tab-list">
            <button className={`tab-btn${activeTab === 'catalogo' ? ' active' : ''}`} onClick={() => setActiveTab('catalogo')}><UtensilsCrossed size={13} style={{ marginRight: 4 }} />Catálogo</button>
            <button className={`tab-btn${activeTab === 'estadisticas' ? ' active' : ''}`} onClick={() => setActiveTab('estadisticas')}><BarChart2 size={13} style={{ marginRight: 4 }} />Estadísticas</button>
          </div>
          {role === 'parent' && activeTab === 'catalogo' && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Platillo</button>
          )}
        </div>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>Límite por niño /semana</label>
                  <input value={maxPerWeek} onChange={(e) => setMaxPerWeek(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Veces" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Emoji (lo ven los niños)</label>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.75rem', width: '2.5rem', textAlign: 'center' }}>{foodEmoji({ name, emoji })}</span>
                  {EMOJI_CHOICES.map(e => (
                    <button type="button" key={e} onClick={() => setEmoji(e)} aria-label={`Usar ${e}`}
                      style={{ fontSize: '1.2rem', width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer', border: emoji === e ? '2px solid var(--p-primary)' : '1px solid var(--border)', background: 'var(--p-surface)' }}>{e}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Grupo (para topes semanales)</label>
                <input list="fh-food-groups" value={group} onChange={e => setGroup(e.target.value)} placeholder="Ej: Dulces, Comida rápida, Proteína" />
                <datalist id="fh-food-groups">{allGroups.map(g => <option key={g} value={g} />)}</datalist>
                {group && foodGroupLimits[group] !== undefined && (
                  <span className="text-xs text-muted">Este grupo tiene tope de {foodGroupLimits[group]} por niño a la semana</span>
                )}
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                  Ingredientes Detallados
                  <button type="button" onClick={addIngredientRow} style={{ padding: '0.2rem 0.5rem', background: 'var(--p-background)', color: 'var(--p-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Añadir</button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ingredients.map((ing, i) => {
                    const query = ing.name.trim().toLowerCase();
                    const suggestions = query.length >= 1
                      ? ingredientItems.filter(item => item.name.toLowerCase().includes(query) && item.name.toLowerCase() !== query).slice(0, 6)
                      : [];
                    return (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 2, position: 'relative' }}>
                          <input
                            placeholder="Nombre ingrediente"
                            value={ing.name}
                            onChange={e => { updateIngredient(i, 'name', e.target.value); setActiveIngSuggest(i); }}
                            onFocus={() => setActiveIngSuggest(i)}
                            onBlur={() => setTimeout(() => setActiveIngSuggest(null), 150)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                          />
                          {activeIngSuggest === i && suggestions.length > 0 && (
                            <div ref={suggestRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', zIndex: 500, maxHeight: '160px', overflowY: 'auto' }}>
                              {suggestions.map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onMouseDown={() => { updateIngredient(i, 'name', s.name); setActiveIngSuggest(null); }}
                                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--p-text)' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--p-background)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                  {s.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="number" placeholder="Cant." value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <select value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <option value="pzas">pzas</option>
                          <option value="ml">ml</option>
                          <option value="gr">gr</option>
                          <option value="kg">kg</option>
                          <option value="lt">lt</option>
                          <option value="paq">paq</option>
                        </select>
                        <button type="button" onClick={() => removeIngredientRow(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', paddingTop: '0.5rem' }}><Minus size={16}/></button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                {editingFood ? 'Guardar Cambios' : 'Crear Platillo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: CATÁLOGO ── */}
      {activeTab === 'catalogo' && (
        <>
          {role === 'parent' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="card-title" style={{ marginBottom: '0.375rem' }}><AlertCircle size={16} color="var(--warning)" /> Topes semanales por grupo</h3>
              <p className="text-xs text-muted" style={{ marginBottom: '0.875rem' }}>
                Cuántas porciones de cada grupo puede elegir cada niño por semana. También puedes poner un límite a un platillo específico al editarlo.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {allGroups.map(g => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--p-background)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{g}</span>
                    <input
                      type="number" min="0" aria-label={`Tope semanal de ${g}`}
                      value={foodGroupLimits[g] ?? ''}
                      placeholder="∞"
                      onChange={e => setFoodGroupLimit(g, e.target.value === '' ? null : Number(e.target.value))}
                      style={{ width: '56px', padding: '0.25rem 0.375rem' }}
                    />
                    <span className="text-xs text-muted">/sem</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={e => { e.preventDefault(); if (newGroup.trim() && newGroupLimit !== '') { setFoodGroupLimit(newGroup.trim(), Number(newGroupLimit)); setNewGroup(''); setNewGroupLimit(''); } }}
                style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
              >
                <input value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="Nuevo grupo (ej: Refrescos)" style={{ flex: 1, minWidth: '160px' }} />
                <input type="number" min="0" value={newGroupLimit} onChange={e => setNewGroupLimit(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Tope" style={{ width: '80px' }} />
                <button type="submit" className="btn-secondary">Agregar</button>
              </form>
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
                    <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}><span style={{ marginRight: '0.375rem' }}>{foodEmoji(food)}</span>{food.name}</h3>
                    {(food.calories || food.prepTime || food.maxPerWeek || food.group) && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>
                        {food.prepTime && <span><Clock size={10} /> {food.prepTime} min</span>}
                        {food.calories && <span><Flame size={10} color="#f97316" /> {food.calories} kcal</span>}
                        {food.maxPerWeek && <span style={{ color: '#ef4444' }}><AlertCircle size={10} /> Max {food.maxPerWeek}/sem</span>}
                        {food.group && <span>· {food.group}</span>}
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
        </>
      )}

      {/* ── TAB: ESTADÍSTICAS ── */}
      {activeTab === 'estadisticas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Kcal por persona */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={16} color="#f97316" /> Calorías esta semana por persona
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map(m => {
                const stat = statsPerMember[m.name] || { kcal: 0, meals: 0 };
                const pct = maxKcal > 0 ? (stat.kcal / maxKcal) * 100 : 0;
                return (
                  <div key={m.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{m.avatar}</span>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{m.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--p-primary)' }}>{stat.kcal.toLocaleString()} kcal</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', marginLeft: '0.5rem' }}>{stat.meals} porciones</span>
                      </div>
                    </div>
                    <div style={{ height: '10px', background: 'var(--p-background)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--p-primary), #f97316)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
              {Object.values(statsPerMember).every(s => s.kcal === 0) && (
                <p style={{ color: 'var(--p-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>Sin datos calóricos en el menú de esta semana</p>
              )}
            </div>
          </div>

          {/* Frecuencia de platillos */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} color="var(--p-primary)" /> Platillos más consumidos esta semana
            </h3>
            {sortedFoodStats.length === 0 ? (
              <p style={{ color: 'var(--p-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>Sin menú planificado para esta semana</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {sortedFoodStats.map(({ food, count, memberNames }, idx) => {
                  const pct = sortedFoodStats[0]?.count ? (count / sortedFoodStats[0].count) * 100 : 0;
                  return (
                    <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--p-text-muted)', width: '1.25rem', textAlign: 'right' }}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{food.name}</span>
                            <div style={{ display: 'flex', gap: '0.15rem' }}>
                              {memberNames.map(n => {
                                const mem = members.find(x => x.name === n);
                                return <span key={n} title={n} style={{ fontSize: '0.875rem' }}>{mem?.avatar || '👤'}</span>;
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {food.calories && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', fontWeight: '600' }}>
                                {food.calories * count} kcal total
                              </span>
                            )}
                            <span style={{ fontWeight: '800', fontSize: '0.8rem', color: 'var(--p-primary)', background: 'var(--p-primary-50)', padding: '1px 8px', borderRadius: '9999px' }}>
                              ×{count}
                            </span>
                          </div>
                        </div>
                        <div style={{ height: '6px', background: 'var(--p-background)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--p-primary)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default FoodManager;
