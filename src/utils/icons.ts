// Dibujitos (emoji) para rutinas y tareas, para niños que todavía no leen

const KEYWORD_ICON: [RegExp, string][] = [
  [/diente|cepill/i, '🪥'], [/baño|bañar|ducha|regader/i, '🛁'], [/pijama/i, '🩳'], [/vestir|ropa|uniforme/i, '👕'],
  [/zapato|tenis/i, '👟'], [/peina|cabello|pelo/i, '💇'], [/cara|lavar.*manos|manos/i, '🧼'], [/cama|tender/i, '🛏️'],
  [/mochila/i, '🎒'], [/lonche|lunch/i, '🥪'], [/desayun/i, '🥣'], [/comer|comida/i, '🍽️'], [/cena/i, '🌙'],
  [/agua|tomar/i, '💧'], [/fruta/i, '🍎'], [/vitamina|medicina/i, '💊'],
  [/tarea|deber/i, '✏️'], [/leer|lectura|libro|cuento/i, '📖'], [/estudi|repasar/i, '📚'], [/escrib/i, '✍️'],
  [/escuela|clase/i, '🏫'], [/piano|música|guitarra|instrumento/i, '🎹'], [/dibuj|pintar|colorear/i, '🎨'],
  [/basura/i, '🗑️'], [/juguete|recoger/i, '🧸'], [/ordenar|cuarto|limpiar|barrer|aspirar/i, '🧹'], [/trapear/i, '🧽'],
  [/mesa|poner.*mesa|levantar.*mesa/i, '🍴'], [/traste|platos|lavaplatos/i, '🍽️'], [/ropa sucia|lavander|doblar/i, '🧺'],
  [/planta|regar|jard/i, '🪴'], [/perr|gat|mascota|pez|tortuga|croqueta/i, '🐾'],
  [/ejercicio|deporte|correr|futbol|fútbol|nadar|natación|bici/i, '⚽'], [/estir|yoga/i, '🧘'], [/jugar|juego/i, '🎲'],
  [/pantalla|tablet|tele|videojuego/i, '📺'], [/dormir|acost|luz/i, '😴'], [/orar|rezar|gracias/i, '🙏'],
  [/mañana|despert/i, '🌅'], [/noche/i, '🌙'], [/abraz|beso/i, '🤗'],
];

/** Emoji sugerido para una actividad según su texto */
export const iconFor = (text: string, fallback = '⭐') => {
  for (const [re, icon] of KEYWORD_ICON) if (re.test(text)) return icon;
  return fallback;
};

/** Paleta para elegir a mano */
export const ACTIVITY_ICONS = [
  '🛏️', '🪥', '🛁', '🧼', '👕', '👟', '💇', '🩳', '🥣', '🍽️', '💧', '🍎',
  '🎒', '✏️', '📖', '📚', '🏫', '🎹', '🎨', '🧸', '🧹', '🧽', '🗑️', '🍴',
  '🧺', '🪴', '🐾', '⚽', '🧘', '🎲', '📺', '😴', '🙏', '🤗', '🌅', '🌙',
  '⭐', '🚀', '❤️', '🦷', '🚿', '🧦',
];

/** Ícono de cada paso de una rutina (el elegido o el sugerido) */
export const stepIcon = (r: { tasks: string[]; taskIcons?: string[] }, i: number) =>
  r.taskIcons?.[i] || iconFor(r.tasks[i]);

/** Ícono de una tarea del hogar */
export const choreIcon = (c: { name: string; icon?: string }) => c.icon || iconFor(c.name, '✅');
