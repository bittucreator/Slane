/**
 * @author Shiva Nagendra Babu Kore
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserPreferences {
  id: string;
  user_id: string;
  wallpaper_id: string;
  theme_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user preferences from database
  const loadPreferences = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No preferences found, create default ones
          const { data: newData, error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              wallpaper_id: 'default',
              theme_settings: {}
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setPreferences(newData);
        } else {
          throw fetchError;
        }
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update wallpaper preference
  const updateWallpaper = useCallback(async (wallpaperId: string) => {
    if (!supabase || !user || !preferences) {
      return false;
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update({ wallpaper_id: wallpaperId })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setPreferences(data);
      return true;
    } catch (err) {
      console.error('Error updating wallpaper:', err);
      setError(err instanceof Error ? err.message : 'Failed to update wallpaper');
      return false;
    }
  }, [user, preferences, supabase]);

  // Update theme settings
  const updateThemeSettings = useCallback(async (settings: Record<string, unknown>) => {
    if (!supabase || !user || !preferences) {
      return false;
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update({ theme_settings: settings })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setPreferences(data);
      return true;
    } catch (err) {
      console.error('Error updating theme settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update theme settings');
      return false;
    }
  }, [user, preferences, supabase]);

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updateWallpaper,
    updateThemeSettings,
    refetch: loadPreferences
  };
};
