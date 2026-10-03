import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Role = 'parent' | 'child';
type Theme = 'light' | 'dark' | 'fun';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  username: string;
  theme: Theme;
}

interface UserContextType {
  role: Role;
  viewMode: Role;          // lo que se muestra (padres pueden cambiar a 'child')
  isKidView: boolean;      // true cuando padre está en vista niño
  user: User | null;
  /** El PIN se valida en la pantalla de acceso, contra los datos de la familia */
  login: (member: { id: string; name: string; avatar: string; role: Role }) => void;
  logout: () => void;
  isLoggedIn: boolean;
  updateTheme: (theme: Theme) => void;
  enterKidView: () => void;
  exitKidView: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('fh_auth') === 'true',
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isKidView, setIsKidView] = useState(false);

  const login = (member: { id: string; name: string; avatar: string; role: Role }) => {
    const newUser: User = {
      id: member.id,
      username: member.name.toLowerCase(),
      name: member.name,
      avatar: member.avatar,
      role: member.role,
      theme: member.role === 'child' ? 'fun' : 'light',
    };
    setUser(newUser);
    setIsLoggedIn(true);
    setIsKidView(false);
    localStorage.setItem('fh_auth', 'true');
    localStorage.setItem('fh_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsKidView(false);
    localStorage.removeItem('fh_auth');
    localStorage.removeItem('fh_user');
  };

  const updateTheme = (theme: Theme) => {
    if (!user) return;
    const updated = { ...user, theme };
    setUser(updated);
    localStorage.setItem('fh_user', JSON.stringify(updated));
  };

  // Solo padres pueden cambiar a vista de niños
  const enterKidView = () => {
    if (user?.role === 'parent') setIsKidView(true);
  };

  const exitKidView = () => setIsKidView(false);

  const realRole: Role = user?.role || 'parent';
  // Si el padre está en modo niño, el viewMode es 'child'; los niños siempre son 'child'
  const viewMode: Role = realRole === 'child' ? 'child' : isKidView ? 'child' : 'parent';

  const currentTheme: Theme =
    viewMode === 'child' ? 'fun' : (user?.theme ?? 'light');

  return (
    <UserContext.Provider value={{
      role: realRole,
      viewMode,
      isKidView,
      user,
      login,
      logout,
      isLoggedIn,
      updateTheme,
      enterKidView,
      exitKidView,
    }}>
      <div className={`theme-${currentTheme}`} style={{ minHeight: '100svh' }}>
        {children}
      </div>
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
