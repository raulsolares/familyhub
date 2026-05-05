import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import KidNav from './KidNav';
import { useUser } from '../context/UserContext';

const Layout = () => {
  const { viewMode } = useUser();
  const isKid = viewMode === 'child';

  return (
    <div className="app-container">
      {!isKid && <Sidebar />}
      <main
        className="main-content"
        style={{ padding: isKid ? '1.25rem 1rem 90px' : '2.5rem' }}
      >
        <Outlet />
      </main>
      {isKid && <KidNav />}
    </div>
  );
};

export default Layout;
