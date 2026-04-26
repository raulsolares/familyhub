import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Interfaces
export interface Food {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
}

export interface Chore {
  id: string;
  name: string;
  user: string;
  freq: string;
  status: 'Hecho' | 'Pendiente';
  points: number;
}

export interface SchoolTask {
  id: string;
  child: string;
  title: string;
  desc: string;
  deadline: string;
  type: 'material' | 'academic' | 'social';
  completed: boolean;
}

export interface WeeklyMenuItem {
  day: string;
  meal: string;
  foodId: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

interface DataContextType {
  foods: Food[];
  chores: Chore[];
  schoolTasks: SchoolTask[];
  rewards: Reward[];
  points: { [key: string]: number };
  weeklyMenu: WeeklyMenuItem[];
  addFood: (food: Omit<Food, 'id'>) => void;
  deleteFood: (id: string) => void;
  updateFood: (id: string, food: Partial<Food>) => void;
  toggleChore: (id: string) => void;
  addChore: (chore: Omit<Chore, 'id' | 'status' | 'points'>) => void;
  addSchoolTask: (task: Omit<SchoolTask, 'id' | 'completed'>) => void;
  updateSchoolTask: (id: string, task: Partial<SchoolTask>) => void;
  deleteSchoolTask: (id: string) => void;
  toggleSchoolTask: (id: string) => void;
  updatePoints: (child: string, amount: number) => void;
  assignMeal: (day: string, meal: string, foodId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Inicialización con datos de ejemplo o LocalStorage
  const [foods, setFoods] = useState<Food[]>(() => {
    const saved = localStorage.getItem('fh_foods');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Enchiladas Verdes', category: 'Comida', ingredients: ['Tortillas', 'Pollo', 'Salsa Verde'] },
      { id: '2', name: 'Avena con Fruta', category: 'Desayuno', ingredients: ['Avena', 'Leche', 'Plátano'] }
    ];
  });

  const [chores, setChores] = useState<Chore[]>(() => {
    const saved = localStorage.getItem('fh_chores');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Lavar los platos', user: 'Papá', freq: 'Diario', status: 'Pendiente', points: 10 },
      { id: '2', name: 'Sacar la basura', user: 'Mateo', freq: 'Mar/Jue', status: 'Hecho', points: 20 }
    ];
  });

  const [schoolTasks, setSchoolTasks] = useState<SchoolTask[]>(() => {
    const saved = localStorage.getItem('fh_school');
    return saved ? JSON.parse(saved) : [
      { id: '1', child: 'Mateo', title: 'Cartulina blanca', desc: 'Proyecto Ciencias', deadline: 'Mañana', type: 'material', completed: false }
    ];
  });

  const [points, setPoints] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('fh_points');
    return saved ? JSON.parse(saved) : { Mateo: 450, Sofía: 520 };
  });

  const [rewards] = useState<Reward[]>([
    { id: '1', name: '1 hora de videojuegos', cost: 100, icon: '🎮' },
    { id: '2', name: 'Cena favorita', cost: 500, icon: '🍕' }
  ]);

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuItem[]>(() => {
    const saved = localStorage.getItem('fh_weeklyMenu');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistencia
  useEffect(() => {
    localStorage.setItem('fh_foods', JSON.stringify(foods));
    localStorage.setItem('fh_chores', JSON.stringify(chores));
    localStorage.setItem('fh_school', JSON.stringify(schoolTasks));
    localStorage.setItem('fh_points', JSON.stringify(points));
    localStorage.setItem('fh_weeklyMenu', JSON.stringify(weeklyMenu));
  }, [foods, chores, schoolTasks, points, weeklyMenu]);

  // Acciones
  const addFood = (food: Omit<Food, 'id'>) => {
    setFoods([...foods, { ...food, id: Date.now().toString() }]);
  };

  const deleteFood = (id: string) => setFoods(foods.filter(f => f.id !== id));

  const updateFood = (id: string, updated: Partial<Food>) => {
    setFoods(foods.map(f => f.id === id ? { ...f, ...updated } : f));
  };

  const toggleChore = (id: string) => {
    setChores(chores.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Hecho' ? 'Pendiente' : 'Hecho';
        // Si se marca como hecho, dar puntos (si es Mateo o Sofía)
        if (newStatus === 'Hecho' && (c.user === 'Mateo' || c.user === 'Sofía')) {
          updatePoints(c.user, 20);
        }
        return { ...c, status: newStatus as 'Hecho' | 'Pendiente' };
      }
      return c;
    }));
  };

  const addChore = (chore: Omit<Chore, 'id' | 'status' | 'points'>) => {
    setChores([...chores, { ...chore, id: Date.now().toString(), status: 'Pendiente', points: 20 }]);
  };

  const addSchoolTask = (task: Omit<SchoolTask, 'id' | 'completed'>) => {
    setSchoolTasks([...schoolTasks, { ...task, id: Date.now().toString(), completed: false }]);
  };

  const updateSchoolTask = (id: string, updated: Partial<SchoolTask>) => {
    setSchoolTasks(schoolTasks.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteSchoolTask = (id: string) => {
    setSchoolTasks(schoolTasks.filter(t => t.id !== id));
  };

  const toggleSchoolTask = (id: string) => {
    setSchoolTasks(schoolTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updatePoints = (child: string, amount: number) => {
    setPoints(prev => ({ ...prev, [child]: (prev[child] || 0) + amount }));
  };

  const assignMeal = (day: string, meal: string, foodId: string) => {
    setWeeklyMenu(prev => {
      const filtered = prev.filter(item => !(item.day === day && item.meal === meal));
      if (!foodId) return filtered;
      return [...filtered, { day, meal, foodId }];
    });
  };

  return (
    <DataContext.Provider value={{ 
      foods, chores, schoolTasks, rewards, points, weeklyMenu,
      addFood, deleteFood, updateFood, toggleChore, addChore,
      addSchoolTask, updateSchoolTask, deleteSchoolTask, toggleSchoolTask, updatePoints, assignMeal 
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
