// Estado de ánimo: mañana, tarde y noche

export type MoodSlot = 'morning' | 'afternoon' | 'evening';

export const MOOD_SLOTS: { id: MoodSlot; label: string; emoji: string; question: string }[] = [
  { id: 'morning', label: 'Mañana', emoji: '🌅', question: '¿Cómo amaneciste?' },
  { id: 'afternoon', label: 'Tarde', emoji: '☀️', question: '¿Cómo va tu tarde?' },
  { id: 'evening', label: 'Noche', emoji: '🌙', question: '¿Cómo te fue hoy?' },
];

export const MOODS: { id: string; emoji: string; label: string; tough?: boolean }[] = [
  { id: 'feliz', emoji: '😄', label: 'Feliz' },
  { id: 'tranquilo', emoji: '🙂', label: 'Tranquilo' },
  { id: 'cansado', emoji: '🥱', label: 'Cansado' },
  { id: 'preocupado', emoji: '😟', label: 'Preocupado', tough: true },
  { id: 'triste', emoji: '😢', label: 'Triste', tough: true },
  { id: 'enojado', emoji: '😠', label: 'Enojado', tough: true },
];

export const moodById = (id?: string) => MOODS.find(m => m.id === id);

/** Mañana hasta las 12, tarde hasta las 18, después noche */
export const slotForHour = (h: number): MoodSlot => (h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening');
export const currentSlot = () => slotForHour(new Date().getHours());
