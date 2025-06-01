const fs = require("fs");
const path = require("path");
require("dotenv").config(); // loads from .env

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
  permissions: ["identity", "storage", "scripting", "activeTab"],
  host_permissions: ["https://www.googleapis.com/*"],
  oauth2: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  },
  background: {
    service_worker: "background.js"
  },
  key: process.env.PUBLIC_KEY_BASE64
};

fs.writeFileSync(
  path.join(__dirname, "dist", "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

// replacing SPREADSHEET_ID so no need to include config.js
let bg = fs.readFileSync(path.join(__dirname, 'src', 'background.js'), 'utf-8');
bg = bg.replace(/const SPREADSHEET_ID = .*;/, `const SPREADSHEET_ID = "${process.env.SPREADSHEET_ID}";`);
fs.writeFileSync(path.join(__dirname, 'dist', 'background.js'), bg);