import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronously initialize user from localStorage
  const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const [user, setUser] = useState<User | null>(initialUser);
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    console.log('AuthProvider: Updated localStorage user:', localStorage.getItem('user'));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('AuthProvider: Updated localStorage users:', localStorage.getItem('users'));
  }, [users]);

  const signup = (username: string, password: string) => {
    console.log('AuthContext: Signup attempt - username:', username, 'password:', password);
    if (users.some((u) => u.username === username)) {
      console.log('AuthContext: Signup failed - Username already exists');
      return false;
    }
    const newUser: User = { username, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    console.log('AuthContext: Signup successful - Updated users:', updatedUsers);
    console.log('AuthContext: Current localStorage users:', localStorage.getItem('users'));
    return true;
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt - username:', username, 'password:', password);
    console.log('AuthContext: Stored users:', users);
    const validUser = users.find((u) => u.username === username && u.password === password);
    if (validUser) {
      setUser(validUser);
      localStorage.setItem('user', JSON.stringify(validUser));
      console.log('AuthContext: Login successful - user set:', validUser);
      console.log('AuthContext: Current localStorage user:', localStorage.getItem('user'));
      return true;
    }
    console.log('AuthContext: Login failed - Invalid credentials');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('AuthContext: Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};