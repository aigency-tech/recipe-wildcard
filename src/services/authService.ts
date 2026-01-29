import { supabase } from '../lib/supabase';
import type { User, Profile, SignUpInput, SignInInput, UpdateProfileInput } from '../types';

export async function signUp(input: SignUpInput): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');

  if (input.username) {
    await supabase.from('profiles').update({
      username: input.username,
    }).eq('user_id', data.user.id);
  }

  return {
    id: data.user.id,
    email: data.user.email || '',
    created_at: data.user.created_at,
  };
}

export async function signIn(input: SignInInput): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed');

  return {
    id: data.user.id,
    email: data.user.email || '',
    created_at: data.user.created_at,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || '',
    created_at: session.user.created_at,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
