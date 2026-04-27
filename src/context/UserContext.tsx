import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Role = 'parent' | 'child';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  username: string;
}

interface UserContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('fh_auth') === 'true');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, password: string): boolean => {
    // Mock login logic - in a real app this would call an API
    if ((username === 'papa' || username === 'mama') && password === '1234') {
      const newUser: User = { id: '1', name: 'Papá/Mamá', avatar: '👨‍👩‍👧‍👦', role: 'parent', username };
      setUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('fh_auth', 'true');
      localStorage.setItem('fh_user', JSON.stringify(newUser));
      return true;
    } else if ((username === 'mateo' || username === 'sofia') && password === '1234') {
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      const newUser: User = { 
        id: username === 'mateo' ? '2' : '3', 
        name, 
        avatar: username === 'mateo' ? '👦' : '👧', 
        role: 'child', 
        username 
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

  const role = user?.role || 'parent';

  return (
    <UserContext.Provider value={{ role, setRole, user, login, logout, isLoggedIn }}>
      <div className={`theme-${role}`}>
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
