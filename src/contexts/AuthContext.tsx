/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isSigningOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isSigningOutRef = useRef(false);
  const router = useRouter();

  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Only check for recent sign out on client side
        if (isClient) {
          const recentSignOutTime = localStorage.getItem("recentSignOut");
          const recentSignOut =
            recentSignOutTime &&
            Date.now() - parseInt(recentSignOutTime) < 10000;

          if (recentSignOut) {
            console.log("Recent sign out detected, skipping session restore");
            setUser(null);
            setLoading(false);
            localStorage.removeItem("recentSignOut");
            return;
          }
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        // Only set user if we have a valid session
        if (session?.user) {
          console.log(
            "Valid session found, restoring user:",
            session.user.email
          );
          setUser(session.user);
        } else {
          console.log("No valid session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state change:", event, "session exists:", !!session);

        // Handle different auth events
        if (event === "SIGNED_IN") {
          console.log("User signed in:", session?.user?.email);
          setUser(session?.user ?? null);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out event received");
          // Always clear user state on sign out, regardless of who initiated it
          setUser(null);
          // Set flag and clear browser storage to prevent session restore
          localStorage.setItem("recentSignOut", Date.now().toString());
          const recentSignOut = localStorage.getItem("recentSignOut");
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem("recentSignOut", recentSignOut || "");

          // Only redirect if we initiated the sign out
          if (isSigningOutRef.current) {
            console.log("Redirecting to landing page after sign out");
            // Use router.replace instead of push for better UX
            router.replace("/");
            // Reset flags with a longer delay to ensure navigation completes
            setTimeout(() => {
              console.log("Resetting sign out flags after redirect");
              isSigningOutRef.current = false;
              setIsSigningOut(false);
            }, 2000);
          } else {
            console.log(
              "External sign out detected, clearing state but not redirecting"
            );
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed, updating user state");
          setUser(session?.user ?? null);
        } else {
          // For other events, update user state based on session
          setUser(session?.user ?? null);
        }

        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [router, isClient]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      const errorMessage =
        "Authentication service is not configured. Please set up your environment variables first.\n\nSteps to fix:\n1. Go to https://supabase.com/dashboard\n2. Create a new project or use existing\n3. Copy your project URL and anon key\n4. Create .env.local file in the project root\n5. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY\n6. Enable Google OAuth in Supabase Auth settings";
      alert(errorMessage);
      throw new Error(
        "Supabase is not configured. Please check your environment variables."
      );
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/tasks`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      const errorMessage =
        "Supabase is not configured. Please follow these steps:\n\n" +
        "1. Go to https://app.supabase.com/\n" +
        "2. Create a new project\n" +
        "3. Go to Settings → API\n" +
        "4. Copy your Project URL and Anon Key\n" +
        "5. Update your .env.local file with real values\n" +
        "6. Restart your development server\n\n" +
        "Current values:\n" +
        `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "[SET]" : "NOT SET"}`;

      alert(errorMessage);
      throw new Error(
        "Authentication service is not configured. Please check your environment variables."
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      console.log("Email sign in successful:", data.user.email);
      // The auth state change listener will handle setting the user and redirecting
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      const errorMessage =
        "Supabase is not configured. Please follow these steps:\n\n" +
        "1. Go to https://app.supabase.com/\n" +
        "2. Create a new project\n" +
        "3. Go to Settings → API\n" +
        "4. Copy your Project URL and Anon Key\n" +
        "5. Update your .env.local file with real values\n" +
        "6. Restart your development server\n\n" +
        "Current values:\n" +
        `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "[SET]" : "NOT SET"}`;

      alert(errorMessage);
      throw new Error(
        "Authentication service is not configured. Please check your environment variables."
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/tasks`,
      },
    });

    if (error) {
      // Provide more specific error messages based on the error type
      console.error("Supabase signup error:", error);
      
      if (error.message.includes("database")) {
        throw new Error("Database error saving new user. Please try again in a few minutes.");
      } else if (error.message.includes("email")) {
        throw new Error("Invalid email address or email already registered.");
      } else if (error.message.includes("password")) {
        throw new Error("Password requirements not met. Please use a stronger password.");
      } else if (error.message.includes("rate limit") || error.message.includes("too many")) {
        throw new Error("Too many signup attempts. Please try again later.");
      } else {
        throw new Error(error.message || "Failed to create account. Please try again.");
      }
    }

    if (data.user) {
      console.log("Email sign up successful:", data.user.email);

      // Check if email confirmation is required
      if (!data.session) {
        // Return a special result object instead of throwing an error
        // This indicates that email confirmation is required
        return { requiresEmailConfirmation: true };
      }

      // If we have a session, the auth state change listener will handle the rest
      return { requiresEmailConfirmation: false };
    }

    // If no user was created, something went wrong
    throw new Error("Failed to create user account");
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    console.log("SignOut called, setting isSigningOut to true");
    // Set flag to indicate we're signing out
    setIsSigningOut(true);
    isSigningOutRef.current = true;

    try {
      // Sign out with scope 'global' to clear session from all tabs
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        console.log("SignOut error:", error);

        // If the error is about missing session, treat it as already signed out
        if (
          error?.message?.includes("AuthSessionMissingError") ||
          error?.message?.includes("Auth session missing")
        ) {
          console.log(
            "Session already missing, treating as successful sign out"
          );
          // Force clear the user state and redirect
          setUser(null);
          // Set flag and clear remaining browser storage
          localStorage.setItem("recentSignOut", Date.now().toString());
          const recentSignOut = localStorage.getItem("recentSignOut");
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem("recentSignOut", recentSignOut || "");
          // Don't redirect manually - let the auth state listener handle it
          setIsSigningOut(false);
          isSigningOutRef.current = false;
          return;
        }

        setIsSigningOut(false);
        isSigningOutRef.current = false;
        throw error;
      }

    console.log("SignOut completed successfully");
    // Don't manually clear user state or redirect here - let the auth state listener handle it
    // The SIGNED_OUT event will be fired and handle the cleanup and redirect
    } catch (error: unknown) {
      // Handle network or other unexpected errors
      console.log("Unexpected error during sign out:", error);

      // Even if there's an error, try to clear local state
      setUser(null);
      localStorage.setItem("recentSignOut", Date.now().toString());
      const recentSignOut = localStorage.getItem("recentSignOut");
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("recentSignOut", recentSignOut || "");

      // Don't redirect manually - let the auth state listener handle it
      setIsSigningOut(false);
      isSigningOutRef.current = false;
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user,
    isSigningOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
