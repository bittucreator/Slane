/**
 * @author Shiva Nagendra Babu Kore
 * Polar.sh integration for payment processing
 */

import { Polar } from '@polar-sh/sdk';

// Initialize Polar SDK
export const polar = new Polar({
  accessToken: process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN || '',
});

// Product/Plan configurations
export const POLAR_PRODUCTS = {
  FREE: {
    id: 'free-plan',
    name: 'Free',
    description: 'Free is enough.',
    price: 0,
    features: [
      'Upto 100 tasks',
      'Offline access',
      'PWA support',
      'Updates & support',
      'Basic task management'
    ]
  },
  PRO_MONTHLY: {
    id: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID || 'pro-monthly',
    name: 'PRO Monthly',
    description: 'For those who build with intent.',
    price: 500, // Price in cents
    interval: 'month',
    features: [
      'Unlimited tasks',
      'Offline access',
      'Power features (shortcuts, filters)',
      'Advanced task management',
      'Priority updates & support'
    ]
  },
  PRO_YEARLY: {
    id: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID || 'pro-yearly',
    name: 'PRO Yearly',
    description: 'For those who build with intent.',
    price: 4900, // Price in cents ($49/year)
    interval: 'year',
    features: [
      'Unlimited tasks',
      'Offline access',
      'Power features (shortcuts, filters)',
      'Advanced task management',
      'Priority updates & support'
    ]
  }
};

// Create checkout session
export async function createCheckoutSession(
  productId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const product = Object.values(POLAR_PRODUCTS).find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Create checkout session via Polar API
    try {
      const response = await polar.checkouts.create({
        products: [productId], // Array of product IDs
        successUrl: successUrl,
        // Add customer email if available
        customerEmail: undefined, // Will be populated from auth context
      });

      return {
        id: response.id,
        url: response.url,
        product: product
      };
    } catch (polarError) {
      console.error('Polar API error:', polarError);
      
      // Fallback to direct Polar checkout URL
      const organizationId = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID;
      const fallbackUrl = organizationId 
        ? `https://polar.sh/${organizationId}/checkout/${productId}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`
        : `https://polar.sh/checkout/${productId}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
      
      return {
        id: `fallback_${Date.now()}`,
        url: fallbackUrl,
        product: product
      };
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Verify subscription status
export async function verifySubscription() {
  try {
    // This would typically call the Polar API to check subscription status
    // For now, return a mock response
    return {
      isActive: false,
      plan: 'free',
      expiresAt: null
    };
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return {
      isActive: false,
      plan: 'free',
      expiresAt: null
    };
  }
}

// Format price for display
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

// Calculate yearly savings percentage
export function calculateYearlySavings(): number {
  const monthlyYearly = POLAR_PRODUCTS.PRO_MONTHLY.price * 12;
  const yearly = POLAR_PRODUCTS.PRO_YEARLY.price;
  return Math.round(((monthlyYearly - yearly) / monthlyYearly) * 100);
}