import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// --- Interfaces V9 (Final) ---

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Food {
  id: string;
  name: string;
  categories: string[];
  ingredients: Ingredient[];
  maxPerWeek?: number;
  isFavorite?: boolean;
  calories?: number;
  prepTime?: number;
}

export interface WeeklyMenuItem {
  id: string;
  day: string;
  meal: string;
  foodIds: string[];
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
  user: string;
  freq: string;
  status: 'Hecho' | 'Pendiente';
  points: number;
  routineId?: string; // Vínculo opcional a rutina
}

export interface Routine {
  id: string;
  member: string;
  name: string;
  time: string;
  tasks: string[];
  icon: string;
}

export interface SchoolTask {
  id: string;
  child: string;
  title: string;
  desc: string;
  date: string;
  type: string;
  completed: boolean;
}

export interface Rule {
  id: string;
  description: string;
  points: number;
  category: string;
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
  pointLogs: PointLog[];
  rules: Rule[];
  members: Member[];
  routines: Routine[];
  products: Product[];
  shoppingNotes: ShoppingNote[];
  routineLogs: string[];
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
  toggleRoutineTask: (routineId: string, taskIndex: number, memberName: string) => void;
  assignMeal: (day: string, meal: string, foodIds: string[], member: string) => void;
  toggleAte: (id: string) => void;
  addSchoolTask: (task: Omit<SchoolTask, 'id' | 'completed'>) => void;
  updateSchoolTask: (id: string, task: Partial<SchoolTask>) => void;
  deleteSchoolTask: (id: string) => void;
  toggleSchoolTask: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);

  // Estados iniciales corregidos
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Raúl', role: 'parent', avatar: '👨' },
    { id: '2', name: 'Tania', role: 'parent', avatar: '👩' },
    { id: '3', name: 'Alan', role: 'child', avatar: '👦' },
    { id: '4', name: 'Aria', role: 'child', avatar: '👧' }
  ]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuItem[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [schoolTasks, setSchoolTasks] = useState<SchoolTask[]>([]);
  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', description: 'No comer la comida', points: -50, category: 'Comida' },
    { id: '2', description: 'No sacar la basura', points: -20, category: 'Hogar' },
    { id: '3', description: 'Ayudar a alguien', points: 30, category: 'Conducta' }
  ]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingNotes, setShoppingNotes] = useState<ShoppingNote[]>([]);
  const [routineLogs, setRoutineLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!db) { setIsCloudLoaded(true); return; }
    const unsub = onSnapshot(doc(db, 'familyhub', 'main_state'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.members) setMembers(data.members);
        if (data.foods) setFoods(data.foods);
        if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
        if (data.chores) setChores(data.chores);
        if (data.schoolTasks) setSchoolTasks(data.schoolTasks);
        if (data.pointLogs) setPointLogs(data.pointLogs);
        if (data.rules) setRules(data.rules);
        if (data.routines) setRoutines(data.routines);
        if (data.products) setProducts(data.products);
        if (data.shoppingNotes) setShoppingNotes(data.shoppingNotes);
        if (data.routineLogs) setRoutineLogs(data.routineLogs);
      }
      setIsCloudLoaded(true);
    });
    return () => unsub();
  }, []);

  const sanitize = (obj: any): any => JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));

  useEffect(() => {
    if (!isCloudLoaded) return;
    if (db) {
      const payload = sanitize({ members, foods, weeklyMenu, chores, schoolTasks, pointLogs, rules, routines, products, shoppingNotes, routineLogs });
      setDoc(doc(db, 'familyhub', 'main_state'), payload, { merge: true }).catch(console.error);
    }
  }, [members, foods, weeklyMenu, chores, schoolTasks, pointLogs, rules, routines, products, shoppingNotes, routineLogs, isCloudLoaded]);

  const points = members.reduce((acc, m) => {
    acc[m.name] = pointLogs.filter(l => l.member === m.name).reduce((sum, l) => sum + l.points, 0);
    return acc;
  }, {} as { [key: string]: number });

  // CRUD Implementations
  const addFood = (f: Omit<Food, 'id'>) => setFoods([...foods, { ...f, id: Date.now().toString() }]);
  const updateFood = (id: string, f: Partial<Food>) => setFoods(foods.map(x => x.id === id ? { ...x, ...f } as Food : x));
  const deleteFood = (id: string) => setFoods(foods.filter(x => x.id !== id));

  const addProduct = (p: Omit<Product, 'id'>) => setProducts([...products, { ...p, id: Date.now().toString() }]);
  const updateProduct = (id: string, p: Partial<Product>) => setProducts(products.map(x => x.id === id ? { ...x, ...p } as Product : x));
  const deleteProduct = (id: string) => setProducts(products.filter(x => x.id !== id));

  const addChore = (c: Omit<Chore, 'id' | 'status'>) => setChores([...chores, { ...c, id: Date.now().toString(), status: 'Pendiente' }]);
  const updateChore = (id: string, c: Partial<Chore>) => setChores(chores.map(x => x.id === id ? { ...x, ...c } as Chore : x));
  const deleteChore = (id: string) => setChores(chores.filter(x => x.id !== id));
  const toggleChore = (id: string) => {
    setChores(chores.map(c => {
      if (c.id === id) {
        const isDone = c.status === 'Pendiente';
        if (isDone && !['Raúl', 'Tania', 'Familia'].includes(c.user)) {
           addPointLog({ member: c.user, description: `Tarea: ${c.name}`, points: c.points });
        }
        return { ...c, status: isDone ? 'Hecho' : 'Pendiente' };
      }
      return c;
    }));
  };

  const addRule = (r: Omit<Rule, 'id'>) => setRules([...rules, { ...r, id: Date.now().toString() }]);
  const updateRule = (id: string, r: Partial<Rule>) => setRules(rules.map(x => x.id === id ? { ...x, ...r } as Rule : x));
  const deleteRule = (id: string) => setRules(rules.filter(x => x.id !== id));

  const addPointLog = (l: Omit<PointLog, 'id' | 'date'>) => setPointLogs([...pointLogs, { ...l, id: Date.now().toString(), date: new Date().toISOString() }]);
  const deletePointLog = (id: string) => setPointLogs(pointLogs.filter(x => x.id !== id));

  const addRoutine = (r: Omit<Routine, 'id'>) => setRoutines([...routines, { ...r, id: Date.now().toString() }]);
  const updateRoutine = (id: string, r: Partial<Routine>) => setRoutines(routines.map(x => x.id === id ? { ...x, ...r } as Routine : x));
  const deleteRoutine = (id: string) => setRoutines(routines.filter(x => x.id !== id));
  
  const toggleRoutineTask = (rid: string, idx: number, mName: string) => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const key = `${todayStr}_${rid}_${idx}`;
    setRoutineLogs(prev => {
      if (prev.includes(key)) return prev.filter(x => x !== key);
      const next = [...prev, key];
      const routine = routines.find(r => r.id === rid);
      if (routine) {
        const routineTasksDone = next.filter(k => k.startsWith(`${todayStr}_${rid}_`)).length;
        if (routineTasksDone === routine.tasks.length) {
          addPointLog({ member: mName, description: `Rutina: ${routine.name}`, points: 30 });
        }
      }
      return next;
    });
  };

  const updateMember = (id: string, m: Partial<Member>) => setMembers(members.map(item => item.id === id ? { ...item, ...m } as Member : item));

  const assignMeal = (d: string, m: string, ids: string[], mem: string) => {
    setWeeklyMenu(prev => {
      const filtered = prev.filter(x => !(x.day === d && x.meal === m && x.member === mem));
      return ids.length ? [...filtered, { id: Date.now().toString(), day: d, meal: m, foodIds: ids, member: mem, ate: false }] : filtered;
    });
  };
  const toggleAte = (id: string) => setWeeklyMenu(weeklyMenu.map(x => x.id === id ? { ...x, ate: !x.ate } : x));

  const addSchoolTask = (t: Omit<SchoolTask, 'id' | 'completed'>) => setSchoolTasks([...schoolTasks, { ...t, id: Date.now().toString(), completed: false }]);
  const updateSchoolTask = (id: string, t: Partial<SchoolTask>) => setSchoolTasks(schoolTasks.map(x => x.id === id ? { ...x, ...t } as SchoolTask : x));
  const deleteSchoolTask = (id: string) => setSchoolTasks(schoolTasks.filter(x => x.id !== id));
  const toggleSchoolTask = (id: string) => setSchoolTasks(schoolTasks.map(x => x.id === id ? { ...x, completed: !x.completed } : x));

  return (
    <DataContext.Provider value={{ 
      foods, chores, schoolTasks, weeklyMenu, pointLogs, rules, members, routines, products, shoppingNotes, points, routineLogs,
      addFood, updateFood, deleteFood, addProduct, updateProduct, deleteProduct, addChore, updateChore, deleteChore, toggleChore,
      addRule, updateRule, deleteRule, addPointLog, deletePointLog, updateMember, addRoutine, updateRoutine, deleteRoutine, toggleRoutineTask,
      assignMeal, toggleAte, updateSchoolTask, addSchoolTask, deleteSchoolTask, toggleSchoolTask,
      addShoppingNote: (t) => setShoppingNotes([...shoppingNotes, { id: Date.now().toString(), text: t, createdAt: new Date().toISOString() }]), deleteShoppingNote: (id) => setShoppingNotes(shoppingNotes.filter(x => x.id !== id))
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
