-- Migration: Add Polar.sh subscription support
-- Description: Creates user_profiles table and adds subscription-related columns for Polar.sh integration
-- Date: 2025-10-14

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add subscription columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;

-- Add constraints after columns are created
DO $$
BEGIN
    -- Add check constraint for subscription_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_profiles_subscription_status_check'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_subscription_status_check 
        CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing'));
    END IF;

    -- Add check constraint for plan_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_profiles_plan_type_check'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_plan_type_check 
        CHECK (plan_type IN ('free', 'pro_monthly', 'pro_yearly'));
    END IF;

    -- Add unique constraint for subscription_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_subscription_id_key'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_subscription_id_key 
        UNIQUE (subscription_id);
    END IF;
END $$;

-- Create an index on subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id ON user_profiles(subscription_id);

-- Create an index on polar_customer_id for webhook processing
CREATE INDEX IF NOT EXISTS idx_user_profiles_polar_customer_id ON user_profiles(polar_customer_id);

-- Create an index on subscription_status for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for active subscribers
CREATE OR REPLACE VIEW active_subscribers AS
SELECT 
    id,
    user_id,
    email,
    subscription_id,
    subscription_status,
    plan_type,
    subscription_expires_at,
    polar_customer_id
FROM user_profiles 
WHERE subscription_status IN ('active', 'trialing')
AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW());

-- Create a function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = check_user_id 
        AND subscription_status IN ('active', 'trialing')
        AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for subscription data
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Users can only see their own subscription data
CREATE POLICY "Users can view own subscription data" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile (but subscription fields should be updated via webhooks)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can update subscription fields (for webhook handler)
-- Note: This assumes you have a service role setup for your webhook handler

-- Add comments to columns for documentation
COMMENT ON COLUMN user_profiles.subscription_status IS 'Current subscription status from Polar.sh';
COMMENT ON COLUMN user_profiles.subscription_id IS 'Polar.sh subscription ID';
COMMENT ON COLUMN user_profiles.plan_type IS 'Type of subscription plan';
COMMENT ON COLUMN user_profiles.subscription_expires_at IS 'When the subscription expires (for yearly plans)';
COMMENT ON COLUMN user_profiles.polar_customer_id IS 'Polar.sh customer ID for this user';

-- Sample data (optional - remove if not needed)
-- Update existing users to have free plan by default
UPDATE user_profiles 
SET 
    subscription_status = 'free',
    plan_type = 'free'
WHERE subscription_status IS NULL OR plan_type IS NULL;