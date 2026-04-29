'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminLogin: async () => false,
  adminLogout: () => {},
  isLoading: true,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (from sessionStorage)
    const adminSession = sessionStorage.getItem('adminAuthenticated');
    if (adminSession === 'true') {
      setIsAdminAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      // Query Firestore for admin credentials
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('Admin not found');
        return false;
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      // Check password (in production, use proper password hashing)
      if (adminData.password === password) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminUsername', username);
        return true;
      } else {
        console.log('Invalid password');
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminUsername');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
