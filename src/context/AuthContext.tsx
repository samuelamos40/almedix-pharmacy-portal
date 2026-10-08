import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'guest' | 'patient' | 'admin' | 'pharmacist';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  phone: string;
  address?: string;
  allergies?: string;
  employeeId?: string;
  licenseNumber?: string;
  avatarInitials: string;
  createdAt: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  address?: string;
  allergies?: string;
  title?: string;
  employeeId?: string;
  licenseNumber?: string;
  staffPasscode?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isDbConnected: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const STAFF_REGISTRATION_PASSCODE = 'ALMEDIX2025';

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase() || 'AL';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(true); // Supabase connection is handled by client
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(extractProfileFromUser(session.user));
      }
      setIsInitializing(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(extractProfileFromUser(session.user));
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const extractProfileFromUser = (supabaseUser: any): UserProfile => {
    const meta = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: meta.name || '',
      role: meta.role || 'guest',
      title: meta.title || '',
      phone: meta.phone || '',
      address: meta.address || '',
      allergies: meta.allergies || '',
      employeeId: meta.employeeId || '',
      licenseNumber: meta.licenseNumber || '',
      avatarInitials: meta.avatarInitials || getInitials(meta.name || 'AL'),
      createdAt: supabaseUser.created_at || new Date().toISOString(),
    };
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const profile = extractProfileFromUser(data.user);
    setUser(profile);
    return { success: true, user: profile };
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    const cleanEmail = data.email.toLowerCase().trim();
    const requestedRole: UserRole = data.role || 'patient';

    if (requestedRole !== 'patient') {
      if (data.staffPasscode !== STAFF_REGISTRATION_PASSCODE) {
        return { success: false, error: 'Invalid Staff Passcode.' };
      }
    }

    const title = data.title || (
      requestedRole === 'patient' ? 'Verified Patient' :
      requestedRole === 'admin' ? 'Pharmacy Administrator' :
      requestedRole === 'pharmacist' ? 'Clinical Pharmacist' :
      requestedRole === 'accounts_officer' ? 'Accounts Payable Officer' :
      'Health Data Analyst'
    );

    const userMetadata = {
      name: data.name.trim(),
      role: requestedRole,
      title,
      phone: data.phone.trim(),
      address: data.address?.trim() || '',
      allergies: data.allergies?.trim() || '',
      employeeId: data.employeeId?.trim() || (requestedRole !== 'patient' ? `ALM-${Math.floor(100 + Math.random() * 900)}` : ''),
      licenseNumber: data.licenseNumber?.trim() || '',
      avatarInitials: getInitials(data.name.trim()),
    };

    const { data: authData, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: data.password,
      options: {
        data: userMetadata,
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      const profile = extractProfileFromUser(authData.user);
      setUser(profile);
      return { success: true, user: profile };
    }

    return { success: false, error: 'Unable to complete registration.' };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    const metadataUpdates: any = { ...updates };
    delete metadataUpdates.id;
    delete metadataUpdates.email;
    delete metadataUpdates.createdAt;

    if (updates.name) {
      metadataUpdates.avatarInitials = getInitials(updates.name);
    }

    const { error } = await supabase.auth.updateUser({
      data: metadataUpdates
    });

    if (error) {
      console.error('Update profile error:', error.message);
      return false;
    }

    // AuthStateChange will catch this, but we can optimistically update
    setUser(prev => prev ? { ...prev, ...updates, avatarInitials: metadataUpdates.avatarInitials || prev.avatarInitials } : null);
    return true;
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // Supabase updateUser only requires new password if session is active
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // In Supabase, reset password usually sends an email link.
    // For this prototype, if you want direct reset without email confirmation, you must use Service Role key.
    // Here we'll just trigger the standard Supabase reset password email.
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: 'Password reset email sent (check your inbox).' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        isInitializing,
        isDbConnected,
        login,
        register,
        updateProfile,
        changePassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
