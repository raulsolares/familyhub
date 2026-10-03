import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { weekStartKey, nextWeekStartKey } from '../utils/dates';

/**
 * Semana con la que se arma el súper (?week=YYYY-MM-DD).
 * Por omisión, la próxima si ya tiene menú (para comprar antes); si no, la actual.
 */
export const useShoppingWeek = () => {
  const { menuOf } = useData();
  const [params, setParams] = useSearchParams();
  const thisWeek = weekStartKey();
  const nextWeek = nextWeekStartKey();
  const asked = params.get('week');
  const fallback = menuOf(nextWeek).some(w => w.foodIds.length) ? nextWeek : thisWeek;
  const week = asked === thisWeek || asked === nextWeek ? asked : fallback;
  const setWeek = (w: string) => setParams(p => { p.set('week', w); return p; }, { replace: true });
  return { week, setWeek, menu: menuOf(week) };
};
