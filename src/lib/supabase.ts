/**
 * @author Shiva Nagendra Babu Kore
 */

import { createClient } from "@supabase/supabase-js";
import { ENV } from "./constants";

// Supabase configuration from environment variables only
const supabaseUrl = ENV.SUPABASE_URL?.trim();
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY?.trim();

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase Configuration Missing - Running in Demo Mode");
  console.warn(
    "To enable full functionality, set these environment variables in .env.local:"
  );
  console.warn("- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL");
  console.warn("- NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key");
  console.warn("Current status:");
  console.warn(
    `- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "[SET]" : "[MISSING]"}`
  );
  console.warn(
    `- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "[SET]" : "[MISSING]"}`
  );
}

// Additional URL validation if URL is provided
if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.error("❌ Invalid Supabase URL format:", supabaseUrl);
  console.error("URL should be in format: https://your-project.supabase.co");
}

// Detect mobile Safari for safe mode
const isMobileSafari = () => {
  try {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return (
      /Safari/.test(ua) &&
      /iPhone|iPad|iPod/.test(ua) &&
      !/Chrome|CriOS|FxiOS/.test(ua)
    );
  } catch {
    return false;
  }
};

// Check if device supports secure WebSocket connections - kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isWebSocketSecure = () => {
  try {
    if (typeof window === "undefined") return false;
    return (
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost"
    );
  } catch {
    return false;
  }
};

// Create Supabase client with mobile Safari safe mode
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    // Return a mock client for development when Supabase is not configured
    console.warn(
      "⚠️  Supabase not configured - using mock client for development"
    );
    return null;
  }

  try {
    const isSafariMobile = isMobileSafari();

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: !isSafariMobile, // Disable auto refresh on mobile Safari
        persistSession: true,
        detectSessionInUrl: !isSafariMobile, // Disable URL detection on mobile Safari
        flowType: "pkce",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: isSafariMobile
          ? {
              "X-Client-Info": "supabase-js-mobile-safari",
            }
          : {},
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return null;
  }
};

export const supabase = createSupabaseClient();

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          status: "todo" | "in_progress" | "completed" | "canceled";
          priority: "low" | "medium" | "high";
          due_date: string | null;
          all_tasks_order: number | null;
          todo_order: number | null;
          in_progress_order: number | null;
          completed_order: number | null;
          canceled_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          status?: "todo" | "in_progress" | "completed" | "canceled";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          all_tasks_order?: number | null;
          todo_order?: number | null;
          in_progress_order?: number | null;
          completed_order?: number | null;
          canceled_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          status?: "todo" | "in_progress" | "completed" | "canceled";
          priority?: "low" | "medium" | "high";
          due_date?: string | null;
          all_tasks_order?: number | null;
          todo_order?: number | null;
          in_progress_order?: number | null;
          completed_order?: number | null;
          canceled_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          role?: "user" | "assistant";
          content?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          wallpaper_id: string;
          theme_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallpaper_id?: string;
          theme_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallpaper_id?: string;
          theme_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
