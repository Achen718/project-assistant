import React from 'react';
import { User } from 'firebase/auth';
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string) => Promise<User>;
    logOut: () => Promise<void>;
}
export declare const useAuth: () => AuthContextType;
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export {};
