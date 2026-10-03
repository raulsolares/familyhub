import type { Food, WeeklyMenuItem } from '../context/DataContext';

export interface FoodUsage {
  byFood: Record<string, number>;
  byGroup: Record<string, number>;
}

/** Porciones que un miembro ya tiene en el menú de la semana (opcionalmente sin contar un tiempo de comida) */
export const getFoodUsage = (
  weeklyMenu: WeeklyMenuItem[],
  foods: Food[],
  member: string,
  exclude?: { day: string; meal: string },
): FoodUsage => {
  const byFood: Record<string, number> = {};
  const byGroup: Record<string, number> = {};
  weeklyMenu
    .filter(s => s.member === member)
    .filter(s => !(exclude && s.day === exclude.day && s.meal === exclude.meal))
    .forEach(s => s.foodIds.forEach(fid => {
      const qty = s.quantities?.[fid] || 1;
      byFood[fid] = (byFood[fid] || 0) + qty;
      const group = foods.find(f => f.id === fid)?.group;
      if (group) byGroup[group] = (byGroup[group] || 0) + qty;
    }));
  return { byFood, byGroup };
};

/**
 * Cuántas porciones más se pueden elegir de un alimento, dado el uso actual y la selección en curso.
 * Devuelve Infinity si no hay tope.
 */
export const remainingFor = (
  food: Food,
  usage: FoodUsage,
  selection: Record<string, number>,
  foods: Food[],
  groupLimits: Record<string, number>,
) => {
  let remaining = Infinity;
  if (food.maxPerWeek) {
    remaining = food.maxPerWeek - (usage.byFood[food.id] || 0) - (selection[food.id] || 0);
  }
  const limit = food.group ? groupLimits[food.group] : undefined;
  if (food.group && limit !== undefined) {
    const selectedInGroup = Object.entries(selection)
      .filter(([fid]) => foods.find(f => f.id === fid)?.group === food.group)
      .reduce((s, [, q]) => s + q, 0);
    remaining = Math.min(remaining, limit - (usage.byGroup[food.group] || 0) - selectedInGroup);
  }
  return Math.max(0, remaining);
};

export const MEALS = ['Desayuno', 'Lunch', 'Comida', 'Cena'];
export const MEAL_EMOJI: Record<string, string> = {
  Desayuno: '🌅', Snack: '🍎', Lunch: '🎒', Comida: '🍽️', Merienda: '🧃', Cena: '🌙',
};

const KEYWORD_EMOJI: [RegExp, string][] = [
  [/pizza/i, '🍕'], [/hamburg/i, '🍔'], [/hot ?dog/i, '🌭'], [/taco/i, '🌮'], [/burrito/i, '🌯'],
  [/quesadilla|tortilla/i, '🫓'], [/sándwich|sandwich|torta/i, '🥪'], [/pasta|espagueti|spaghetti|fideo/i, '🍝'],
  [/sopa|caldo|crema/i, '🍲'], [/arroz/i, '🍚'], [/pollo/i, '🍗'], [/carne|bistec|res/i, '🥩'], [/pescado|atún|salmón/i, '🐟'],
  [/huevo/i, '🍳'], [/hot ?cake|panqué|waffle/i, '🥞'], [/cereal|avena/i, '🥣'], [/pan|bolillo|mollete/i, '🥖'],
  [/fruta|manzana|plátano|fresa/i, '🍓'], [/verdura|ensalada|pepino|zanahoria|brócoli/i, '🥗'], [/yogurt|yogur/i, '🥛'],
  [/leche/i, '🥛'], [/galleta/i, '🍪'], [/helado|nieve/i, '🍦'], [/pastel|dulce|chocolate|postre/i, '🍰'],
  [/papa|frita/i, '🍟'], [/queso/i, '🧀'], [/sushi/i, '🍣'], [/jugo|agua/i, '🧃'],
];

/** Emoji del platillo: el que pusieron los papás, o uno deducido del nombre */
export const foodEmoji = (food: Pick<Food, 'name' | 'emoji'>) => {
  if (food.emoji) return food.emoji;
  const hit = KEYWORD_EMOJI.find(([re]) => re.test(food.name));
  return hit ? hit[1] : '🍽️';
};
