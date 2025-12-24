/**
 * @author Shiva Nagendra Babu Kore
 * Hook for managing user subscriptions with Polar.sh
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verifySubscription } from '../lib/polar';
import { supabase } from '../lib/supabase';

export interface UserSubscription {
  isActive: boolean;
  plan: 'free' | 'pro_monthly' | 'pro_yearly';
  expiresAt: string | null;
  subscriptionId: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    isActive: false,
    plan: 'free',
    expiresAt: null,
    subscriptionId: null
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    try {
      // First check local database for subscription info
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('subscription_status, plan_type, subscription_expires_at, subscription_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        setSubscription({
          isActive: profile.subscription_status === 'active',
          plan: profile.plan_type || 'free',
          expiresAt: profile.subscription_expires_at,
          subscriptionId: profile.subscription_id
        });
      } else {
        // No profile found, verify with Polar API
        const polarSubscription = await verifySubscription();
        setSubscription({
          isActive: polarSubscription.isActive,
          plan: polarSubscription.plan as 'free' | 'pro_monthly' | 'pro_yearly',
          expiresAt: polarSubscription.expiresAt,
          subscriptionId: null
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSubscription({
        isActive: false,
        plan: 'free',
        expiresAt: null,
        subscriptionId: null
      });
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, fetchSubscription]);

  const refreshSubscription = () => {
    setLoading(true);
    fetchSubscription();
  };

  // Check if user has access to pro features
  const hasPro = subscription.isActive && 
    (subscription.plan === 'pro_monthly' || subscription.plan === 'pro_yearly');

  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = subscription.expiresAt && 
    new Date(subscription.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return {
    subscription,
    loading,
    hasPro,
    isExpiringSoon,
    refreshSubscription
  };
};