import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WeeklyMenu from './pages/WeeklyMenu';
import SchoolHub from './pages/SchoolHub';
import ShoppingList from './pages/ShoppingList';
import ShoppingMode from './pages/ShoppingMode';
import Chores from './pages/Chores';
import Routines from './pages/Routines';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import FoodManager from './pages/FoodManager';
import KidDuel from './pages/KidDuel';
import KidToday from './pages/KidToday';
import Habits from './pages/Habits';
import PrepView from './pages/PrepView';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import { useUser } from './context/UserContext';
import './styles/App.css';
import './styles/design.css';
import './styles/space.css';

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
          <Route path="today" element={<KidToday />} />
          <Route path="habits" element={<Habits />} />
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
