import {
  LayoutDashboard, Utensils, ShoppingCart, GraduationCap, CheckSquare, Trophy,
  CalendarDays, Settings, Clock, ChefHat, BookOpen, TrendingUp,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Hogar',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/calendar', icon: CalendarDays, label: 'Calendario' },
    ],
  },
  {
    label: 'Comida',
    items: [
      { to: '/menu', icon: Utensils, label: 'Menú semanal' },
      { to: '/food', icon: BookOpen, label: 'Platillos' },
      { to: '/shopping', icon: ShoppingCart, label: 'Súper' },
      { to: '/prep', icon: ChefHat, label: 'Cocina hoy' },
    ],
  },
  {
    label: 'Niños',
    items: [
      { to: '/chores', icon: CheckSquare, label: 'Tareas' },
      { to: '/routines', icon: Clock, label: 'Rutinas' },
      { to: '/habits', icon: TrendingUp, label: 'Hábitos' },
      { to: '/school', icon: GraduationCap, label: 'Escuela' },
      { to: '/rewards', icon: Trophy, label: 'Puntos y premios' },
    ],
  },
  {
    label: '',
    items: [{ to: '/settings', icon: Settings, label: 'Configuración' }],
  },
];
