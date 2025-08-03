'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getProfile, ensureProfileExists } from '@/lib/queries';
import type { Profile } from '@/types/database.types';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName: string, profileType?: 'individual' | 'institution') => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthContext: Starting authentication check');
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('AuthContext: Timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Session check result:', session ? 'Session found' : 'No session');
      clearTimeout(timeoutId);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('AuthContext: Loading profile for session user');
        loadUserProfile(session.user);
      } else {
        console.log('AuthContext: No session, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('AuthContext: Error getting session:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change:', event, session ? 'Session present' : 'No session');
      clearTimeout(timeoutId);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('AuthContext: Loading profile for auth state change');
        await loadUserProfile(session.user);
      } else {
        console.log('AuthContext: No session in auth state change, clearing profile and setting loading to false');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      console.log('Loading user profile for:', user.id);
      
      // Add a timeout to prevent the function from getting stuck
      const profilePromise = (async () => {
        // First try to get existing profile
        let userProfile = await getProfile(user.id);
        console.log('Existing profile found:', userProfile);
        
        // If no profile exists, create one
        if (!userProfile) {
          console.log('No profile found, creating new profile');
          const profileType = user.user_metadata?.profile_type || 'individual';
          userProfile = await ensureProfileExists(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            profileType
          );
          console.log('New profile created:', userProfile);
        }
        
        return userProfile;
      })();
      
      // Add timeout to the profile loading
      const timeoutPromise = new Promise<Profile | null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile loading timeout')), 5000);
      });
      
      const userProfile = await Promise.race([profilePromise, timeoutPromise]);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create a basic profile as fallback
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || 'user@example.com',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        headline: 'Healthcare Professional',
        bio: '',
        location: '',
        avatar_url: '',
        banner_url: '',
        website: '',
        phone: '',
        specialization: ['General Medicine'],
        is_premium: false,
        profile_views: 0,
        user_type: 'individual',
        profile_type: 'individual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string, fullName: string, profileType: 'individual' | 'institution' = 'individual') => {
    setLoading(true);
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          profile_type: profileType,
          user_type: profileType === 'institution' ? 'institution' : 'individual',
        },
      },
    });
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading, 
        signIn, 
        signUp, 
        signOut 
      }}
    >
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