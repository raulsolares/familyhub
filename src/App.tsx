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
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import { useData } from './context/DataContext';
import { Bell, ChevronRight, Utensils, CheckCircle, TrendingUp } from 'lucide-react';
import './styles/App.css';

const Dashboard = () => {
  const { viewMode } = useUser();
  const { schoolTasks, points, weeklyMenu, foods, chores } = useData();

  if (viewMode === 'child') return <KidZone />;

  const getDaysLeft = (dateStr: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  };

  const notifications = schoolTasks
    .filter(t => !t.completed)
    .map(t => ({ ...t, daysLeft: getDaysLeft(t.eventDate || t.deadline) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const today = dayNames[new Date().getDay()];
  const todayMeals = weeklyMenu.filter(m => m.day === today);
  const pendingChores = chores.filter(c => c.status === 'Pendiente');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Centro de Comando</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className="badge badge-blue">Hogar Sincronizado</span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>

        {/* Notificaciones */}
        <div className="card" style={{ gridColumn: 'span 8', borderLeft: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="card-title">
              <Bell size={18} color="var(--danger)" /> Notificaciones y Vencimientos
            </h3>
            <Link to="/school" className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.8rem' }}>Ver todo</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1rem', background: 'var(--p-background)',
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius)',
                    background: n.daysLeft <= 1 ? 'var(--danger-bg)' : 'var(--p-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', color: n.daysLeft <= 1 ? 'var(--danger)' : 'var(--p-text-muted)',
                    fontSize: '0.875rem',
                  }}>
                    {n.daysLeft < 0 ? '!' : n.daysLeft}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{n.title}
                      <span className="badge badge-blue" style={{ marginLeft: '0.5rem' }}>{n.child}</span>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: n.daysLeft <= 0 ? 'var(--danger)' : 'var(--p-text-muted)', marginTop: '0.125rem' }}>
                      {n.daysLeft === 0 ? 'Vence HOY' : n.daysLeft < 0 ? 'VENCIDO' : `Faltan ${n.daysLeft} días`}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--p-text-subtle)" />
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="empty-state">
                <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
                <p>Sin pendientes urgentes</p>
              </div>
            )}
          </div>
        </div>

        {/* Rendimiento */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <TrendingUp size={18} color="var(--p-primary)" /> Rendimiento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Alan', 'Aria', 'Raúl', 'Tania'].map(member => {
              const pts = points[member] || 0;
              return (
                <div key={member}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{member}</span>
                    <span style={{ fontWeight: '700', color: 'var(--p-primary)', fontSize: '0.875rem' }}>{pts} pts</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((pts / 500) * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <Link to="/rewards" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Gestionar Premios
            </Link>
          </div>
        </div>

        {/* Menú de hoy */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Utensils size={18} color="var(--warning)" /> Menú de Hoy ({today})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {['Desayuno', 'Comida', 'Cena'].map(meal => {
              const item = todayMeals.find(m => m.meal === meal);
              const foodName = item ? foods.find(f => f.id === item.foodIds[0])?.name : null;
              return (
                <div key={meal} style={{ padding: '0.75rem', background: 'var(--p-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--p-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal}</p>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem', color: foodName ? 'var(--p-text)' : 'var(--p-text-subtle)' }}>
                    {foodName || 'Sin asignar'}
                  </p>
                </div>
              );
            })}
            <Link to="/menu" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--p-primary-50)', borderRadius: 'var(--radius)',
              textDecoration: 'none', color: 'var(--p-primary)', fontWeight: '700', fontSize: '0.8rem',
              border: '1px dashed var(--p-primary)', padding: '0.75rem',
            }}>
              Ver menú completo
            </Link>
          </div>
        </div>

        {/* Tareas pendientes */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <CheckCircle size={18} color="var(--success)" /> Tareas Pendientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {pendingChores.slice(0, 4).map(c => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 0.875rem', background: 'var(--p-background)',
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{c.name}</span>
                <span className="badge badge-blue">{c.user}</span>
              </div>
            ))}
            {pendingChores.length === 0 && <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1rem' }}>Todo al día ✓</p>}
            <Link to="/chores" className="btn-ghost" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>Gestionar tareas</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

const CalendarPage = () => (
  <div>
    <header className="page-header">
      <h1 className="page-title">Calendario Familiar</h1>
      <p className="page-subtitle">Eventos y fechas importantes</p>
    </header>
    <div className="card">
      <div className="empty-state">
        <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📅</p>
        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Próximamente</h3>
        <p>Calendario mensual con eventos escolares, rutinas y recordatorios</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const { isLoggedIn } = useUser();

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
          <Route path="duel" element={<KidDuel />} />
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
