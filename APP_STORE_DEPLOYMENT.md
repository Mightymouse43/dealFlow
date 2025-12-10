# App Store Deployment Guide

This guide will walk you through deploying the DealFlow app to both the Apple App Store and Google Play Store using Expo EAS Build.

## Current Status

✅ **Completed Configuration:**
- EAS Build configuration (eas.json)
- App identity (name, bundle identifier, package name)
- Camera permissions configured
- Splash screen configuration added
- Adaptive icon configuration added
- Build numbers and version codes set

⚠️ **Action Required:**

### 1. Create Required Visual Assets

You need to create the following image assets before building:

#### Splash Screen
- **File:** `assets/images/splash.png`
- **Size:** 1284x2778 pixels (recommended)
- **Format:** PNG with transparency
- **Purpose:** Displayed when the app first launches
- **Design tip:** Use your branding colors and logo centered on a solid background

#### Adaptive Icon (Android)
- **File:** `assets/images/adaptive-icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Purpose:** Android adaptive icon foreground layer
- **Design tip:** Keep important elements in the center 66% safe zone

#### App Icon (Already exists)
- **File:** `assets/images/icon.png`
- **Current status:** ✅ Already present
- **Size:** Should be 1024x1024 pixels
- **Verify:** Ensure it meets store requirements

### 2. Set Up Developer Accounts

#### Apple Developer Program
1. Visit https://developer.apple.com/programs/
2. Enroll in the Apple Developer Program ($99 USD/year)
3. Complete verification (can take 1-2 days)
4. Note your Team ID from Account > Membership

#### Google Play Console
1. Visit https://play.google.com/console/
2. Create a developer account ($25 USD one-time fee)
3. Complete account verification
4. Accept developer agreement

### 3. Install and Configure EAS CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project
eas build:configure
```

When prompted, the CLI will:
- Create an EAS project ID (will replace `YOUR_EAS_PROJECT_ID` in app.json)
- Link your project to EAS

### 4. Update Production Credentials

#### RevenueCat Production API Key
Update `lib/revenuecat.ts` line 5:
```typescript
// Replace test key with your production key from RevenueCat dashboard
const REVENUECAT_API_KEY = 'YOUR_PRODUCTION_REVENUECAT_KEY';
```

Get your production key from:
1. RevenueCat Dashboard > Apps > Your App
2. API Keys > Public App-Specific API Key

#### Environment Variables
Store sensitive keys in EAS Secrets:
```bash
# Add RevenueCat webhook secret
eas secret:create --scope project --name REVENUECAT_WEBHOOK_SECRET --value your_webhook_secret

# Verify secrets
eas secret:list
```

### 5. Set Up In-App Purchases

#### App Store Connect (iOS)
1. Log in to https://appstoreconnect.apple.com
2. Go to My Apps > Create New App
3. Fill in app information
4. Navigate to Features > In-App Purchases
5. Create two auto-renewable subscriptions:
   - **Monthly Plan:** Product ID: `monthly_subscription`, Price: $4.99
   - **Yearly Plan:** Product ID: `yearly_subscription`, Price: $42.00
6. Create Subscription Group: "DealFlow Pro"
7. Add both subscriptions to the group

#### Google Play Console (Android)
1. Go to https://play.google.com/console
2. Create new app
3. Navigate to Monetization > Products > Subscriptions
4. Create two subscriptions:
   - **Monthly Plan:** Product ID: `monthly_subscription`, Price: $4.99
   - **Yearly Plan:** Product ID: `yearly_subscription`, Price: $42.00
5. Set up subscription benefits and terms

#### RevenueCat Configuration
1. Log in to https://app.revenuecat.com
2. Create products matching store product IDs
3. Create entitlement: "DealFlow Pro"
4. Attach both products to the entitlement
5. Configure webhook:
   - URL: `https://kmjhfyytfcngfkeosiek.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization: Bearer token (use the webhook secret from step 4)

### 6. Create Privacy Policy

You **must** have a privacy policy hosted online. Here's what to include:

**Required sections:**
- What data you collect (camera images, user accounts, trade history)
- How you use the data (card identification, personalization)
- Third-party services (Supabase, RevenueCat, n8n)
- Data retention and deletion
- User rights (access, deletion requests)
- Contact information

**Recommended tools:**
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Termly](https://termly.io/)
- [iubenda](https://www.iubenda.com/)

**After creating:**
1. Host the policy on a public URL
2. Update app.json with the URL:
```json
"ios": {
  "config": {
    "privacyManifests": {
      "NSPrivacyAccessedAPITypes": [],
      "NSPrivacyTrackingDomains": []
    }
  }
},
"android": {
  "privacyUrl": "https://your-domain.com/privacy-policy"
}
```

### 7. Build Your App

#### Create Development Build (for testing)
```bash
# iOS development build
eas build --profile development --platform ios

# Android development build
eas build --profile development --platform android
```

#### Create Production Build (for stores)
```bash
# iOS production build
eas build --profile production --platform ios

# Android production build (AAB for Play Store)
eas build --profile production --platform android
```

The build process will:
1. Generate or reuse signing credentials
2. Build your app in the cloud
3. Provide download links for the builds

### 8. Test Your Production Build

Before submission, test the production build thoroughly:

- [ ] Install on physical iOS device via TestFlight
- [ ] Install on physical Android device via internal testing
- [ ] Test camera scanning functionality
- [ ] Test in-app purchase flow (sandbox mode)
- [ ] Verify Supabase authentication
- [ ] Test trade history and folder features
- [ ] Test offline behavior
- [ ] Verify all permissions work correctly
- [ ] Test on multiple device sizes

### 9. Prepare Store Listings

#### App Store Connect (iOS)

**App Information:**
- **Name:** DealFlow
- **Subtitle:** Trading Card Value Tracker (max 30 characters)
- **Category:** Finance or Shopping
- **Content Rights:** Confirm you have rights to all content

**Version Information:**
- **App Description:** Write compelling description (max 4000 characters)
- **Keywords:** trading cards, card scanner, pokemon, sports cards, value tracker (max 100 characters)
- **Support URL:** Your support website
- **Marketing URL:** Your marketing website (optional)
- **Privacy Policy URL:** Required (from step 6)

**Screenshots Required:**
- 6.7" iPhone (1290 x 2796)
- 6.5" iPhone (1242 x 2688)
- 5.5" iPhone (1242 x 2208)
- iPad Pro (2048 x 2732)

**App Privacy Details:**
- Data types collected: Photos, User ID, Purchase History
- Usage: Analytics, App Functionality, Product Personalization
- Link to privacy policy

**Age Rating:**
- Complete questionnaire (likely 4+)

#### Google Play Console (Android)

**Store Listing:**
- **App name:** DealFlow
- **Short description:** Track trading card values with AI scanning (max 80 characters)
- **Full description:** Detailed description (max 4000 characters)
- **Category:** Finance or Shopping
- **Content rating:** Complete questionnaire

**Graphics:**
- App icon (512 x 512)
- Feature graphic (1024 x 500)
- Phone screenshots (at least 2)
- 7-inch tablet screenshots (optional)
- 10-inch tablet screenshots (optional)

**Data Safety:**
- Data collection: User account, camera/photos, purchase history
- Security practices: Data encryption in transit
- Privacy policy URL: Required (from step 6)

**Store Presence:**
- Countries: Select target countries
- Pricing: Free with in-app purchases

### 10. Submit for Review

#### iOS Submission
```bash
# Submit to App Store
eas submit --profile production --platform ios
```

Or manually:
1. Upload build to App Store Connect
2. Select build in App Store Connect
3. Fill in all required information
4. Add screenshots
5. Complete App Privacy section
6. Submit for review

**Review time:** Typically 1-3 days

#### Android Submission
```bash
# Submit to Google Play
eas submit --profile production --platform android
```

Or manually:
1. Upload AAB to Google Play Console
2. Complete store listing
3. Complete content rating questionnaire
4. Complete Data safety section
5. Set pricing and distribution
6. Submit for review

**Review time:** Typically 1-7 days

### 11. Post-Submission

#### Monitor Initial Launch
- Watch for crash reports in App Store Connect / Play Console
- Monitor RevenueCat dashboard for subscription events
- Check Supabase logs for authentication issues
- Respond to user reviews promptly

#### Update eas.json with Store IDs
After approval, update `eas.json` submit section:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABC123XYZ"
    },
    "android": {
      "serviceAccountKeyPath": "./google-play-service-account.json",
      "track": "production"
    }
  }
}
```

## Common Issues and Solutions

### Issue: "Bundle identifier is already in use"
**Solution:** Change `ios.bundleIdentifier` in app.json to a unique value (e.g., `com.yourcompany.dealflow`)

### Issue: "Missing splash screen"
**Solution:** Create `assets/images/splash.png` following the specifications in step 1

### Issue: "Missing adaptive icon"
**Solution:** Create `assets/images/adaptive-icon.png` following the specifications in step 1

### Issue: "Camera permission not working"
**Solution:** Verify `expo-camera` plugin is properly configured in app.json plugins array

### Issue: "Build fails due to credentials"
**Solution:** Run `eas credentials` to manage signing credentials manually

### Issue: "Purchases not working in production"
**Solution:**
1. Verify RevenueCat production API key is set
2. Confirm products are created in App Store Connect / Play Console
3. Check products are configured in RevenueCat dashboard
4. Ensure app is signed with distribution certificate (not development)

## Checklist Before First Submission

- [ ] All visual assets created (splash, adaptive icon, app icon)
- [ ] Privacy policy created and hosted
- [ ] Developer accounts created and verified
- [ ] EAS CLI installed and configured
- [ ] Production builds created and tested
- [ ] In-app purchases configured in all three places (stores + RevenueCat)
- [ ] RevenueCat production API key updated
- [ ] Screenshots created for all required device sizes
- [ ] Store listings completed
- [ ] App tested on physical devices
- [ ] Privacy/data safety sections completed
- [ ] Support URL and privacy policy URL added

## Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## Timeline Estimate

| Task | Estimated Time |
|------|----------------|
| Create visual assets | 2-4 hours |
| Set up developer accounts | 1-2 days (verification time) |
| Configure EAS and build | 2-3 hours |
| Set up in-app purchases | 2-3 hours |
| Create privacy policy | 1-2 hours |
| Test production builds | 4-8 hours |
| Create screenshots and listings | 3-4 hours |
| iOS review process | 1-3 days |
| Android review process | 1-7 days |
| **Total** | **1-2 weeks** |

## Support

If you encounter issues during deployment:
1. Check the [Expo troubleshooting guide](https://docs.expo.dev/build/troubleshooting/)
2. Search [Expo Forums](https://forums.expo.dev/)
3. Review [RevenueCat support](https://community.revenuecat.com/)
4. Check Apple/Google developer forums

---

**Last Updated:** December 2025
**App Version:** 1.0.0
**EAS CLI Version:** 13.2.0+
