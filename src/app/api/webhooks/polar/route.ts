/**
 * @author Shiva Nagendra Babu Kore
 * Polar.sh webhook handler for subscription events
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'standardwebhooks';
import { createClient } from '@supabase/supabase-js';

// TypeScript interfaces for Polar webhook events
interface PolarSubscription {
  id: string;
  status: string;
  product_name: string;
  user_email: string;
  expires_at?: string;
}

interface PolarOrder {
  id: string;
  user_email: string;
  product_name: string;
  amount: number;
}

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('POLAR_WEBHOOK_SECRET not set');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    
    // Verify webhook signature
    if (webhookSecret) {
      const wh = new Webhook(webhookSecret);
      const signature = headersList.get('webhook-signature');
      
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
      }

      try {
        wh.verify(body, { 'webhook-signature': signature });
      } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    
    console.log('Received Polar webhook:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;
      
      case 'order.created':
        await handleOrderCreated(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: PolarSubscription) {
  console.log('Subscription created:', subscription.id);
  
  try {
    // Update user subscription status in Supabase
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'active',
        subscription_id: subscription.id,
        plan_type: subscription.product_name?.toLowerCase().includes('yearly') ? 'pro_yearly' : 'pro_monthly',
        subscription_expires_at: subscription.expires_at,
        updated_at: new Date().toISOString()
      })
      .eq('email', subscription.user_email);

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log('Subscription status updated successfully');
    }
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: PolarSubscription) {
  console.log('Subscription updated:', subscription.id);
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: subscription.status,
        subscription_expires_at: subscription.expires_at,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCanceled(subscription: PolarSubscription) {
  console.log('Subscription canceled:', subscription.id);
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription:', error);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleOrderCreated(order: PolarOrder) {
  console.log('Order created:', order.id);
  
  // Handle one-time purchase events if needed
  // This could be used for lifetime deals or other non-subscription products
}