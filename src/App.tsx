import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import WeeklyMenu from './pages/WeeklyMenu';
import SchoolHub from './pages/SchoolHub';
import ShoppingList from './pages/ShoppingList';
import ShoppingMode from './pages/ShoppingMode';
import Chores from './pages/Chores';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import FoodManager from './pages/FoodManager';
import KidZone from './pages/KidZone';
import KidDuel from './pages/KidDuel';
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import { useData } from './context/DataContext';
import { Bell, Calendar, ChevronRight, Utensils, CheckCircle, TrendingUp } from 'lucide-react';
import './styles/App.css';

const Dashboard = () => {
  const { role, user } = useUser();
  const { schoolTasks, points, weeklyMenu, foods, chores } = useData();
  
  if (role === 'child') return <KidZone />;

  // Lógica de Notificaciones Inteligentes
  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const notifications = schoolTasks
    .filter(t => !t.completed)
    .map(t => ({ ...t, daysLeft: getDaysLeft(t.date) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  const today = 'Domingo'; // Mock de día actual
  const todayMeals = weeklyMenu.filter(m => m.day === today);
  const pendingChores = chores.filter(c => c.status === 'Pendiente');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Centro de Comando</h1>
          <p className="page-subtitle">Panel de administración familiar premium</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <span className="badge badge-blue">Hogar Sincronizado</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        {/* Widget 1: Centro de Notificaciones (Urgente) */}
        <div className="card" style={{ gridColumn: 'span 8', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}><Bell size={20} color="#ef4444" /> Notificaciones y Próximos Vencimientos</h3>
            <Link to="/school" style={{ fontSize: '0.8rem', color: 'var(--p-primary)', fontWeight: '700', textDecoration: 'none' }}>Ver todo</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#ef4444', border: '1px solid #fee2e2' }}>
                    {n.daysLeft < 0 ? '!' : n.daysLeft}
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '0.95rem' }}>{n.title} ({n.child})</p>
                    <p style={{ fontSize: '0.8rem', color: '#b91c1c' }}>{n.daysLeft === 0 ? 'Vence HOY' : n.daysLeft < 0 ? 'VENCIDO' : `Faltan ${n.daysLeft} días`}</p>
                  </div>
                </div>
                <ChevronRight size={18} color="#fca5a5" />
              </div>
            ))}
            {notifications.length === 0 && <p style={{ textAlign: 'center', color: 'var(--p-text-muted)', padding: '1rem' }}>No hay pendientes urgentes. ✨</p>}
          </div>
        </div>

        {/* Widget 2: Status de Puntos Niños */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3 className="card-title"><TrendingUp size={20} color="var(--p-primary)" /> Rendimiento Semanal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            {['Mateo', 'Sofía'].map(kid => (
              <div key={kid}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '700' }}>{kid}</span>
                  <span style={{ fontWeight: '800', color: 'var(--p-primary)' }}>{points[kid]} pts</span>
                </div>
                <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(points[kid] / 1000) * 100}%`, height: '100%', background: 'var(--p-primary)', borderRadius: '5px' }} />
                </div>
              </div>
            ))}
            <Link to="/rewards" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>Gestionar Premios</Link>
          </div>
        </div>

        {/* Widget 3: Menú de Hoy */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 className="card-title"><Utensils size={20} color="#f59e0b" /> Menú de Hoy ({today})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {['Desayuno', 'Comida', 'Cena'].map(meal => {
              const items = todayMeals.filter(m => m.meal === meal);
              return (
                <div key={meal} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>{meal}</p>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    {items.length > 0 ? foods.find(f => f.id === items[0].foodId)?.name : 'Sin asignar'}
                  </p>
                </div>
              )
            })}
            <Link to="/menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbeb', borderRadius: '12px', border: '1px dashed #f59e0b', textDecoration: 'none', color: '#b45309', fontWeight: '700', fontSize: '0.8rem' }}>Ver menú completo</Link>
          </div>
        </div>

        {/* Widget 4: Tareas del Hogar */}
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3 className="card-title"><CheckCircle size={20} color="#10b981" /> Tareas del Hogar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {pendingChores.slice(0, 3).map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px', color: '#166534' }}>{c.user}</span>
              </div>
            ))}
            <Link to="/chores" style={{ textAlign: 'center', fontSize: '0.8rem', color: '#10b981', fontWeight: '700', textDecoration: 'none', marginTop: '0.5rem' }}>Gestionar todas las tareas</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

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
          <Route path="rewards" element={<Rewards />} />
          <Route path="duel" element={<KidDuel />} />
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<div className="card"><h3 className="card-title">Calendario</h3><p>Próximamente: Integración con eventos familiares y escolares.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
