# Required Visual Assets for App Store Deployment

This document lists all visual assets that need to be created before you can deploy DealFlow to the App Stores.

## ⚠️ Critical Missing Assets

These assets are referenced in your app.json but don't exist yet. You must create them before building:

### 1. Splash Screen
**File:** `assets/images/splash.png`

**Specifications:**
- **Dimensions:** 1284 x 2778 pixels (iPhone 14 Pro Max size)
- **Format:** PNG with transparency support
- **Color mode:** RGB
- **Purpose:** Displayed while the app is loading

**Design Guidelines:**
- Use a solid background color (currently set to white in app.json)
- Center your logo or app branding
- Keep it simple - users see this for only 1-2 seconds
- Ensure the design works in both light and dark mode
- Safe area: Keep important elements in center 60% of the image

**Example Design:**
```
┌─────────────────────┐
│                     │
│                     │
│     [Your Logo]     │
│     DealFlow        │
│                     │
│                     │
└─────────────────────┘
```

### 2. Android Adaptive Icon
**File:** `assets/images/adaptive-icon.png`

**Specifications:**
- **Dimensions:** 1024 x 1024 pixels
- **Format:** PNG with transparency
- **Color mode:** RGBA (with alpha channel)
- **Purpose:** Foreground layer for Android adaptive icons

**Design Guidelines:**
- Android will mask this into various shapes (circle, square, rounded square)
- **Critical:** Keep all important elements within the center 66% (safe zone)
- The outer 33% may be cropped on some devices
- Works with the background color set in app.json (currently white)
- Design should work as a standalone icon without background

**Safe Zone Diagram:**
```
1024px
┌─────────────────────┐
│  Cropped on some    │  Outer 17%
├─────────────────────┤
│ │                 │ │
│ │   SAFE ZONE     │ │  Center 66%
│ │  (683 x 683px)  │ │  Keep logo here!
│ │                 │ │
├─────────────────────┤
│  Cropped on some    │  Outer 17%
└─────────────────────┘
```

## ✅ Existing Assets

### 3. App Icon
**File:** `assets/images/icon.png`
**Status:** ✅ Already exists

**Verify these specifications:**
- **Dimensions:** 1024 x 1024 pixels
- **Format:** PNG
- **No transparency:** iOS requires solid background
- **No alpha channel:** Must be RGB, not RGBA
- **Purpose:** Used for iOS app icon

**Validation Steps:**
1. Check file exists: `ls -lh assets/images/icon.png`
2. Check dimensions: Should be exactly 1024x1024
3. Verify no transparency: iOS will reject if transparent
4. Test on device: Icon should look crisp and clear

### 4. Favicon
**File:** `assets/images/favicon.png`
**Status:** ✅ Already exists
**Purpose:** Web version icon (not required for app stores)

## 📸 App Store Screenshots (Create After Building)

You'll need these screenshots after you build and test your app:

### iOS Screenshots Required

#### iPhone 6.7" Display (iPhone 14 Pro Max, 15 Pro Max)
- **Dimensions:** 1290 x 2796 pixels
- **Orientation:** Portrait
- **Quantity:** Minimum 3, recommended 5-8
- **Format:** PNG or JPEG

#### iPhone 6.5" Display (iPhone 11 Pro Max, XS Max)
- **Dimensions:** 1242 x 2688 pixels
- **Orientation:** Portrait
- **Quantity:** Minimum 3
- **Format:** PNG or JPEG

#### iPhone 5.5" Display (iPhone 8 Plus, 7 Plus)
- **Dimensions:** 1242 x 2208 pixels
- **Orientation:** Portrait
- **Quantity:** Minimum 3
- **Format:** PNG or JPEG

#### iPad Pro 12.9" Display (Optional but recommended)
- **Dimensions:** 2048 x 2732 pixels
- **Orientation:** Portrait
- **Quantity:** Minimum 3
- **Format:** PNG or JPEG

### Android Screenshots Required

#### Phone Screenshots
- **Dimensions:** Minimum 320px on short side
- **Recommended:** 1080 x 1920 pixels (9:16 aspect ratio)
- **Quantity:** Minimum 2, maximum 8
- **Format:** PNG or JPEG (max 8MB each)

#### 7-inch Tablet Screenshots (Optional)
- **Dimensions:** 1200 x 1920 pixels
- **Format:** PNG or JPEG

#### 10-inch Tablet Screenshots (Optional)
- **Dimensions:** 1800 x 2560 pixels
- **Format:** PNG or JPEG

### Screenshot Content Guidelines
Show your best features:
1. **Camera scanning** - Card being scanned
2. **Trade calculation** - Running totals screen
3. **History** - Saved trades organized in folders
4. **Coin flip** - Quick decision feature
5. **Pro features** - Highlight subscription benefits

**Tips:**
- Use actual app screenshots (no mockups)
- Add text overlays to highlight features
- Use consistent branding colors
- Show the app in use, not just static screens
- Demonstrate value proposition clearly

## 📐 Google Play Console Graphics

### Feature Graphic (Required for Android)
**File:** You'll upload this directly to Play Console

**Specifications:**
- **Dimensions:** 1024 x 500 pixels
- **Format:** PNG or JPEG
- **Purpose:** Featured in Play Store listings
- **Design:** Promotional graphic with app name and tagline

**Design Guidelines:**
- Use your brand colors and logo
- Include app name "DealFlow"
- Add tagline: "Trading Card Value Tracker" or similar
- Make it eye-catching but professional
- Avoid too much text
- No screenshots or device frames

### High-Res App Icon (Required for Android)
**File:** You'll upload this directly to Play Console

**Specifications:**
- **Dimensions:** 512 x 512 pixels
- **Format:** PNG (32-bit with transparency)
- **Purpose:** Used in Play Store listing

**Note:** This is different from your app icon. This is specifically for the Play Store display.

## 🎨 Design Tools and Resources

### Recommended Design Tools
- **Figma** (free tier available) - Professional design tool
- **Canva** (free tier available) - Easy templates for non-designers
- **Adobe Photoshop** - Industry standard
- **GIMP** (free) - Open-source alternative to Photoshop
- **Sketch** (Mac only) - Popular among iOS developers

### Icon and Splash Screen Generators
- [MakeAppIcon](https://makeappicon.com/) - Generate all icon sizes
- [AppIcon.co](https://appicon.co/) - Free icon generator
- [Expo Icon Generator](https://buildicon.com/) - Optimized for Expo

### Screenshot Tools
- **iOS:** Use Simulator > File > Save Screen
- **Android:** Use Emulator screenshot tool or device (Power + Volume Down)
- [Screenshot Designer](https://screenshots.pro/) - Add device frames and text
- [Fastlane Frameit](https://docs.fastlane.tools/actions/frameit/) - Automated screenshot framing

### Stock Images and Resources (if needed for feature graphic)
- [Unsplash](https://unsplash.com/) - Free high-quality photos
- [Pexels](https://www.pexels.com/) - Free stock photos
- [Flaticon](https://www.flaticon.com/) - Icons and graphics

## 📋 Creation Checklist

### Before Building
- [ ] Create splash screen (1284 x 2778 pixels)
- [ ] Create Android adaptive icon (1024 x 1024 pixels)
- [ ] Verify app icon meets requirements (1024 x 1024 pixels, no transparency)
- [ ] Test all assets in development build

### After Building (For Store Submission)
- [ ] Create iPhone 6.7" screenshots (1290 x 2796, min 3 images)
- [ ] Create iPhone 6.5" screenshots (1242 x 2688, min 3 images)
- [ ] Create iPhone 5.5" screenshots (1242 x 2208, min 3 images)
- [ ] Create iPad Pro screenshots (2048 x 2732, optional but recommended)
- [ ] Create Android phone screenshots (1080 x 1920, min 2 images)
- [ ] Create feature graphic for Google Play (1024 x 500 pixels)
- [ ] Create high-res icon for Google Play (512 x 512 pixels)

## 🚀 Quick Start Commands

After creating the required assets, verify them:

```bash
# Check if required files exist
ls -lh assets/images/icon.png
ls -lh assets/images/splash.png
ls -lh assets/images/adaptive-icon.png
ls -lh assets/images/favicon.png

# Check image dimensions (macOS)
sips -g pixelWidth -g pixelHeight assets/images/icon.png
sips -g pixelWidth -g pixelHeight assets/images/splash.png
sips -g pixelWidth -g pixelHeight assets/images/adaptive-icon.png

# Check image dimensions (Linux)
identify assets/images/icon.png
identify assets/images/splash.png
identify assets/images/adaptive-icon.png
```

## ⚡ Priority Order

If you're short on time, create in this order:

1. **Splash Screen** (Critical - app won't build without it)
2. **Android Adaptive Icon** (Critical - Android build requires it)
3. **iPhone screenshots** (needed for App Store submission)
4. **Android screenshots** (needed for Play Store submission)
5. **Feature Graphic** (needed for Play Store submission)
6. **iPad screenshots** (optional but increases download rates)
7. **Tablet screenshots** (optional)

## 💡 Pro Tips

- **Consistency:** Use the same color scheme across all assets
- **Branding:** Ensure your logo/brand is recognizable in all sizes
- **Testing:** View assets on actual devices before submitting
- **Backups:** Keep source files (PSD, Figma, etc.) for future updates
- **Versions:** Create dark mode versions if your app supports it
- **Accessibility:** Ensure good contrast ratios for visibility

---

**Need Help?**
- [Apple Human Interface Guidelines - App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [App Store Screenshot Specifications](https://help.apple.com/app-store-connect/#/devd274dd925)
- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

---

**Last Updated:** December 2025
