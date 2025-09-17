'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getProfile, ensureProfileExists, type Profile } from '@/lib/queries';
import { useIsClient } from '@/hooks/useIsClient';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, profileType: 'individual' | 'institution') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isClient = useIsClient();

  // Load user profile efficiently
  const loadProfile = useCallback(async (userId: string) => {
    if (!isClient) return;
    
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (error: any) {
      console.error('[Auth] Error loading profile:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication error')) {
        // Don't set a fallback profile for auth errors
        return;
      } else if (error.message.includes('Profile not found')) {
        // Set a basic profile to prevent UI blocking
        setProfile({
          id: userId,
          full_name: 'User',
          email: user?.email || '',
          headline: '',
          bio: '',
          location: '',
          country: '',
          avatar_url: '',
          banner_url: '',
          website: '',
          phone: '',
          specialization: [],
          is_premium: false,
          user_type: 'individual',
          profile_type: 'individual',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        // Set a basic profile to prevent UI blocking
        setProfile({
          id: userId,
          full_name: 'User',
          email: user?.email || '',
          headline: '',
          bio: '',
          location: '',
          country: '',
          avatar_url: '',
          banner_url: '',
          website: '',
          phone: '',
          specialization: [],
          is_premium: false,
          user_type: 'individual',
          profile_type: 'individual',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }, [user?.email, isClient]);

  // Initialize auth state
  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          // Load profile in background
          loadProfile(session.user.id);
        }

        if (mounted) {
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              setLoading(false);
              // Load profile in background
              loadProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              setLoading(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        // Auth initialization error logged
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [loadProfile, isClient]);

   // --- MODIFIED signUp FUNCTION ---
  const signUp = useCallback(async (email: string, password: string, fullName: string, profileType: 'individual' | 'institution') => {
    if (!isClient || !supabase) {
      toast.error('Supabase is not configured.');
      return;
    }
    
    try {
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (signUpError.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(signUpError.message || 'Failed to create account. Please try again.');
        }
        throw signUpError;
      }

      if (!data.user) {

        throw new Error("Account created, but user data not available immediately. Please try signing in.");
      }

      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          profile_type: profileType,
          user_type: profileType, // Assuming profile_type and user_type are the same at signup
        })
        .eq('id', data.user.id);

      if (updateError) {
        
        console.error("Error updating profile after signup:", updateError);
        toast.error('Account created, but failed to set profile details. You can update your profile later.');
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
      
    } catch (error: any) {
      // Re-throw the error so the component can handle its loading state
      throw error;
    }
  }, [isClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isClient) return;
    
    if (!supabase) {
      toast.error('Supabase is not configured. Please check your environment variables.');
      return;
    }
    
    try {
      // Starting signin process
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Sign in error logged
        
        // Provide specific error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else if (error.message.includes('User not found')) {
          toast.error('No account found with this email. Please sign up first.');
        } else {
          toast.error(error.message || 'Failed to sign in. Please try again.');
        }
        throw error;
      }

      if (data.user) {
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      throw error;
    }
  }, [isClient]);

  const signOut = useCallback(async () => {
    if (!isClient) return;
    
    if (!supabase) {
      toast.error('Supabase is not configured. Please check your environment variables.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error('Failed to sign out');
      throw error;
    }
  }, [isClient]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user || !isClient) return;

    if (!supabase) {
      toast.error('Supabase is not configured. Please check your environment variables.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state immediately
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile');
      throw error;
    }
  }, [user, isClient]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }), [user, profile, loading, signIn, signUp, signOut, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 