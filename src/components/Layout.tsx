import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import KidNav from './KidNav';
import ParentMobileNav from './ParentMobileNav';
import { useUser } from '../context/UserContext';

const Layout = () => {
  const { viewMode } = useUser();
  const isKid = viewMode === 'child';

  return (
    <div className="app-container" style={isKid ? undefined : { flexDirection: 'row' }}>
      {!isKid && <Sidebar />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!isKid && <ParentMobileNav />}
        <main
          className={`main-content${isKid ? '' : ' parent-main'}`}
          style={{ padding: isKid ? '1rem 1rem calc(100px + env(safe-area-inset-bottom))' : '2rem 2.25rem' }}
        >
          <Outlet />
        </main>
      </div>
      {isKid && <KidNav />}
    </div>
  );
};

export default Layout;
