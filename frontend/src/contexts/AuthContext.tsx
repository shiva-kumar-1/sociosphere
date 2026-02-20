import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { jwtDecode } from '../lib/jwt';
import { connectSocket, disconnectSocket } from '../lib/socket';
interface DecodedToken {
  id: string;
  exp: number;
}

export interface User {
  id: string;
  role: 'CUSTOMER' | 'SERVICE_PROVIDER' | 'ADMIN';
  token: string;
}


interface AuthContextType {
  user: User | null;
  setAuth: (token: string, role: string) => void;
  logout: () => void;
  isProvider: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      const decoded = jwtDecode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        return { id: decoded.id, role: role as User['role'], token };
      }
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    return null;
  });

  const setAuth = useCallback((token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    const decoded = jwtDecode(token);
    setUser({ id: decoded.id, role: role as User['role'], token });
    connectSocket(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    disconnectSocket();
  }, []);

  useEffect(() => {
    if (user?.token) {
      connectSocket(user.token);
    }
    return () => { disconnectSocket(); };
  }, [user?.token]);

  return (
    <AuthContext.Provider value={{
      user,
      setAuth,
      logout,
      isProvider: user?.role === 'SERVICE_PROVIDER',
      isCustomer: user?.role === 'CUSTOMER',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
