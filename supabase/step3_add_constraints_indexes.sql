-- STEP 3: Add constraints and indexes
-- Run this after STEP 2 is successful

-- Add constraints
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_status_check 
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing'));

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_plan_type_check 
CHECK (plan_type IN ('free', 'pro_monthly', 'pro_yearly'));

-- Add unique constraint for subscription_id
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_id_key 
UNIQUE (subscription_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id ON user_profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_polar_customer_id ON user_profiles(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);