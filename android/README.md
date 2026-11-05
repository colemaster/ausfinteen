# AusTeen Money / AusFinTools — Android App (`v7.12.0`)

Full-featured, 100% offline-capable native Android application for **AusTeen Money / AusFinTools** (`com.ausfintools.app`), bundling all 21 Astro static pages, 11 Mandy Money modules, 28 interactive React 19 calculators, the **15-Year-Old QLD (Brisbane) High School Student First-Job Deep Analysis**, 101 QLD high schools, 9 SEQ universities, and 548+ statutory references.

---

## 📦 Ready-to-Install APKs

- **Signed Release APK (Recommended for Phone/Tablet Installation)**:
  - [`android/AusFinTools-v7.12.0.apk`](./AusFinTools-v7.12.0.apk)
  - [`android/app/build/outputs/apk/release/app-release.apk`](./app/build/outputs/apk/release/app-release.apk)
- **Debug APK (For Emulator / USB Debugging)**:
  - [`android/app/build/outputs/apk/debug/app-debug.apk`](./app/build/outputs/apk/debug/app-debug.apk)

### How to Install on Your Android Device
1. **Direct Sideload**: Copy `AusFinTools-v7.12.0.apk` to your Android phone or tablet (via Google Drive, USB cable, AirDrop/Quick Share, or email) and tap the file to install.
2. **Via ADB**:
   ```bash
   adb install -r android/AusFinTools-v7.12.0.apk
   ```

---

## ✨ Native Android Features

1. **100% Offline Virtual HTTPS Asset Engine (`LocalAssetWebViewClient`)**:
   - Serves the entire compiled Astro 7 + React 19 bundle from `assets/public/` over `https://appassets.androidplatform.net/` with zero internet dependency.
   - Full support for ES modules (`/_astro/*.js`), Astro `ClientRouter` (`ViewTransitions`), query parameters (`?tab=firstjob`, `?topic=bq-18`), WebFonts (`.woff2`), AVIF/WebP 3D Popmart graphics, WebAudio tactile synthesizer, and persistent `localStorage` (Teen Profile, 15yo Roadmap checkboxes, and calculator inputs).
2. **Native PDF Export & Print Bridge (`window.print()` → `Android PrintManager`)**:
   - Tapping any **Print / Save PDF** button (`PrintShareFAB`, `TeenResumeBuilder`, or calculator reports) launches Android's native **Save as PDF / Print** spooler.
3. **Native Android Share Sheet (`navigator.share` & `AndroidBridge.shareContent`)**:
   - Sharing any calculator result, deep-link, or 15yo Independence Roadmap summary opens the native Android Share chooser (Messages, WhatsApp, Discord, Email, Copy).
4. **Home-Screen Long-Press App Shortcuts (`res/xml/shortcuts.xml`)**:
   - Long-pressing the **AusTeen Money** launcher icon exposes 4 quick-launch shortcuts:
     - **Brisbane 15yo**: Opens `/brisbane-qld?tab=firstjob` (15yo First Job Deep Analysis)
     - **Careers & Pay**: Opens `/careers-employment` (Modern Awards & Junior Pay Calculator)
     - **Paycheck Split**: Opens `/teen-budgeting` (Barefoot 3-Bucket & Inverted 50/30/20 Splitter)
     - **28 Calculators**: Opens `/calculators` (Full Australian Calculator Suite)
5. **External Statutory Link Routing**:
   - Clicking any `WebReferenceLink` (`ato.gov.au`, `fairwork.gov.au`, `qld.gov.au`, `translink.com.au`, `servicesaustralia.gov.au`) automatically launches the external Android browser while keeping internal navigation inside the app.
6. **Adaptive Vector Icon & Predictive Back Navigation**:
   - Supports Android 8.0–16 (`minSdk 26`, `targetSdk 35`) with vector adaptive icons (`ic_launcher` / `ic_launcher_round`) and Android 13–16 `OnBackInvokedCallback` predictive back navigation.

---

## 🛠️ Rebuilding the APK After Web Changes

From the repository root:

```bash
# 1. Build the Astro static site and sync dist/ -> android/app/src/main/assets/public/
npm run android:sync

# 2. Compile and sign the Android Release & Debug APKs
npm run android:build
```
