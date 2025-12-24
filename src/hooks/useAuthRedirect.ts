'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
/**
 * @author Shiva Nagendra Babu Kore
 */

import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to handle authentication redirects
 * @param redirectTo - Where to redirect if not authenticated (default: '/login')
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function useAuthRedirect(redirectTo = '/login', requireAuth = true) {
  const { user, loading, isSigningOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('useAuthRedirect - loading:', loading, 'isSigningOut:', isSigningOut, 'user:', !!user, 'requireAuth:', requireAuth);
    
    // Don't redirect while loading or during sign out process
    if (loading || isSigningOut) {
      console.log('useAuthRedirect - Skipping redirect (loading or signing out)');
      return;
    }

    if (requireAuth && !user) {
      // User is not authenticated and auth is required
      console.log('useAuthRedirect - Redirecting to:', redirectTo);
      router.push(redirectTo);
    } else if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on login page)
      console.log('useAuthRedirect - Redirecting authenticated user to /tasks');
      router.push('/tasks');
    }
  }, [user, loading, isSigningOut, router, redirectTo, requireAuth]);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Hook specifically for protected routes
 */
export function useRequireAuth() {
  return useAuthRedirect('/login', true);
}

/**
 * Hook specifically for guest-only routes (login, signup)
 */
export function useGuestOnly() {
  return useAuthRedirect('/tasks', false);
}
