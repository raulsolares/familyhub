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
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import './styles/App.css';

const Dashboard = () => {
  const { role, user } = useUser();
  if (role === 'child') return <KidZone />;
  
  return (
    <div>
      <header className="page-header">
      <h1 className="page-title">¡Hola, {user?.username}!</h1>
      <p className="page-subtitle">Hoy es domingo, 26 de abril de 2026</p>
    </header>
    <div className="grid">
      <div className="card">
        <h3 className="card-title">🍽️ Menú de Hoy</h3>
        <p><strong>Comida:</strong> Enchiladas Verdes</p>
        <p><strong>Cena:</strong> Sincronizadas</p>
        <Link to="/menu">
          <button style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', color: 'var(--p-primary)', fontWeight: '600' }}>Ver menú completo</button>
        </Link>
      </div>
      <div className="card">
        <h3 className="card-title">🎒 Pendientes Escuela</h3>
        <ul style={{ listStyle: 'none', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ fontSize: '0.9rem' }}>✅ Traer cartulina (Mateo)</li>
          <li style={{ fontSize: '0.9rem' }}>⚠️ Tenis de deportes (Sofía)</li>
        </ul>
        <Link to="/school">
          <button style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', color: 'var(--p-primary)', fontWeight: '600' }}>Ir a Módulo Escolar</button>
        </Link>
      </div>
      <div className="card">
        <h3 className="card-title">🧹 Tareas del Hogar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem' }}><strong>Mateo:</strong> Recoger juguetes</p>
          <p style={{ fontSize: '0.9rem' }}><strong>Sofía:</strong> Alimentar al perro</p>
        </div>
        <Link to="/chores">
          <button style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', color: 'var(--p-primary)', fontWeight: '600' }}>Gestionar tareas</button>
        </Link>
      </div>
      <div className="card">
        <h3 className="card-title">⭐ Recompensas</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--p-primary)' }}>450</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>Mateo</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--p-primary)' }}>520</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>Sofía</p>
          </div>
        </div>
        <Link to="/rewards">
          <button style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', width: '100%', color: 'var(--p-primary)', fontWeight: '600' }}>Ver balance detallado</button>
        </Link>
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
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<div className="card"><h3 className="card-title">Calendario</h3><p>Próximamente: Integración con eventos familiares y escolares.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
