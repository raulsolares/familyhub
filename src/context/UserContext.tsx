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
  setRole: (role: Role) => void;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
  updateTheme: (theme: Theme) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('fh_auth') === 'true');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, password: string): boolean => {
    if ((username === 'papa' || username === 'mama' || username === 'raul' || username === 'tania') && password === '1234') {
      const name = username === 'papa' || username === 'raul' ? 'Raúl' : 'Tania';
      const avatar = name === 'Raúl' ? '👨' : '👩';
      const newUser: User = { id: username, name, avatar, role: 'parent', username, theme: 'light' };
      setUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('fh_auth', 'true');
      localStorage.setItem('fh_user', JSON.stringify(newUser));
      return true;
    } else if ((username === 'alan' || username === 'aria') && password === '1234') {
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      const newUser: User = { 
        id: username, 
        name, 
        avatar: username === 'alan' ? '👦' : '👧', 
        role: 'child', 
        username,
        theme: 'fun'
      };
      setUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('fh_auth', 'true');
      localStorage.setItem('fh_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('fh_auth');
    localStorage.removeItem('fh_user');
  };

  const setRole = (role: Role) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('fh_user', JSON.stringify(updated));
    }
  };

  const updateTheme = (theme: Theme) => {
    if (user) {
      const updated = { ...user, theme };
      setUser(updated);
      localStorage.setItem('fh_user', JSON.stringify(updated));
    }
  };

  const role = user?.role || 'parent';
  const currentTheme = user?.theme || 'light';

  return (
    <UserContext.Provider value={{ role, setRole, user, login, logout, isLoggedIn, updateTheme }}>
      <div className={`theme-${currentTheme} role-${role}`} style={{ minHeight: '100vh' }}>
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
