/**
 * @author Shiva Nagendra Babu Kore
 */

'use client'

import { supabase } from './supabase';

export const signInWithGoogle = async () => {
  if (!supabase) {
    alert('Supabase is not configured. Please set up your environment variables first.\n\n1. Go to https://supabase.com/dashboard\n2. Create a new project or use existing\n3. Copy your project URL and anon key\n4. Add them to .env.local file in the project root');
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/tasks`,
    },
  });

  if (error) {
    throw error;
  }
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  
  // Note: This function is deprecated in favor of using signOut from AuthContext
  // The AuthContext version handles routing properly
  window.location.href = '/';
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
};
