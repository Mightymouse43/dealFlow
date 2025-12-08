import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

interface UserProfile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro';
  subscription_expires: string | null;
  trial_end_date: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isPro: boolean;
  isOnTrial: boolean;
  trialEndDate: Date | null;
  activateFreeTrial: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isPro: false,
  isOnTrial: false,
  trialEndDate: null,
  activateFreeTrial: async () => ({ success: false, message: '' }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { entitlements, identifyUser: identifyRevenueCatUser, logout: logoutRevenueCat } = useRevenueCat();

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        identifyRevenueCatUser(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        identifyRevenueCatUser(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [identifyRevenueCatUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    await logoutRevenueCat();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const isOnTrial = profile?.trial_end_date !== null &&
    profile?.trial_end_date !== undefined &&
    new Date(profile.trial_end_date) > new Date();

  const trialEndDate = profile?.trial_end_date ? new Date(profile.trial_end_date) : null;

  const isPro =
    isOnTrial ||
    entitlements.isPro ||
    (profile?.subscription_tier === 'pro' &&
      (profile.subscription_expires === null ||
       new Date(profile.subscription_expires) > new Date()));

  const activateFreeTrial = async () => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase.rpc('activate_free_trial', {
        user_uuid: user.id,
      });

      if (error) throw error;

      await refreshProfile();

      return {
        success: data.success,
        message: data.message,
      };
    } catch (error) {
      console.error('Error activating trial:', error);
      return { success: false, message: 'Failed to activate trial' };
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
      isPro,
      isOnTrial,
      trialEndDate,
      activateFreeTrial
    }}>
      {children}
    </AuthContext.Provider>
  );
};
