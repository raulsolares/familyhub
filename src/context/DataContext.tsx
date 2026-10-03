import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { todayKey, weekStartKey } from '../utils/dates';
import {
  SEED_MEMBERS, SEED_FOODS, SEED_FOOD_GROUP_LIMITS, SEED_PRODUCTS, SEED_ROUTINES,
  SEED_CHORES, SEED_PRIZES, SEED_RULES, SEED_EVENTS,
} from '../data/seed';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  unit: string;
  category: string;
}

export interface Food {
  id: string;
  name: string;
  categories: string[];
  ingredients: Ingredient[];
  /** Máximo de porciones por niño a la semana */
  maxPerWeek?: number;
  /** Grupo (Dulces, Comida rápida...) con tope semanal en foodGroupLimits */
  group?: string;
  isFavorite?: boolean;
  calories?: number;
  prepTime?: number;
  portionLabel?: string;
}

export interface WeeklyMenuItem {
  id: string;
  day: string;
  meal: string;
  foodIds: string[];
  quantities: { [foodId: string]: number };
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
  /** Derivado de lastDone: se reinicia cada día (o cada semana si freq es semanal) */
  status: 'Hecho' | 'Pendiente';
  points: number;
  routineId?: string;
  lastDone?: string;
  doneBy?: string;
}

export interface Routine {
  id: string;
  member: string;
  name: string;
  time: string;
  tasks: string[];
  icon: string;
  imageUrl?: string;
}

export interface SchoolTask {
  id: string;
  child: string;
  title: string;
  desc: string;
  eventDate: string;
  eventTime?: string;
  deadline: string;
  category: string;
  completed: boolean;
}

export interface Grade {
  id: string;
  child: string;
  subject: string;
  period: string;
  score: number;
  date: string;
  notes?: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  /** Nombres de miembros, o 'Familia' */
  members: string[];
  color?: string;
  notes?: string;
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
  reason?: string;
  appliedBy?: string;
  points: number;
  date: string;
  /** Identifica el origen (tarea/rutina/día) para no duplicar ni dejar puntos huérfanos */
  sourceKey?: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar: string;
  /** PIN de acceso. Opcional para niños. */
  pin?: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  points: number;
  imageUrl?: string;
  available: boolean;
  category?: string;
}

export interface PrizeRequest {
  id: string;
  member: string;
  prizeId: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  notes?: string;
}

export interface CustomShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price?: number;
  checked: boolean;
  createdAt: string;
}

export interface ExtraItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  price?: number;
}

interface AppState {
  members: Member[];
  foods: Food[];
  weeklyMenu: WeeklyMenuItem[];
  chores: Chore[];
  schoolTasks: SchoolTask[];
  grades: Grade[];
  familyEvents: FamilyEvent[];
  pointLogs: PointLog[];
  rules: Rule[];
  routines: Routine[];
  products: Product[];
  shoppingNotes: ShoppingNote[];
  routineLogs: string[];
  ingredientItems: IngredientItem[];
  schoolCategories: string[];
  prizes: Prize[];
  prizeRequests: PrizeRequest[];
  customShoppingItems: CustomShoppingItem[];
  extraItems: ExtraItem[];
  foodGroupLimits: Record<string, number>;
}

// ── Context type ─────────────────────────────────────────────────────────────

interface DataContextType extends Omit<AppState, 'chores'> {
  chores: Chore[];
  points: { [key: string]: number };
  isCloudEnabled: boolean;

  addFood: (food: Omit<Food, 'id'>) => void;
  updateFood: (id: string, food: Partial<Food>) => void;
  deleteFood: (id: string) => void;
  clearFoods: () => void;
  setFoodGroupLimit: (group: string, limit: number | null) => void;

  addIngredientItem: (item: Omit<IngredientItem, 'id'>) => void;
  deleteIngredientItem: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addShoppingNote: (text: string) => void;
  deleteShoppingNote: (id: string) => void;

  addChore: (chore: Omit<Chore, 'id' | 'status'>) => void;
  updateChore: (id: string, chore: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  /** doneBy: quien la marca (para tareas de 'Familia' los puntos van a ese niño) */
  toggleChore: (id: string, doneBy?: string) => void;

  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  deleteRule: (id: string) => void;

  addPointLog: (log: Omit<PointLog, 'id' | 'date'>) => void;
  deletePointLog: (id: string) => void;

  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;

  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineTask: (routineId: string, taskIndex: number, memberName: string) => void;

  assignMeal: (day: string, meal: string, foodIds: string[], member: string, quantities?: { [fid: string]: number }) => void;
  toggleAte: (id: string) => void;
  clearWeeklyMenu: () => void;

  addSchoolTask: (task: Omit<SchoolTask, 'id' | 'completed'>) => void;
  updateSchoolTask: (id: string, task: Partial<SchoolTask>) => void;
  deleteSchoolTask: (id: string) => void;
  toggleSchoolTask: (id: string, byKid?: boolean) => void;
  updateSchoolCategories: (categories: string[]) => void;

  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, grade: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;

  addFamilyEvent: (ev: Omit<FamilyEvent, 'id'>) => void;
  updateFamilyEvent: (id: string, ev: Partial<FamilyEvent>) => void;
  deleteFamilyEvent: (id: string) => void;

  addPrize: (prize: Omit<Prize, 'id'>) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  deletePrize: (id: string) => void;

  addPrizeRequest: (req: Omit<PrizeRequest, 'id' | 'date' | 'status'>) => void;
  updatePrizeRequest: (id: string, req: Partial<PrizeRequest>) => void;
  deletePrizeRequest: (id: string) => void;

  addCustomShoppingItem: (item: Omit<CustomShoppingItem, 'id' | 'checked' | 'createdAt'>) => void;
  updateCustomShoppingItem: (id: string, item: Partial<CustomShoppingItem>) => void;
  toggleCustomShoppingItem: (id: string) => void;
  deleteCustomShoppingItem: (id: string) => void;
  clearCustomShoppingItems: () => void;

  addExtraItem: (item: Omit<ExtraItem, 'id'>) => void;
  updateExtraItem: (id: string, item: Partial<ExtraItem>) => void;
  deleteExtraItem: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fh_state_v2';
const ROUTINE_POINTS = 30;
const PERFECT_DAY_POINTS = 20;
const SCHOOL_TASK_POINTS = 10;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isWeekly = (freq: string) => /seman/i.test(freq);

const chorePeriodKey = (c: Pick<Chore, 'freq'>, day = todayKey()) => {
  if (!isWeekly(c.freq)) return day;
  const [y, m, d] = day.split('-').map(Number);
  return weekStartKey(new Date(y, m - 1, d));
};

const isChoreDone = (c: Chore) =>
  !!c.lastDone && chorePeriodKey(c, c.lastDone) === chorePeriodKey(c);

const isKidName = (members: Member[], name: string) =>
  members.some(m => m.name === name && m.role === 'child');

const seedState = (): AppState => ({
  members: SEED_MEMBERS,
  foods: SEED_FOODS,
  weeklyMenu: [],
  chores: SEED_CHORES,
  schoolTasks: [],
  grades: [],
  familyEvents: SEED_EVENTS(),
  pointLogs: [],
  rules: SEED_RULES,
  routines: SEED_ROUTINES,
  products: SEED_PRODUCTS,
  shoppingNotes: [],
  routineLogs: [],
  ingredientItems: [],
  schoolCategories: ['Llevar material', 'Pagar', 'Examen', 'Evento', 'Sin clases', 'Tarea', 'Otro'],
  prizes: SEED_PRIZES,
  prizeRequests: [],
  customShoppingItems: [],
  extraItems: [],
  foodGroupLimits: SEED_FOOD_GROUP_LIMITS,
});

/** Acepta datos guardados (local o nube) de versiones anteriores y los normaliza */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (base: AppState, data: Record<string, any>): AppState => {
  const next: AppState = { ...base };
  (Object.keys(base) as (keyof AppState)[]).forEach(k => {
    if (data[k] !== undefined && data[k] !== null) (next as unknown as Record<string, unknown>)[k] = data[k];
  });
  next.members = next.members.map(m => ({
    ...m,
    pin: m.pin || (m.role === 'parent' ? '1234' : undefined),
  }));
  next.weeklyMenu = next.weeklyMenu.map(m => ({ ...m, quantities: m.quantities || {} }));
  next.schoolTasks = next.schoolTasks.map(t => {
    const legacy = t as SchoolTask & { date?: string };
    return {
      ...t,
      eventDate: t.eventDate || legacy.date || '',
      deadline: t.deadline || t.eventDate || legacy.date || '',
      category: t.category || 'Otro',
    };
  });
  // Tareas marcadas 'Hecho' antes de existir lastDone: se respetan como hechas hoy
  next.chores = next.chores.map(c =>
    c.status === 'Hecho' && !c.lastDone ? { ...c, lastDone: todayKey() } : c,
  );
  return next;
};

const loadLocal = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(seedState(), JSON.parse(raw));
  } catch { /* datos corruptos: arrancar con ejemplo */ }
  return seedState();
};

const stripUndefined = <T,>(obj: T): T =>
  JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));

// ── Provider ─────────────────────────────────────────────────────────────────

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadLocal);
  const [isCloudLoaded, setIsCloudLoaded] = useState(!db);
  const lastRemoteJson = useRef<string>('');

  // Escucha cambios en la nube (si Firebase está configurado)
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      doc(db, 'familyhub', 'main_state'),
      (snap) => {
        if (snap.metadata.hasPendingWrites) return; // eco de nuestra propia escritura
        if (snap.exists()) {
          const data = snap.data();
          setState(prev => {
            const merged = normalize(prev, data);
            lastRemoteJson.current = JSON.stringify(stripUndefined(merged));
            return merged;
          });
        }
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error('Firestore no disponible, se usa modo local', err);
        setIsCloudLoaded(true);
      },
    );
    return () => unsub();
  }, []);

  // Persiste localmente siempre, y en la nube cuando hay Firebase
  useEffect(() => {
    if (!isCloudLoaded) return;
    const payload = stripUndefined(state);
    const json = JSON.stringify(payload);
    try { localStorage.setItem(STORAGE_KEY, json); } catch { /* almacenamiento lleno o bloqueado */ }
    if (db && json !== lastRemoteJson.current) {
      lastRemoteJson.current = json;
      setDoc(doc(db, 'familyhub', 'main_state'), payload).catch(console.error);
    }
  }, [state, isCloudLoaded]);

  // ── Helpers de actualización ───────────────────────────────────────────────

  const patch = (fn: (s: AppState) => Partial<AppState>) =>
    setState(s => ({ ...s, ...fn(s) }));

  type ListKey = {
    [K in keyof AppState]: AppState[K] extends { id: string }[] ? K : never
  }[keyof AppState];

  const addTo = <K extends ListKey>(key: K, item: Omit<AppState[K][number], 'id'>) =>
    patch(s => ({ [key]: [...s[key], { ...item, id: uid() }] }) as Partial<AppState>);
  const updateIn = <K extends ListKey>(key: K, id: string, changes: Partial<AppState[K][number]>) =>
    patch(s => ({ [key]: (s[key] as { id: string }[]).map(x => (x.id === id ? { ...x, ...changes } : x)) }) as Partial<AppState>);
  const removeFrom = <K extends ListKey>(key: K, id: string) =>
    patch(s => ({ [key]: (s[key] as { id: string }[]).filter(x => x.id !== id) }) as Partial<AppState>);

  const newLog = (l: Omit<PointLog, 'id' | 'date'>): PointLog =>
    ({ ...l, id: uid(), date: new Date().toISOString() });

  // ── Computed ───────────────────────────────────────────────────────────────

  const chores = state.chores.map(c => ({ ...c, status: isChoreDone(c) ? 'Hecho' : 'Pendiente' } as Chore));

  const points = state.members.reduce((acc, m) => {
    acc[m.name] = state.pointLogs
      .filter(l => l.member === m.name)
      .reduce((sum, l) => sum + l.points, 0);
    return acc;
  }, {} as { [key: string]: number });

  // ── Acciones con lógica ────────────────────────────────────────────────────

  const toggleChore = (id: string, doneBy?: string) => patch(s => {
    const chore = s.chores.find(c => c.id === id);
    if (!chore) return {};
    const key = `chore_${id}_${chorePeriodKey(chore)}`;
    if (isChoreDone(chore)) {
      return {
        chores: s.chores.map(c => (c.id === id ? { ...c, lastDone: undefined, doneBy: undefined } : c)),
        pointLogs: s.pointLogs.filter(l => l.sourceKey !== key),
      };
    }
    const earner = isKidName(s.members, chore.user)
      ? chore.user
      : doneBy && isKidName(s.members, doneBy) ? doneBy : null;
    const alreadyLogged = s.pointLogs.some(l => l.sourceKey === key);
    return {
      chores: s.chores.map(c => (c.id === id ? { ...c, lastDone: todayKey(), doneBy } : c)),
      pointLogs: earner && !alreadyLogged
        ? [...s.pointLogs, newLog({ member: earner, description: `Tarea: ${chore.name}`, points: chore.points, sourceKey: key })]
        : s.pointLogs,
    };
  });

  const toggleRoutineTask = (rid: string, idx: number, memberName: string) => patch(s => {
    const today = todayKey();
    const key = `${today}_${rid}_${idx}`;
    const routine = s.routines.find(r => r.id === rid);
    const routineLogs = s.routineLogs.includes(key)
      ? s.routineLogs.filter(x => x !== key)
      : [...s.routineLogs, key];
    if (!routine) return { routineLogs };

    const isComplete = (r: Routine, logs: string[]) =>
      r.tasks.length > 0 && r.tasks.every((_, i) => logs.includes(`${today}_${r.id}_${i}`));

    const routineKey = `routine_${today}_${rid}`;
    const perfectKey = `perfect_${today}_${memberName}`;
    let pointLogs = s.pointLogs.filter(l => l.sourceKey !== routineKey && l.sourceKey !== perfectKey);
    const prevRoutineLog = s.pointLogs.find(l => l.sourceKey === routineKey);
    const prevPerfectLog = s.pointLogs.find(l => l.sourceKey === perfectKey);

    if (isComplete(routine, routineLogs)) {
      pointLogs.push(prevRoutineLog || newLog({ member: memberName, description: `Rutina: ${routine.name}`, points: ROUTINE_POINTS, sourceKey: routineKey }));
    }
    const mine = s.routines.filter(r => r.member === memberName && r.tasks.length > 0);
    if (mine.length > 1 && mine.every(r => isComplete(r, routineLogs))) {
      pointLogs.push(prevPerfectLog || newLog({ member: memberName, description: '¡Día perfecto! Todas las rutinas', points: PERFECT_DAY_POINTS, sourceKey: perfectKey }));
    }
    // Solo niños ganan puntos
    if (!isKidName(s.members, memberName)) pointLogs = s.pointLogs;
    // Limpia registros de rutinas de más de 60 días
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
    const cutoffKey = cutoff.toLocaleDateString('en-CA');
    return { routineLogs: routineLogs.filter(k => k.slice(0, 10) >= cutoffKey), pointLogs };
  });

  const toggleSchoolTask = (id: string, byKid = false) => patch(s => {
    const task = s.schoolTasks.find(t => t.id === id);
    if (!task) return {};
    const key = `school_${id}`;
    const completed = !task.completed;
    let pointLogs = s.pointLogs.filter(l => l.sourceKey !== key);
    if (completed && byKid && isKidName(s.members, task.child)) {
      pointLogs = [...pointLogs, newLog({ member: task.child, description: `Escuela: ${task.title}`, points: SCHOOL_TASK_POINTS, sourceKey: key })];
    }
    return {
      schoolTasks: s.schoolTasks.map(t => (t.id === id ? { ...t, completed } : t)),
      pointLogs,
    };
  });

  const assignMeal = (
    d: string, m: string, ids: string[], mem: string,
    quantities: { [fid: string]: number } = {},
  ) => patch(s => {
    const filtered = s.weeklyMenu.filter(x => !(x.day === d && x.meal === m && x.member === mem));
    if (!ids.length) return { weeklyMenu: filtered };
    return { weeklyMenu: [...filtered, { id: uid(), day: d, meal: m, foodIds: ids, quantities, member: mem, ate: false }] };
  });

  const setFoodGroupLimit = (group: string, limit: number | null) => patch(s => {
    const next = { ...s.foodGroupLimits };
    if (limit === null || Number.isNaN(limit)) delete next[group];
    else next[group] = limit;
    return { foodGroupLimits: next };
  });

  return (
    <DataContext.Provider value={{
      ...state,
      chores,
      points,
      isCloudEnabled: !!db,

      addFood: (f) => addTo('foods', f),
      updateFood: (id, f) => updateIn('foods', id, f),
      deleteFood: (id) => removeFrom('foods', id),
      clearFoods: () => patch(() => ({ foods: [], ingredientItems: [] })),
      setFoodGroupLimit,

      addIngredientItem: (i) => addTo('ingredientItems', i),
      deleteIngredientItem: (id) => removeFrom('ingredientItems', id),

      addProduct: (p) => addTo('products', p),
      updateProduct: (id, p) => updateIn('products', id, p),
      deleteProduct: (id) => removeFrom('products', id),

      addShoppingNote: (text) => addTo('shoppingNotes', { text, createdAt: new Date().toISOString() }),
      deleteShoppingNote: (id) => removeFrom('shoppingNotes', id),

      addChore: (c) => addTo('chores', { ...c, status: 'Pendiente' }),
      updateChore: (id, c) => updateIn('chores', id, c),
      deleteChore: (id) => removeFrom('chores', id),
      toggleChore,

      addRule: (r) => addTo('rules', r),
      updateRule: (id, r) => updateIn('rules', id, r),
      deleteRule: (id) => removeFrom('rules', id),

      addPointLog: (l) => patch(s => ({ pointLogs: [...s.pointLogs, newLog(l)] })),
      deletePointLog: (id) => removeFrom('pointLogs', id),

      addMember: (m) => addTo('members', m),
      updateMember: (id, m) => updateIn('members', id, m),

      addRoutine: (r) => addTo('routines', r),
      updateRoutine: (id, r) => updateIn('routines', id, r),
      deleteRoutine: (id) => removeFrom('routines', id),
      toggleRoutineTask,

      assignMeal,
      toggleAte: (id) => patch(s => ({ weeklyMenu: s.weeklyMenu.map(x => (x.id === id ? { ...x, ate: !x.ate } : x)) })),
      clearWeeklyMenu: () => patch(() => ({ weeklyMenu: [] })),

      addSchoolTask: (t) => addTo('schoolTasks', { ...t, completed: false }),
      updateSchoolTask: (id, t) => updateIn('schoolTasks', id, t),
      deleteSchoolTask: (id) => removeFrom('schoolTasks', id),
      toggleSchoolTask,
      updateSchoolCategories: (cats) => patch(() => ({ schoolCategories: cats })),

      addGrade: (g) => addTo('grades', g),
      updateGrade: (id, g) => updateIn('grades', id, g),
      deleteGrade: (id) => removeFrom('grades', id),

      addFamilyEvent: (e) => addTo('familyEvents', e),
      updateFamilyEvent: (id, e) => updateIn('familyEvents', id, e),
      deleteFamilyEvent: (id) => removeFrom('familyEvents', id),

      addPrize: (p) => addTo('prizes', p),
      updatePrize: (id, p) => updateIn('prizes', id, p),
      deletePrize: (id) => removeFrom('prizes', id),

      addPrizeRequest: (r) => addTo('prizeRequests', { ...r, date: new Date().toISOString(), status: 'pending' }),
      updatePrizeRequest: (id, r) => updateIn('prizeRequests', id, r),
      deletePrizeRequest: (id) => removeFrom('prizeRequests', id),

      addCustomShoppingItem: (i) => addTo('customShoppingItems', { ...i, checked: false, createdAt: new Date().toISOString() }),
      updateCustomShoppingItem: (id, i) => updateIn('customShoppingItems', id, i),
      toggleCustomShoppingItem: (id) => patch(s => ({ customShoppingItems: s.customShoppingItems.map(x => (x.id === id ? { ...x, checked: !x.checked } : x)) })),
      deleteCustomShoppingItem: (id) => removeFrom('customShoppingItems', id),
      clearCustomShoppingItems: () => patch(() => ({ customShoppingItems: [] })),

      addExtraItem: (i) => addTo('extraItems', i),
      updateExtraItem: (id, i) => updateIn('extraItems', id, i),
      deleteExtraItem: (id) => removeFrom('extraItems', id),
    }}>
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
