# RevenueCat Integration Guide

This document provides a comprehensive guide to the RevenueCat SDK integration in the DealFlow app.

## Overview

The DealFlow app now uses RevenueCat for managing in-app subscriptions on iOS and Android. RevenueCat handles:
- Subscription purchase flows
- Receipt validation
- Entitlement management
- Subscription lifecycle events
- Customer subscription management

## Architecture

### 1. Core Configuration (`lib/revenuecat.ts`)
- Initializes RevenueCat SDK with API key
- Provides utility functions for common operations
- Handles user identification and logout
- Manages customer info and entitlements

### 2. Context Provider (`contexts/RevenueCatContext.tsx`)
- Global state management for RevenueCat
- Provides customer info and entitlements throughout the app
- Handles purchase operations
- Manages subscription restoration

### 3. Entitlement Utilities (`utils/entitlements.ts`)
- Helper functions for checking entitlements
- Feature access validation
- Subscription type detection

### 4. Paywall Component (`components/subscription/RevenueCatPaywall.tsx`)
- Wrapper for RevenueCat's native paywall UI
- Handles purchase success/error callbacks
- Platform-specific handling (web vs native)

## Features

### Pro Subscription Features
Users with "DealFlow Pro" entitlement get access to:
- ✅ Unlimited AI card scanning
- ✅ Save and manage trade history
- ✅ Custom percentages for individual items
- ✅ Create and organize trades in folders

### Free Trial
- 7-day free trial managed by Supabase (existing system)
- Can be activated before purchasing a subscription
- Tracked in `user_profiles.trial_end_date`

## Product Configuration

### Required Products in RevenueCat Dashboard:
1. **Monthly Subscription**
   - Product ID: `monthly`
   - Price: $4.99/month

2. **Yearly Subscription**
   - Product ID: `yearly`
   - Price: $42/year ($3.50/month)

### Entitlement Configuration:
- **Entitlement ID**: `DealFlow Pro`
- Attach both monthly and yearly products to this entitlement

## Integration Points

### Authentication Flow
When a user signs in:
1. User authenticates with Supabase
2. RevenueCat identifies user with Supabase user ID
3. Customer info is fetched and cached
4. Entitlements are checked

### Subscription Purchase Flow
1. User taps upgrade/subscribe button
2. RevenueCat Paywall is presented
3. User selects plan and completes purchase
4. Receipt is validated automatically
5. Entitlement is granted immediately
6. Webhook updates Supabase database
7. UI updates to reflect Pro status

### Subscription Management
PRO users can:
- View subscription status in Settings
- Access Customer Center to:
  - Change subscription plans
  - Cancel subscription
  - Update billing information
  - Contact support

## Webhook Integration

### Supabase Edge Function
Location: `supabase/functions/revenuecat-webhook/index.ts`

The webhook receives events from RevenueCat and updates the Supabase database:
- `INITIAL_PURCHASE`: User makes first purchase
- `RENEWAL`: Subscription renews
- `CANCELLATION`: User cancels subscription
- `EXPIRATION`: Subscription expires
- `UNCANCELLATION`: User reactivates subscription
- `BILLING_ISSUE`: Payment failed

### Webhook URL
After deployment, configure this URL in RevenueCat dashboard:
```
https://[your-project].supabase.co/functions/v1/revenuecat-webhook
```

### Webhook Security
- Requires Bearer token authentication
- Secret stored in environment variable: `REVENUECAT_WEBHOOK_SECRET`
- Configure webhook authorization in RevenueCat dashboard

## Testing

### Sandbox Testing
1. Create sandbox accounts in App Store Connect (iOS) or Google Play Console (Android)
2. Configure test API key in RevenueCat
3. Test purchase flows in development builds
4. Verify entitlements are granted correctly
5. Test subscription management features

### Test Scenarios
- [ ] New user subscribes to monthly plan
- [ ] New user subscribes to yearly plan
- [ ] User restores previous purchase
- [ ] User cancels subscription
- [ ] User changes from monthly to yearly
- [ ] Free trial activation
- [ ] Subscription expiration
- [ ] Payment failure handling

## Environment Setup

### Required Configuration
No manual environment variable setup needed! All secrets are automatically configured:
- `REVENUECAT_WEBHOOK_SECRET` - For webhook authentication
- RevenueCat API key is hardcoded in `lib/revenuecat.ts` (test key provided)

### Production Deployment
1. Replace test API key with production key in `lib/revenuecat.ts`
2. Configure production products in RevenueCat dashboard
3. Set up webhook URL in RevenueCat dashboard
4. Test with sandbox accounts before going live
5. Monitor subscription events in RevenueCat dashboard

## Code Examples

### Checking Pro Status
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isPro } = useAuth();

  if (isPro) {
    // User has Pro access
  }
}
```

### Checking Specific Features
```typescript
import { useRevenueCat } from '@/contexts/RevenueCatContext';

function MyComponent() {
  const { entitlements } = useRevenueCat();

  if (entitlements.hasUnlimitedScans) {
    // Allow scanning
  }
}
```

### Presenting Paywall
```typescript
import { RevenueCatPaywall } from '@/components/subscription/RevenueCatPaywall';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)}>Upgrade</Button>
      <RevenueCatPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          // Handle success
        }}
      />
    </>
  );
}
```

### Restoring Purchases
```typescript
import { useRevenueCat } from '@/contexts/RevenueCatContext';

function MyComponent() {
  const { restorePurchases } = useRevenueCat();

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('Success', 'Purchases restored!');
    }
  };
}
```

## Troubleshooting

### Common Issues

1. **"Purchases not available on web"**
   - RevenueCat only works on iOS/Android
   - Users must use native apps for subscriptions

2. **Entitlements not updating**
   - Check webhook is configured correctly
   - Verify webhook URL is accessible
   - Check Supabase Edge Function logs

3. **Purchase fails**
   - Verify product IDs match RevenueCat dashboard
   - Check sandbox account status
   - Ensure products are available in the region

4. **Customer Center won't open**
   - Only available on iOS/Android
   - Requires active subscription
   - Check Customer Center is enabled in RevenueCat

## Support Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat SDK Reference](https://sdk.revenuecat.com/)
- [Expo Integration Guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Customer Center Guide](https://www.revenuecat.com/docs/tools/customer-center)
- [Webhook Events Reference](https://www.revenuecat.com/docs/integrations/webhooks)

## Next Steps

1. **RevenueCat Dashboard Setup**
   - Create products (monthly and yearly)
   - Configure entitlements
   - Set up webhook URL
   - Add webhook authorization header

2. **App Store Configuration**
   - Create in-app purchases in App Store Connect
   - Create subscriptions in Google Play Console
   - Link products to RevenueCat

3. **Testing**
   - Test with sandbox accounts
   - Verify webhook events
   - Test all purchase flows

4. **Go Live**
   - Submit app for review
   - Monitor first purchases
   - Set up analytics and alerts

---

**Last Updated**: December 2025
**Integration Version**: 1.0.0
**RevenueCat SDK Version**: Latest (installed via npm)
