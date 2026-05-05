import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import WeeklyMenu from './pages/WeeklyMenu';
import SchoolHub from './pages/SchoolHub';
import ShoppingList from './pages/ShoppingList';
import ShoppingMode from './pages/ShoppingMode';
import Chores from './pages/Chores';
import Routines from './pages/Routines';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import FoodManager from './pages/FoodManager';
import KidZone from './pages/KidZone';
import KidDuel from './pages/KidDuel';
import PrepView from './pages/PrepView';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import { useData } from './context/DataContext';
import { useNotifications } from './hooks/useNotifications';
import {
  Bell, ChefHat, CheckSquare, TrendingUp, GraduationCap,
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
} from 'lucide-react';
import './styles/App.css';

const Dashboard = () => {
  const { viewMode } = useUser();
  const { schoolTasks, points, weeklyMenu, foods, chores, members, prizeRequests } = useData();
  const { requestPermission } = useNotifications(schoolTasks);

  if (viewMode === 'child') return <KidZone />;

  const getDaysLeft = (dateStr: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000);
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[new Date().getDay()];

  const urgentTasks = schoolTasks
    .filter(t => !t.completed)
    .map(t => ({ ...t, daysLeft: getDaysLeft(t.eventDate || t.deadline) }))
    .filter(t => t.daysLeft <= 3)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const upcomingTasks = schoolTasks
    .filter(t => !t.completed)
    .map(t => ({ ...t, daysLeft: getDaysLeft(t.eventDate || t.deadline) }))
    .filter(t => t.daysLeft > 3)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  const pendingChores = chores.filter(c => c.status === 'Pendiente');
  const pendingPrizes = prizeRequests.filter(r => r.status === 'pending');

  // Prep: qué hay para desayuno hoy por miembro
  const breakfastSlots = members.map(m => {
    const slot = weeklyMenu.find(w => w.day === todayName && w.meal === 'Desayuno' && w.member === m.name);
    return { member: m, slot };
  }).filter(x => x.slot && x.slot.foodIds.length > 0);

  const lunchSlots = members.map(m => {
    const slot = weeklyMenu.find(w => w.day === todayName && w.meal === 'Comida' && w.member === m.name);
    return { member: m, slot };
  }).filter(x => x.slot && x.slot.foodIds.length > 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Centro de Comando</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {pendingPrizes.length > 0 && (
            <Link to="/rewards" className="badge badge-yellow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Bell size={12} /> {pendingPrizes.length} canje{pendingPrizes.length > 1 ? 's' : ''} pendiente{pendingPrizes.length > 1 ? 's' : ''}
            </Link>
          )}
          {'Notification' in window && Notification.permission === 'default' && (
            <button
              onClick={requestPermission}
              className="badge badge-blue"
              style={{ background: 'none', border: '1px solid var(--p-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--p-primary)' }}
            >
              <Bell size={12} /> Activar alertas
            </button>
          )}
          <span className="badge badge-blue">Hogar Sincronizado</span>
        </div>
      </header>

      {/* Stat chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <Link to="/school" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem 1.25rem', background: urgentTasks.length > 0 ? '#fef2f2' : 'var(--p-surface)', border: `1px solid ${urgentTasks.length > 0 ? '#fecaca' : 'var(--border)'}`, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.15s' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)', background: urgentTasks.length > 0 ? '#fee2e2' : 'var(--p-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {urgentTasks.length > 0 ? <AlertTriangle size={18} color="var(--danger)" /> : <GraduationCap size={18} color="var(--p-text-muted)" />}
            </div>
            <div>
              <p style={{ fontWeight: '800', fontSize: '1.25rem', lineHeight: 1, color: urgentTasks.length > 0 ? 'var(--danger)' : 'var(--p-text)' }}>{urgentTasks.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600', marginTop: '0.125rem' }}>alerta{urgentTasks.length !== 1 ? 's' : ''} escolar{urgentTasks.length !== 1 ? 'es' : ''}</p>
            </div>
          </div>
        </Link>

        <Link to="/chores" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)', background: 'var(--p-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckSquare size={18} color="var(--p-primary)" />
            </div>
            <div>
              <p style={{ fontWeight: '800', fontSize: '1.25rem', lineHeight: 1 }}>{pendingChores.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600', marginTop: '0.125rem' }}>tarea{pendingChores.length !== 1 ? 's' : ''} pendiente{pendingChores.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </Link>

        <Link to="/prep" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--p-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ChefHat size={18} color="var(--warning)" />
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.875rem', lineHeight: 1 }}>Preparación</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', fontWeight: '600', marginTop: '0.125rem' }}>Vista cocina hoy</p>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Preparación del día — columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Desayuno de hoy */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title">🌅 Desayuno de hoy</h3>
              <Link to="/prep" className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Prep completa <ArrowRight size={12} />
              </Link>
            </div>
            {breakfastSlots.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)', padding: '0.5rem 0' }}>Sin pedidos para desayuno</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {breakfastSlots.map(({ member, slot }) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{member.avatar}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--p-text-muted)', width: '50px', flexShrink: 0 }}>{member.name}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem', flex: 1 }}>
                      {slot!.foodIds.map(fid => {
                        const qty = slot!.quantities?.[fid] || 1;
                        const name = foods.find(f => f.id === fid)?.name || fid;
                        return qty > 1 ? `${name} ×${qty}` : name;
                      }).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Comida de hoy (compacta) */}
            {lunchSlots.length > 0 && (
              <>
                <div style={{ marginTop: '1rem', marginBottom: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--p-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>🍽️ Comida</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {lunchSlots.map(({ member, slot }) => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1rem' }}>{member.avatar}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', width: '50px', flexShrink: 0 }}>{member.name}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                          {slot!.foodIds.map(fid => foods.find(f => f.id === fid)?.name || fid).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Puntos — scoreboard compacto */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h3 className="card-title"><TrendingUp size={16} color="var(--p-primary)" /> Puntos</h3>
              <Link to="/rewards" className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>Ver todo</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {members.map(m => {
                const pts = points[m.name] || 0;
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{m.avatar}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem', width: '60px', flexShrink: 0 }}>{m.name}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((pts / 500) * 100, 100)}%` }} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--p-primary)', width: '48px', textAlign: 'right', flexShrink: 0 }}>{pts} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Alertas escolares */}
          <div className="card" style={{ borderLeft: urgentTasks.length > 0 ? '3px solid var(--danger)' : '3px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h3 className="card-title">
                <Bell size={16} color={urgentTasks.length > 0 ? 'var(--danger)' : 'var(--p-text-muted)'} /> Escuela
              </h3>
              <Link to="/school" className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>Ver todo</Link>
            </div>

            {urgentTasks.length === 0 && upcomingTasks.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--p-text-muted)', padding: '0.5rem 0' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontSize: '0.85rem' }}>Sin pendientes escolares</span>
              </div>
            )}

            {urgentTasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: upcomingTasks.length > 0 ? '0.875rem' : 0 }}>
                {urgentTasks.map(t => (
                  <div key={t.id} style={{ padding: '0.625rem 0.875rem', background: '#fef2f2', borderRadius: 'var(--radius)', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{t.title}</p>
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.2rem', alignItems: 'center' }}>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{t.child}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '700' }}>
                          {t.daysLeft === 0 ? 'HOY' : t.daysLeft < 0 ? 'VENCIDO' : `${t.daysLeft}d`}
                        </span>
                      </div>
                    </div>
                    <AlertTriangle size={14} color="var(--danger)" />
                  </div>
                ))}
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {upcomingTasks.map(t => (
                  <div key={t.id} style={{ padding: '0.5rem 0.75rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.8rem' }}>{t.title}</p>
                      <span className="badge badge-blue" style={{ fontSize: '0.6rem', marginTop: '0.15rem' }}>{t.child}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--p-text-muted)' }}>
                      <Clock size={11} />
                      <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>{t.daysLeft}d</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tareas pendientes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h3 className="card-title"><CheckSquare size={16} color="var(--success)" /> Tareas del hogar</h3>
              <Link to="/chores" className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>Ver todo</Link>
            </div>
            {pendingChores.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--p-text-muted)', padding: '0.5rem 0' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontSize: '0.85rem' }}>Todo al día</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {pendingChores.slice(0, 5).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{c.name}</span>
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{c.user}</span>
                  </div>
                ))}
                {pendingChores.length > 5 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)', textAlign: 'center', padding: '0.25rem' }}>+{pendingChores.length - 5} más</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};


const App = () => {
  const { isLoggedIn } = useUser();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<WeeklyMenu />} />
          <Route path="shopping" element={<ShoppingList />} />
          <Route path="shopping/mode" element={<ShoppingMode />} />
          <Route path="food" element={<FoodManager />} />
          <Route path="school" element={<SchoolHub />} />
          <Route path="chores" element={<Chores />} />
          <Route path="routines" element={<Routines />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="prep" element={<PrepView />} />
          <Route path="duel" element={<KidDuel />} />
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
