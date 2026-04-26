import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import KidNav from './KidNav';
import { useUser } from '../context/UserContext';

const Layout = () => {
  const { role } = useUser();
  return (
    <div className="app-container">
      {role === 'parent' && <Sidebar />}
      <main className="main-content" style={{ 
        padding: role === 'child' ? '1rem 1rem 80px' : '2.5rem',
        width: '100%' 
      }}>
        <Outlet />
      </main>
      {role === 'child' && <KidNav />}
    </div>
  );
};

export default Layout;
