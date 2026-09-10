import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { offlineStore } from '../lib/offlineStore';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPhoneOTP: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneOTP: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signInAsGuest: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ADMIN_EMAILS = [
  'moisesdematos@gmail.com',
  'moisesdematos@gmail.mail',
];

export const isUserAdmin = (user?: User | null, profile?: Profile | null): boolean => {
  if (profile?.role === 'admin') return true;
  const email = user?.email?.trim().toLowerCase();
  if (email && (ADMIN_EMAILS.includes(email) || email.startsWith('moisesdematos@'))) {
    return true;
  }
  return false;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string, userObj?: User | null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile does not exist yet (e.g. newly signed in via Google OAuth)
        const meta = userObj?.user_metadata || user?.user_metadata;
        const isAdminUser = isUserAdmin(userObj || user, null);
        const newProfile = {
          id: userId,
          full_name: meta?.full_name || meta?.name || userObj?.email?.split('@')[0] || 'Utilizador NEXO',
          avatar_url: meta?.avatar_url || meta?.picture || null,
          role: isAdminUser ? 'admin' : 'user',
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: insertError } = await (supabase as any)
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();

        if (!insertError && createdProfile) {
          setProfile(createdProfile);
          return;
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar perfil:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  };

  useEffect(() => {
    // Carregar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id, session.user);
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_guest: false,
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithPhoneOTP = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const verifyPhoneOTP = async (phone: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInAsGuest = async () => {
    try {
      // Suporte nativo ao signInAnonymously do Supabase Auth
      const { error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            full_name: 'Convidado NEXO',
            is_guest: true,
          },
        },
      });

      if (error) {
        // Fallback caso Anonymous Auth não esteja activado no painel Supabase
        console.warn('Anonymous auth falhou ou não está activo, registando sessão convidado:', error.message);
        const guestEmail = `guest_${Date.now()}@nexo.temp`;
        const guestPass = `GuestPass_${Math.random().toString(36).slice(-8)}!`;
        const { error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: guestPass,
          options: {
            data: {
              full_name: 'Convidado NEXO',
              is_guest: true,
            },
          },
        });
        return { error: signUpError };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (user?.id) {
      await offlineStore.clearUserData(user.id).catch(() => {});
    }
    await offlineStore.clearAllOfflineData().catch(() => {});
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isGuest = profile?.is_guest ?? Boolean(user?.user_metadata?.is_guest);
  const isAdmin = isUserAdmin(user, profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isGuest,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithPhoneOTP,
        verifyPhoneOTP,
        signInAsGuest,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
