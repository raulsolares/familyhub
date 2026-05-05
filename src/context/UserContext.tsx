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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
  updateTheme: (theme: Theme) => void;
  enterKidView: () => void;
  exitKidView: () => void;
}

const USERS: Record<string, { name: string; avatar: string; role: Role; theme: Theme }> = {
  papa:  { name: 'Raúl',  avatar: '👨', role: 'parent', theme: 'light' },
  raul:  { name: 'Raúl',  avatar: '👨', role: 'parent', theme: 'light' },
  mama:  { name: 'Tania', avatar: '👩', role: 'parent', theme: 'light' },
  tania: { name: 'Tania', avatar: '👩', role: 'parent', theme: 'light' },
  alan:  { name: 'Alan',  avatar: '👦', role: 'child',  theme: 'fun'   },
  aria:  { name: 'Aria',  avatar: '👧', role: 'child',  theme: 'fun'   },
};

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

  const login = (username: string, password: string): boolean => {
    const profile = USERS[username.toLowerCase()];
    if (!profile || password !== '1234') return false;
    const newUser: User = { id: username, username: username.toLowerCase(), ...profile };
    setUser(newUser);
    setIsLoggedIn(true);
    setIsKidView(false);
    localStorage.setItem('fh_auth', 'true');
    localStorage.setItem('fh_user', JSON.stringify(newUser));
    return true;
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
