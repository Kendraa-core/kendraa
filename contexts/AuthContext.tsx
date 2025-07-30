'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If no profile exists, create one
      if (!existingProfile) {
        const email = user.email || '';
        const defaultName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
        const capitalizedName = defaultName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: email,
              full_name: capitalizedName,
              headline: 'LinkedIn Member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              skills: [],
              experiences: [],
              education: []
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Redirect to profile creation
        router.push('/profile/create');
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (!result.error && result.data.user) {
        await ensureProfile(result.data.user);
        router.push('/feed');
      }
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await supabase.auth.signUp({ email, password });
      if (!result.error && result.data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: result.data.user.id,
              email: email,
              full_name: fullName,
              headline: 'LinkedIn Member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              skills: [],
              experiences: [],
              education: []
            },
          ])
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          router.push('/profile/create');
        }
      }
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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