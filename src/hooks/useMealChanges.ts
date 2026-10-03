import { useData } from '../context/DataContext';
import type { MealChangeRequest } from '../context/DataContext';
import { foodEmoji } from '../utils/food';
import { notify } from '../utils/push';
import { weekStartKey } from '../utils/dates';

/** Solicitudes de cambio de comida: texto legible y aprobar/rechazar avisando al niño */
export const useMealChanges = () => {
  const { mealChangeRequests, weeklyMenu, menuOf, foods, resolveMealChange } = useData();
  const thisWeek = weekStartKey();

  const dish = (week: string, member: string, day: string, meal: string) => {
    const menu = week === thisWeek ? weeklyMenu : menuOf(week);
    const slot = menu.find(w => w.member === member && w.day === day && w.meal === meal && w.foodIds.length);
    if (!slot) return 'nada';
    return slot.foodIds.map(fid => foods.find(f => f.id === fid)).filter(Boolean).map(f => `${foodEmoji(f!)} ${f!.name}`).join(', ');
  };

  const describe = (r: MealChangeRequest) => {
    const week = r.week || thisWeek;
    const when = week === thisWeek ? '' : ' (próxima semana)';
    if (r.kind === 'swap' && r.swapDay) {
      return {
        title: `Cambiar ${r.meal.toLowerCase()} del ${r.day.toLowerCase()} por la del ${r.swapDay.toLowerCase()}${when}`,
        detail: `${r.day}: ${dish(week, r.member, r.day, r.meal)} ⇄ ${r.swapDay}: ${dish(week, r.member, r.swapDay, r.meal)}`,
      };
    }
    const next = (r.foodIds || []).map(fid => foods.find(f => f.id === fid)).filter(Boolean).map(f => `${foodEmoji(f!)} ${f!.name}`).join(', ');
    return {
      title: `Cambiar ${r.meal.toLowerCase()} del ${r.day.toLowerCase()}${when}`,
      detail: `${dish(week, r.member, r.day, r.meal)} → ${next || 'nada'}`,
    };
  };

  const resolve = (id: string, approve: boolean) => {
    const r = mealChangeRequests.find(x => x.id === id);
    resolveMealChange(id, approve);
    if (r) {
      notify({
        to: [r.member],
        title: approve ? '🍽️ ¡Cambio aprobado!' : 'Cambio de comida no aprobado',
        body: approve ? `Tu ${r.meal.toLowerCase()} del ${r.day.toLowerCase()} ya cambió.` : `Se queda lo que elegiste para el ${r.day.toLowerCase()}.`,
        url: '/',
        tag: `meal-${r.id}`,
      });
    }
  };

  return { pending: mealChangeRequests.filter(r => r.status === 'pending'), describe, resolve };
};
