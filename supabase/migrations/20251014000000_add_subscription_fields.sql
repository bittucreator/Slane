-- Migration: Add subscription fields to user_profiles table
-- This migration adds the necessary columns for Polar.sh subscription management

-- Add subscription status column (free, active, canceled, past_due)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Add subscription ID from Polar.sh
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Add plan type (free, pro_monthly, pro_yearly)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- Add subscription expiration timestamp
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id 
ON user_profiles(subscription_id);

-- Add check constraint for valid subscription statuses
ALTER TABLE user_profiles 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'unpaid'));

-- Add check constraint for valid plan types
ALTER TABLE user_profiles 
ADD CONSTRAINT check_plan_type 
CHECK (plan_type IN ('free', 'pro_monthly', 'pro_yearly'));