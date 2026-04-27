import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- Interfaces Extendidas V8 ---

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Food {
  id: string;
  name: string;
  categories: string[]; // Ahora es un array (multicategoría)
  ingredients: Ingredient[];
  maxPerWeek?: number;
  maxPerDay?: number;
  isFavorite?: boolean;
  calories?: number;
  weight?: number;
  groups?: string[];
  prepTime?: number;
}

export interface WeeklyMenuItem {
  id: string;
  day: string;
  meal: string;
  foodIds: string[]; // Ahora puede tener varios alimentos
  member: string;
  ate: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  defaultQty: number;
  unit: string;
  category: string;
}

export interface ShoppingNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Chore {
  id: string;
  name: string;
  user: string; // 'Familia' o el nombre del integrante
  freq: string;
  status: 'Hecho' | 'Pendiente';
  points: number;
  icon?: string; // Para la interfaz de niños
}

export interface Routine {
  id: string;
  member: string;
  name: string;
  time: string;
  tasks: string[];
  icon?: string; // Para la interfaz de niños
}

export interface SchoolTask {
  id: string;
  child: string;
  title: string;
  desc: string;
  date: string;
  type: string; // Ahora es abierto (configurable)
  completed: boolean;
}

export interface Rule {
  id: string;
  description: string;
  points: number; // Positivo para premio, negativo para consecuencia
  category: 'Comida' | 'Hogar' | 'Escuela' | 'Conducta' | 'Otro';
}

export interface PointLog {
  id: string;
  member: string;
  description: string;
  points: number;
  date: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar: string;
}

interface DataContextType {
  foods: Food[];
  chores: Chore[];
  schoolTasks: SchoolTask[];
  weeklyMenu: WeeklyMenuItem[];
  rules: Rule[];
  pointLogs: PointLog[];
  members: Member[];
  routines: Routine[];
  products: Product[];
  shoppingNotes: ShoppingNote[];
  points: { [key: string]: number };
  
  // Acciones
  addFood: (food: Omit<Food, 'id'>) => void;
  updateFood: (id: string, food: Partial<Food>) => void;
  deleteFood: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addShoppingNote: (text: string) => void;
  deleteShoppingNote: (id: string) => void;

  addChore: (chore: Omit<Chore, 'id' | 'status'>) => void;
  updateChore: (id: string, chore: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  toggleChore: (id: string) => void;

  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  
  addPointLog: (log: Omit<PointLog, 'id' | 'date'>) => void;
  deletePointLog: (id: string) => void;
  
  updateMember: (id: string, member: Partial<Member>) => void;
  
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;

  assignMeal: (day: string, meal: string, foodIds: string[], member: string) => void;
  toggleAte: (id: string) => void;
  updateSchoolTask: (id: string, task: Partial<SchoolTask>) => void;
  addSchoolTask: (task: Omit<SchoolTask, 'id' | 'completed'>) => void;
  deleteSchoolTask: (id: string) => void;
  toggleSchoolTask: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('fh_members_v8');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Raúl', role: 'parent', avatar: '👨' },
      { id: '2', name: 'Tania', role: 'parent', avatar: '👩' },
      { id: '3', name: 'Alan', role: 'child', avatar: '👦' },
      { id: '4', name: 'Aria', role: 'child', avatar: '👧' }
    ];
  });

  const [rules, setRules] = useState<Rule[]>(() => {
    const saved = localStorage.getItem('fh_rules_v8');
    return saved ? JSON.parse(saved) : [
      { id: '1', description: 'No comer la comida', points: -50, category: 'Comida' },
      { id: '2', description: 'No sacar la basura', points: -20, category: 'Hogar' },
      { id: '3', description: 'Ayudar a alguien', points: 30, category: 'Conducta' }
    ];
  });

  const [pointLogs, setPointLogs] = useState<PointLog[]>(() => {
    const saved = localStorage.getItem('fh_pointlogs_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('fh_routines_v8');
    return saved ? JSON.parse(saved) : [
      { id: '1', member: 'Alan', name: 'Rutina Mañanera', time: '07:00', tasks: ['Hacer cama', 'Dientes'], icon: '🌅' }
    ];
  });

  const [foods, setFoods] = useState<Food[]>(() => {
    const saved = localStorage.getItem('fh_foods_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuItem[]>(() => {
    const saved = localStorage.getItem('fh_weeklyMenu_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [chores, setChores] = useState<Chore[]>(() => {
    const saved = localStorage.getItem('fh_chores_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [schoolTasks, setSchoolTasks] = useState<SchoolTask[]>(() => {
    const saved = localStorage.getItem('fh_school_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fh_products_v8');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingNotes, setShoppingNotes] = useState<ShoppingNote[]>(() => {
    const saved = localStorage.getItem('fh_shoppingNotes_v8');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistencia Centralizada
  useEffect(() => {
    localStorage.setItem('fh_members_v8', JSON.stringify(members));
    localStorage.setItem('fh_rules_v8', JSON.stringify(rules));
    localStorage.setItem('fh_pointlogs_v8', JSON.stringify(pointLogs));
    localStorage.setItem('fh_routines_v8', JSON.stringify(routines));
    localStorage.setItem('fh_foods_v8', JSON.stringify(foods));
    localStorage.setItem('fh_weeklyMenu_v8', JSON.stringify(weeklyMenu));
    localStorage.setItem('fh_chores_v8', JSON.stringify(chores));
    localStorage.setItem('fh_school_v8', JSON.stringify(schoolTasks));
    localStorage.setItem('fh_products_v8', JSON.stringify(products));
    localStorage.setItem('fh_shoppingNotes_v8', JSON.stringify(shoppingNotes));
  }, [members, rules, pointLogs, routines, foods, weeklyMenu, chores, schoolTasks, products, shoppingNotes]);

  // Cálculos dinámicos de puntos
  const points = members.reduce((acc, m) => {
    const total = pointLogs
      .filter(log => log.member === m.name)
      .reduce((sum, log) => sum + log.points, 0);
    acc[m.name] = total;
    return acc;
  }, {} as { [key: string]: number });

  // Implementación de Acciones
  const addPointLog = (log: Omit<PointLog, 'id' | 'date'>) => {
    setPointLogs([...pointLogs, { ...log, id: Date.now().toString(), date: new Date().toISOString() }]);
  };
  const deletePointLog = (id: string) => setPointLogs(pointLogs.filter(l => l.id !== id));

  const addRule = (rule: Omit<Rule, 'id'>) => setRules([...rules, { ...rule, id: Date.now().toString() }]);
  const updateRule = (id: string, r: Partial<Rule>) => setRules(rules.map(item => item.id === id ? { ...item, ...r } as Rule : item));
  const deleteRule = (id: string) => setRules(rules.filter(r => r.id !== id));

  const addFood = (food: Omit<Food, 'id'>) => setFoods([...foods, { ...food, id: Date.now().toString() }]);
  const updateFood = (id: string, updated: Partial<Food>) => setFoods(foods.map(f => f.id === id ? { ...f, ...updated } as Food : f));
  const deleteFood = (id: string) => setFoods(foods.filter(f => f.id !== id));

  const addProduct = (product: Omit<Product, 'id'>) => setProducts([...products, { ...product, id: Date.now().toString() }]);
  const updateProduct = (id: string, updated: Partial<Product>) => setProducts(products.map(p => p.id === id ? { ...p, ...updated } as Product : p));
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const addShoppingNote = (text: string) => setShoppingNotes([...shoppingNotes, { id: Date.now().toString(), text, createdAt: new Date().toISOString() }]);
  const deleteShoppingNote = (id: string) => setShoppingNotes(shoppingNotes.filter(n => n.id !== id));

  const addChore = (chore: Omit<Chore, 'id' | 'status'>) => setChores([...chores, { ...chore, id: Date.now().toString(), status: 'Pendiente' }]);
  const updateChore = (id: string, updated: Partial<Chore>) => setChores(chores.map(c => c.id === id ? { ...c, ...updated } as Chore : c));
  const deleteChore = (id: string) => setChores(chores.filter(c => c.id !== id));
  const toggleChore = (id: string) => {
    setChores(chores.map(c => {
      if (c.id === id) {
        const isCompleting = c.status === 'Pendiente';
        if (isCompleting && c.user !== 'Familia' && c.user !== 'Raúl' && c.user !== 'Tania') {
          addPointLog({ member: c.user, description: `Tarea cumplida: ${c.name}`, points: c.points });
        }
        return { ...c, status: isCompleting ? 'Hecho' : 'Pendiente' };
      }
      return c;
    }));
  };

  const addRoutine = (r: Omit<Routine, 'id'>) => setRoutines([...routines, { ...r, id: Date.now().toString() }]);
  const updateRoutine = (id: string, r: Partial<Routine>) => setRoutines(routines.map(item => item.id === id ? { ...item, ...r } as Routine : item));
  const deleteRoutine = (id: string) => setRoutines(routines.filter(r => r.id !== id));

  const assignMeal = (day: string, meal: string, foodIds: string[], member: string) => {
    setWeeklyMenu(prev => {
      const filtered = prev.filter(item => !(item.day === day && item.meal === meal && item.member === member));
      if (foodIds.length === 0) return filtered;
      return [...filtered, { id: Date.now().toString(), day, meal, foodIds, member, ate: false }];
    });
  };

  const toggleAte = (id: string) => {
    setWeeklyMenu(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ate: !item.ate };
      }
      return item;
    }));
  };

  const updateSchoolTask = (id: string, t: Partial<SchoolTask>) => setSchoolTasks(schoolTasks.map(item => item.id === id ? { ...item, ...t } as SchoolTask : item));
  const addSchoolTask = (t: Omit<SchoolTask, 'id' | 'completed'>) => setSchoolTasks([...schoolTasks, { ...t, id: Date.now().toString(), completed: false }]);
  const deleteSchoolTask = (id: string) => setSchoolTasks(schoolTasks.filter(t => t.id !== id));
  const toggleSchoolTask = (id: string) => setSchoolTasks(schoolTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const updateMember = (id: string, m: Partial<Member>) => setMembers(members.map(item => item.id === id ? { ...item, ...m } as Member : item));

  return (
    <DataContext.Provider value={{ 
      foods, chores, schoolTasks, weeklyMenu, rules, pointLogs, members, routines, products, shoppingNotes, points,
      addFood, updateFood, deleteFood, addChore, updateChore, deleteChore, toggleChore,
      addRule, updateRule, deleteRule, addPointLog, deletePointLog, updateMember, addRoutine, updateRoutine, deleteRoutine,
      assignMeal, toggleAte, updateSchoolTask, addSchoolTask, deleteSchoolTask, toggleSchoolTask,
      addProduct, updateProduct, deleteProduct, addShoppingNote, deleteShoppingNote
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
