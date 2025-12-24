import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, subscriptionId, planType } = await request.json();

    console.log('🔄 Processing Pro activation for:', { email, subscriptionId, planType });

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Find user by email
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to find user profile'
      }, { status: 500 });
    }

    const currentTime = new Date().toISOString();
    const expiresAt = new Date();
    
    // Set expiration based on plan type
    if (planType === 'pro_yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const updateData = {
      subscription_status: 'active',
      plan_type: planType || 'pro_monthly',
      subscription_id: subscriptionId || `polar_${Date.now()}`,
      subscription_expires_at: expiresAt.toISOString(),
      updated_at: currentTime
    };

    if (!profile) {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          email,
          ...updateData,
          created_at: currentTime
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create user profile'
        }, { status: 500 });
      }

      console.log('✅ Created new Pro user profile:', newProfile);
      return NextResponse.json({
        success: true,
        message: 'Pro subscription activated (new user)',
        profile: newProfile
      });
    } else {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Failed to update subscription'
        }, { status: 500 });
      }

      console.log('✅ Updated user to Pro:', updatedProfile);
      return NextResponse.json({
        success: true,
        message: 'Pro subscription activated',
        profile: updatedProfile
      });
    }

  } catch (error) {
    console.error('❌ Error in Pro activation:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Pro Activation API',
    endpoints: {
      'POST /api/activate-pro': 'Activate Pro subscription for user by email'
    },
    example: {
      email: 'user@example.com',
      subscriptionId: 'polar_sub_123',
      planType: 'pro_monthly'
    }
  });
}