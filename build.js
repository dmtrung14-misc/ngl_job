const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { type } = require("os");
require("dotenv").config();

// Clean dist folder
const distDir = path.join(__dirname, "dist");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir);

// 1. Generate manifest.json
const manifest = {
  manifest_version: 3,
  name: "New Grad Life (NGL) - Easy Job Tracker",
  description: "Track job applications with 1 click. Integrates with Google Sheets & Firebase.",
  version: "1.0",
  action: {
    default_popup: "popup.html",
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  permissions: ["identity", "storage", "scripting", "activeTab", "tabs"],
  host_permissions: ["https://www.googleapis.com/*", "<all_urls>"],
  oauth2: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  },
  background: {
    service_worker: "background.js",
    type: "module"
  },
  key: process.env.PUBLIC_KEY_BASE64,
  content_security_policy: {
  extension_pages: "script-src 'self'; object-src 'self';"
  },
  web_accessible_resources: [
    {
      resources: ["icons/icon48.png"],
      matches: ["<all_urls>"]
    }
  ],
//   content_scripts: [
//   {
//     matches: ["<all_urls>"],
//     "js": ["banner.js"]
//   }
// ]
};

fs.writeFileSync(
  path.join(distDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

// 2. Bundle JS files with env variables injected
const define = {
  'process.env.SPREADSHEET_ID': `"${process.env.SPREADSHEET_ID}"`,
  'SPREADSHEET_ID': `"${process.env.SPREADSHEET_ID}"`
};

esbuild.buildSync({
  entryPoints: ['src/background.js'],
  outfile: 'dist/background.js',
  bundle: true,
  define,
  minify: false,
  platform: "browser",
});

esbuild.buildSync({
  entryPoints: ['src/popup.js'],
  outfile: 'dist/popup.js',
  bundle: true,
  define,
  minify: false,
});

// --- Copy report.html ---

// --- Bundle report.js ---
esbuild.buildSync({
  entryPoints: ['src/report.js'],
  outfile: path.join(distDir, 'report.js'),
  bundle: true,
  minify: false,
  define: {
    'process.env.SPREADSHEET_ID': `"${process.env.SPREADSHEET_ID}"`,
  },
});


console.log("✅ JS bundled");

// 3. Copy static files
const copy = (src, dest) => fs.copyFileSync(path.join(__dirname, src), path.join(__dirname, dest));

copy('src/popup.html', 'dist/popup.html');
copy('src/popup.css', 'dist/popup.css');
copy('src/keywords.json', 'dist/keywords.json');



// copy('src/firebase-config.js', 'dist/firebase-config.js');
esbuild.buildSync({
  entryPoints: ['src/firebase-config.js'],
  outfile: 'dist/firebase-config.js',
  bundle: true,
  define,
  minify: false,
});

// esbuild for banner.js
esbuild.buildSync({
  entryPoints: ['src/banner.js'],
  outfile: 'dist/banner.js',
  bundle: true,
  define,
  minify: false,
});


// Copy icons folder
fs.mkdirSync(path.join(distDir, 'icons'));
for (const size of [16, 48, 128]) {
  copy(`icons/icon${size}.png`, `dist/icons/icon${size}.png`);
}

console.log("✅ Static files copied");
