import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface AuthUser {
  id: string;
  email: string | null;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean; // ⭐ إضافة مهمة
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // ⭐ يبدأ التحميل

  // Load active session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data?.session?.user) {
      setUser({
        id: data.session.user.id,
        email: data.session.user.email,
        role: "admin",
      });
    }

    setLoading(false); // ⭐ انتهى التحميل
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true); // ⭐ يبدأ التحميل

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !loginData.user) {
      setLoading(false);
      return false;
    }

    setUser({
      id: loginData.user.id,
      email: loginData.user.email,
      role: "admin",
    });

    setLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        loading  // ⭐ إضافته هنا
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
