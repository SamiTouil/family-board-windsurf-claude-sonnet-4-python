import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = authService.isAuthenticated();

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    // In a real app, you'd fetch user data here
    setUser({
      id: 1,
      first_name: 'User',
      last_name: 'Name',
      email: email,
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshAuth = () => {
    if (authService.isAuthenticated()) {
      // In a real app, you'd fetch current user data from the API
      setUser({
        id: 1,
        first_name: 'User',
        last_name: 'Name',
        email: 'user@example.com',
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
