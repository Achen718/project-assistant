'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { clientAuth } from '@/lib/firebase';
import { useChatStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setUserId } = useChatStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
      setUser(user);
      setUserId(user?.uid || null);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUserId]);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );
    return result.user;
  };

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(
      clientAuth,
      email,
      password
    );
    return result.user;
  };

  const logOut = async () => {
    await signOut(clientAuth);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
