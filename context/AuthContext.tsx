import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, PointsSettings } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  isUser: boolean;
  isAdmin: boolean;
  login: (phone: string, pass: string) => 'user' | 'admin' | 'failed';
  register: (name: string, phone: string, pass: string, referralCodeInput?: string) => 'success' | 'exists' | 'invalid_referral';
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { db, setUsers } = useData();
  const { users, pointsSettings } = db;
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  
  const isAuthenticated = !!currentUser;
  const isUser = isAuthenticated && currentUser?.id !== 'admin';
  const isAdmin = isAuthenticated && currentUser?.id === 'admin';

  const login = (phone: string, pass: string): 'user' | 'admin' | 'failed' => {
    // Hardcoded admin credentials
    if (phone === 'karim' && pass === 'karim123') {
      const adminUser: User = { id: 'admin', name: 'Admin', phone: 'karim', favoritePropertyIds: [], points: 0, referralCode: 'ADMIN' };
      setCurrentUser(adminUser);
      return 'admin';
    }

    // User login
    const user = users.find(u => u.phone === phone && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return 'user';
    }

    return 'failed';
  };
  
  const register = (name: string, phone: string, pass: string, referralCodeInput?: string): 'success' | 'exists' | 'invalid_referral' => {
    const userExists = users.some(u => u.phone === phone);
    if (userExists) {
        return 'exists';
    }
      
    let referredByCode: string | undefined = undefined;
    let updatedUsersList = [...users];

    // Handle referral logic
    if (referralCodeInput && referralCodeInput.trim() !== '') {
        const referrer = updatedUsersList.find(u => u.referralCode.toLowerCase() === referralCodeInput.trim().toLowerCase());
        if (!referrer) {
            return 'invalid_referral';
        }

        if (pointsSettings.isEnabled && pointsSettings.pointsPerReferral > 0) {
            const updatedReferrer = { ...referrer, points: referrer.points + pointsSettings.pointsPerReferral };
            updatedUsersList = updatedUsersList.map(u => u.id === referrer.id ? updatedReferrer : u);
        }
        referredByCode = referrer.referralCode;
    }
      
    const generateReferralCode = (name: string) => {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const namePart = cleanName.slice(0, 5);
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${namePart}${randomPart}`;
    };

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        phone,
        password: pass, // In a real app, this should be hashed.
        favoritePropertyIds: [],
        points: 0,
        referralCode: generateReferralCode(name),
        referredByCode,
    };
      
    setUsers([...updatedUsersList, newUser]);
    setCurrentUser(newUser);
    return 'success';
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const updateUser = (updatedUser: User) => {
      if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
      }
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, isUser, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
