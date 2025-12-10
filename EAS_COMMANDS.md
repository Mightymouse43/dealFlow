# EAS Build Quick Reference

Essential commands for building and deploying your DealFlow app with Expo EAS.

## Initial Setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize EAS in your project (first time only)
eas build:configure

# Link project to EAS
# This will update app.json with your project ID
```

## Building

### Development Builds (for testing)

```bash
# Build for iOS device/simulator
eas build --profile development --platform ios

# Build for Android device/emulator
eas build --profile development --platform android

# Build for both platforms
eas build --profile development --platform all
```

### Preview Builds (for internal testing)

```bash
# iOS build for TestFlight
eas build --profile preview --platform ios

# Android APK for testing
eas build --profile preview --platform android

# Both platforms
eas build --profile preview --platform all
```

### Production Builds (for App Stores)

```bash
# iOS production build for App Store
eas build --profile production --platform ios

# Android AAB for Google Play Store
eas build --profile production --platform android

# Build for both stores
eas build --profile production --platform all
```

## Build Management

```bash
# View all builds for your project
eas build:list

# View specific build details
eas build:view [BUILD_ID]

# Cancel a running build
eas build:cancel [BUILD_ID]

# Clear build cache (if having issues)
eas build --clear-cache
```

## Credentials Management

```bash
# View credentials
eas credentials

# iOS credentials
eas credentials --platform ios

# Android credentials
eas credentials --platform android

# Delete credentials (to regenerate)
eas credentials:delete
```

## Submission

### iOS Submission

```bash
# Submit to App Store Connect
eas submit --platform ios

# Submit specific build
eas submit --platform ios --id [BUILD_ID]

# Submit latest successful build
eas submit --platform ios --latest
```

### Android Submission

```bash
# Submit to Google Play Console
eas submit --platform android

# Submit specific build
eas submit --platform android --id [BUILD_ID]

# Submit to internal testing track
eas submit --platform android --track internal
```

## Environment and Secrets

```bash
# Create a secret
eas secret:create --scope project --name SECRET_NAME --value secret_value

# List all secrets
eas secret:list

# Delete a secret
eas secret:delete --name SECRET_NAME

# Create environment-specific secret
eas secret:create --scope project --name SECRET_NAME --value prod_value --environment production
```

## Updates (OTA Updates)

```bash
# Publish an OTA update to production
eas update --branch production --message "Fix bug in calculator"

# Publish to preview branch
eas update --branch preview --message "Testing new feature"

# View update history
eas update:list

# Roll back an update
eas update:rollback --branch production --group [UPDATE_GROUP_ID]
```

## Project Management

```bash
# View project info
eas project:info

# Initialize project
eas project:init

# Link to existing project
eas project:link
```

## Useful Options

```bash
# Non-interactive mode (for CI/CD)
eas build --non-interactive

# Auto-submit after build
eas build --auto-submit

# Local build (requires local Android/iOS setup)
eas build --local

# Skip credential validation
eas build --skip-credentials-check

# Clear all caches
eas build --clear-cache
```

## Common Workflows

### First Time Setup
```bash
# 1. Install and login
npm install -g eas-cli
eas login

# 2. Configure project
cd /path/to/dealflow
eas build:configure

# 3. Create first build
eas build --profile development --platform all
```

### Regular Development
```bash
# Make code changes
# ...

# Build and test
eas build --profile development --platform ios

# Once downloaded, install on device via TestFlight or direct install
```

### Preparing for Release
```bash
# 1. Build production version
eas build --profile production --platform all

# 2. Wait for builds to complete
eas build:list

# 3. Download and test builds thoroughly

# 4. Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Updating After Approval
```bash
# For code changes requiring new build
eas build --profile production --platform all
eas submit --platform all --latest

# For JS-only changes (OTA update - faster)
eas update --branch production --message "Bug fixes"
```

## Troubleshooting Commands

```bash
# Check build logs
eas build:view [BUILD_ID]

# Validate credentials
eas credentials

# Clear build cache
eas build --clear-cache

# Check project configuration
eas project:info

# Verify secrets
eas secret:list
```

## Build Configuration Profiles

Your project has three build profiles defined in `eas.json`:

### development
- For local testing
- Includes dev client
- Internal distribution
- Faster builds

### preview
- For internal testing
- iOS: TestFlight
- Android: APK format
- Test production-like builds

### production
- For App Store/Play Store
- iOS: Distribution certificate
- Android: AAB format
- Optimized and minified

## Environment Variables in Builds

EAS automatically includes:
- All `EXPO_PUBLIC_*` environment variables from `.env`
- All secrets created with `eas secret:create`
- Platform-specific environment variables

To use in code:
```typescript
// Access public env vars
const apiUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// Access secrets (server-side only)
const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
```

## Checking Build Status

```bash
# List recent builds
eas build:list --limit 10

# View specific build
eas build:view [BUILD_ID]

# Watch build in real-time
eas build:view [BUILD_ID] --wait

# Get build artifact URL
eas build:view [BUILD_ID] --json | jq '.artifacts.buildUrl'
```

## Cost Optimization

```bash
# Use smaller resource class for faster/cheaper builds
# Already configured in eas.json as "m-medium"

# Cancel builds that aren't needed
eas build:cancel [BUILD_ID]

# Use OTA updates for JS-only changes instead of new builds
eas update --branch production

# Check build minutes usage
eas account:view
```

## CI/CD Integration

For automated builds (GitHub Actions, etc.):

```bash
# Set up Expo token
export EXPO_TOKEN=your_token_here

# Run build in CI
eas build --profile production --platform all --non-interactive --no-wait
```

## Getting Help

```bash
# General help
eas --help

# Help for specific command
eas build --help
eas submit --help
eas update --help

# View EAS CLI version
eas --version

# Update EAS CLI
npm install -g eas-cli@latest
```

## Important Notes

1. **Build Limits:** Free tier includes limited build minutes. Check your plan at https://expo.dev/accounts/[account]/settings/billing

2. **Credentials:** EAS manages certificates and keys automatically. Store backups securely.

3. **Build Time:** Production builds typically take 10-20 minutes. Development builds are faster.

4. **Caching:** EAS caches dependencies. Use `--clear-cache` if builds fail mysteriously.

5. **Secrets:** Never commit secrets to git. Use `eas secret:create` instead.

6. **OTA Updates:** Can update JS/assets without rebuild. Cannot update native code.

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with credential error | Run `eas credentials` and regenerate |
| "Project not found" | Run `eas project:init` or check app.json |
| Dependency errors | Try `--clear-cache` flag |
| Slow builds | Use development profile for testing |
| Out of build minutes | Upgrade plan or use local builds |
| Submission fails | Check store credentials and app information |

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Forums](https://forums.expo.dev/)
- [EAS Pricing](https://expo.dev/pricing)

---

**Pro Tip:** Bookmark this file and keep it open in a terminal window for quick reference during development!

---

**Last Updated:** December 2025
**EAS CLI Version:** 13.2.0+
