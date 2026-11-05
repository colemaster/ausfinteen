#!/usr/bin/env node
/**
 * Syncs the compiled Astro static build (`dist/`) into the Android app's
 * bundled assets directory (`android/app/src/main/assets/public/`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const androidAssetsPublicDir = path.join(
  rootDir,
  'android',
  'app',
  'src',
  'main',
  'assets',
  'public'
);

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

// Clean existing assets/public directory
if (fs.existsSync(androidAssetsPublicDir)) {
  fs.rmSync(androidAssetsPublicDir, { recursive: true, force: true });
}
fs.mkdirSync(androidAssetsPublicDir, { recursive: true });

// Recursively copy dist/ -> android/app/src/main/assets/public/
// To keep the APK compact and fast while retaining 100% visual fidelity on Android Chromium WebView
// (which natively renders AVIF and WebP), we copy all HTML, JS, CSS, fonts, SVG, JSON, WebP, and JPG files,
// and skip duplicate .avif / .png variants when a .webp or .jpg already exists in the same folder.
let copiedFiles = 0;
let copiedBytes = 0;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      // Skip sourcemaps if any
      if (entry.name.endsWith('.map')) continue;
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
      copiedBytes += fs.statSync(destPath).size;
    }
  }
}

copyDir(distDir, androidAssetsPublicDir);

const mb = (copiedBytes / (1024 * 1024)).toFixed(2);
console.log(
  `✓ Synced ${copiedFiles} files (${mb} MB) from dist/ to android/app/src/main/assets/public/`
);
