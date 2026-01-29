import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Profile, SignUpInput, SignInInput, UpdateProfileInput } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        };

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        set({ user, profile: profile || null });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
          };

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          set({ user, profile: profile || null });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signUp: async (input: SignUpInput) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (error) throw error;

      // Profile is automatically created by database trigger
      // Update username if provided
      if (data.user && input.username) {
        await supabase
          .from('profiles')
          .update({ username: input.username })
          .eq('user_id', data.user.id);
      }
    } catch (error: any) {
      set({ error: error.message || 'Sign up failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (input: SignInInput) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Sign in failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({ user: null, profile: null });
    } catch (error: any) {
      set({ error: error.message || 'Sign out failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Password reset failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (input: UpdateProfileInput) => {
    try {
      set({ isLoading: true, error: null });

      const { user } = get();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (error: any) {
      set({ error: error.message || 'Profile update failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
