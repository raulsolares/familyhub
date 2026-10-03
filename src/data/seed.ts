// Datos de ejemplo para el primer arranque. Los papás pueden editarlos o borrarlos.
import type {
  Member, Food, Routine, Chore, Prize, Rule, Product, FamilyEvent,
} from '../context/DataContext';

export const SEED_MEMBERS: Member[] = [
  { id: '1', name: 'Raúl', role: 'parent', avatar: '👨', pin: '1234' },
  { id: '2', name: 'Tania', role: 'parent', avatar: '👩', pin: '1234' },
  { id: '3', name: 'Alan', role: 'child', avatar: '👦' },
  { id: '4', name: 'Aria', role: 'child', avatar: '👧' },
];

export const SEED_FOOD_GROUP_LIMITS: Record<string, number> = {
  Dulces: 3,
  'Comida rápida': 2,
};

const ing = (name: string, amount: number, unit: string) => ({ name, amount, unit });

export const SEED_FOODS: Food[] = [
  { id: 'f1', name: 'Hot cakes', emoji: '🥞', categories: ['Desayuno'], group: 'Harinas', maxPerWeek: 2, ingredients: [ing('Harina para hot cakes', 100, 'gr'), ing('Leche', 150, 'ml'), ing('Huevo', 1, 'pzas')] },
  { id: 'f2', name: 'Huevo revuelto', emoji: '🍳', categories: ['Desayuno', 'Cena'], group: 'Proteína', ingredients: [ing('Huevo', 2, 'pzas')] },
  { id: 'f3', name: 'Cereal con leche', emoji: '🥣', categories: ['Desayuno', 'Cena'], group: 'Dulces', maxPerWeek: 3, ingredients: [ing('Cereal', 40, 'gr'), ing('Leche', 200, 'ml')] },
  { id: 'f4', name: 'Fruta con yogurt', emoji: '🍓', categories: ['Desayuno', 'Lunch'], group: 'Frutas y verduras', ingredients: [ing('Yogurt', 1, 'pzas'), ing('Plátano', 1, 'pzas')] },
  { id: 'f5', name: 'Molletes', emoji: '🥖', categories: ['Desayuno', 'Cena'], group: 'Harinas', ingredients: [ing('Bolillo', 1, 'pzas'), ing('Frijoles', 80, 'gr'), ing('Queso', 40, 'gr')] },
  { id: 'f6', name: 'Sándwich de jamón', emoji: '🥪', categories: ['Lunch', 'Cena'], group: 'Harinas', ingredients: [ing('Pan de caja', 2, 'pzas'), ing('Jamón', 2, 'pzas'), ing('Queso', 1, 'pzas')] },
  { id: 'f7', name: 'Galletas', emoji: '🍪', categories: ['Lunch'], group: 'Dulces', maxPerWeek: 2, ingredients: [ing('Galletas', 1, 'paq')] },
  { id: 'f8', name: 'Pepino y zanahoria', emoji: '🥕', categories: ['Lunch'], group: 'Frutas y verduras', ingredients: [ing('Pepino', 1, 'pzas'), ing('Zanahoria', 1, 'pzas')] },
  { id: 'f9', name: 'Pollo con arroz', emoji: '🍗', categories: ['Comida'], group: 'Proteína', ingredients: [ing('Pechuga de pollo', 150, 'gr'), ing('Arroz', 80, 'gr')] },
  { id: 'f10', name: 'Pasta', emoji: '🍝', categories: ['Comida'], group: 'Harinas', maxPerWeek: 2, ingredients: [ing('Pasta', 100, 'gr'), ing('Puré de tomate', 100, 'ml')] },
  { id: 'f11', name: 'Tacos de bistec', emoji: '🌮', categories: ['Comida', 'Cena'], group: 'Proteína', ingredients: [ing('Bistec', 150, 'gr'), ing('Tortillas', 4, 'pzas')] },
  { id: 'f12', name: 'Sopa de verduras', emoji: '🍲', categories: ['Comida'], group: 'Frutas y verduras', ingredients: [ing('Calabacita', 1, 'pzas'), ing('Zanahoria', 1, 'pzas'), ing('Papa', 1, 'pzas')] },
  { id: 'f13', name: 'Pizza', emoji: '🍕', categories: ['Comida', 'Cena'], group: 'Comida rápida', maxPerWeek: 1, ingredients: [ing('Pizza congelada', 1, 'pzas')] },
  { id: 'f14', name: 'Hamburguesa', emoji: '🍔', categories: ['Comida', 'Cena'], group: 'Comida rápida', maxPerWeek: 1, ingredients: [ing('Carne para hamburguesa', 1, 'pzas'), ing('Pan de hamburguesa', 1, 'pzas')] },
  { id: 'f15', name: 'Quesadillas', emoji: '🫓', categories: ['Cena'], group: 'Harinas', ingredients: [ing('Tortillas', 3, 'pzas'), ing('Queso', 60, 'gr')] },
  { id: 'f16', name: 'Helado', emoji: '🍦', categories: ['Comida', 'Cena'], group: 'Dulces', maxPerWeek: 1, ingredients: [ing('Helado', 1, 'pzas')] },
];

export const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Leche', price: 28, defaultQty: 1000, unit: 'ml', category: 'Lácteos' },
  { id: 'p2', name: 'Huevo', price: 4, defaultQty: 1, unit: 'pzas', category: 'Proteínas' },
  { id: 'p3', name: 'Tortillas', price: 1, defaultQty: 1, unit: 'pzas', category: 'Panadería' },
  { id: 'p4', name: 'Queso', price: 12, defaultQty: 100, unit: 'gr', category: 'Lácteos' },
  { id: 'p5', name: 'Pechuga de pollo', price: 18, defaultQty: 100, unit: 'gr', category: 'Proteínas' },
];

export const SEED_ROUTINES: Routine[] = [
  { id: 'r1', member: 'Alan', name: 'Mañana lista', time: '07:00', icon: '🌅', tasks: ['Tender la cama', 'Lavarme los dientes', 'Vestirme', 'Preparar mochila'] },
  { id: 'r2', member: 'Alan', name: 'Hora de tarea', time: '16:00', icon: '📚', days: [1, 2, 3, 4, 5], tasks: ['Hacer la tarea', 'Leer 20 minutos'] },
  { id: 'r3', member: 'Alan', name: 'Noche tranquila', time: '20:00', icon: '🌙', tasks: ['Bañarme', 'Pijama', 'Lavarme los dientes'] },
  { id: 'r4', member: 'Aria', name: 'Mañana lista', time: '07:00', icon: '🌅', tasks: ['Tender la cama', 'Lavarme los dientes', 'Vestirme', 'Peinarme'] },
  { id: 'r5', member: 'Aria', name: 'Hora de tarea', time: '16:00', icon: '📚', days: [1, 2, 3, 4, 5], tasks: ['Hacer la tarea', 'Practicar lectura'] },
  { id: 'r6', member: 'Aria', name: 'Noche tranquila', time: '20:00', icon: '🌙', tasks: ['Bañarme', 'Pijama', 'Lavarme los dientes'] },
];

export const SEED_CHORES: Chore[] = [
  { id: 'c1', name: 'Recoger mis juguetes', user: 'Alan', freq: 'Diario', status: 'Pendiente', points: 15 },
  { id: 'c2', name: 'Poner la mesa', user: 'Aria', freq: 'Diario', status: 'Pendiente', points: 15 },
  { id: 'c3', name: 'Sacar la basura', user: 'Alan', freq: 'Diario', status: 'Pendiente', points: 20 },
  { id: 'c4', name: 'Dar de comer a la mascota', user: 'Aria', freq: 'Diario', status: 'Pendiente', points: 20 },
  { id: 'c5', name: 'Ordenar mi cuarto', user: 'Alan', freq: 'Semanal', status: 'Pendiente', points: 50 },
  { id: 'c6', name: 'Ordenar mi cuarto', user: 'Aria', freq: 'Semanal', status: 'Pendiente', points: 50 },
];

export const SEED_PRIZES: Prize[] = [
  { id: 'z1', name: '30 min extra de pantalla', description: 'Tablet o videojuegos', points: 100, available: true },
  { id: 'z2', name: 'Elegir la película del viernes', description: 'Noche de cine familiar', points: 150, available: true },
  { id: 'z3', name: 'Salida por helado', description: 'Con papá o mamá', points: 300, available: true },
  { id: 'z4', name: 'Juguete sorpresa', description: 'Hasta $200', points: 800, available: true },
];

export const SEED_RULES: Rule[] = [
  { id: '1', description: 'No comer la comida', points: -50, category: 'Comida' },
  { id: '2', description: 'No sacar la basura', points: -20, category: 'Hogar' },
  { id: '3', description: 'Ayudar a alguien', points: 30, category: 'Conducta' },
  { id: '4', description: 'Buena calificación', points: 50, category: 'Escuela' },
];

export const SEED_EVENTS = (): FamilyEvent[] => {
  const d = new Date();
  const sat = new Date(d.getFullYear(), d.getMonth(), d.getDate() + ((6 - d.getDay() + 7) % 7));
  return [
    { id: 'e1', title: 'Día de parque en familia', date: sat.toLocaleDateString('en-CA'), time: '10:00', members: ['Familia'], color: '#10b981' },
  ];
};
