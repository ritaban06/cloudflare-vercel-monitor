# Cloudflare & Vercel Build Monitor - Changelog

## **[1.0.0] - Initial Release** 🎉
### 🔹 New Features:
- **Cloudflare Pages & Vercel Build Monitoring**
  - Fetch real-time build status.
  - Display statuses in a **sidebar tree view**.
  - Show deployment logs in a **webview panel**.

- **Automatic API Key Handling**
  - Users are prompted to enter **Cloudflare API Token**, **Cloudflare Account ID**, and **Vercel API Token**.
  - API keys are stored securely using **VS Code Global State**.

- **Command Palette Integration**
  - `Ctrl + Shift + P` → **Refresh Build Status**
  - `Ctrl + Shift + P` → **Open Build Status Panel**

- **Automatic Refresh on Activation**
  - The extension fetches **build statuses immediately** when activated.

- **Error Handling & Logs**
  - Errors are logged to **VS Code Output (`Cloudflare Vercel Monitor`)**.
  - Ensures **graceful failure** if API tokens are missing.

## **[Upcoming Features]**
- ✅ **Notifications for Build Status Changes**
- ✅ **Customization Settings for API Polling Time**
- ✅ **Support for More Deployment Providers (Netlify, GitHub Actions, etc.)**


## **[1.0.1] - Update 🚀**
### 🔹 **New Features & Improvements**
- **🖼️ SVG Icon Support**
  - The extension now supports **SVG icons** in VS Code.
  - Ensured compatibility with **VS Code Marketplace** by keeping a **PNG fallback**.

- **📡 Real API Integration for Build Status**
  - The extension now fetches **real-time Cloudflare Pages & Vercel deployment status**.
  - Replaced mock data with **actual API requests**.
  - Users are prompted to enter **Cloudflare API Token, Account ID, and Vercel API Token**.

- **📊 Sidebar & Webview Improvements**
  - The **Tree View now updates correctly** when fetching new statuses.
  - Webview dashboard displays **latest project statuses** dynamically.

- **🔄 Auto Refresh on Activation**
  - Build statuses are **automatically fetched** when the extension is activated.
  - Users can manually refresh with `Ctrl + Shift + P` → **Refresh Build Status**.

- **🐛 Bug Fixes**
  - **Fixed `globalState` undefined error** (API tokens were not being retrieved properly).
  - **Fixed duplicate `BuildStatusProvider` declaration**.
  - **Ensured `.vscodeignore` and `package.json` do not conflict** for packaging.

---

## **[Upcoming Features]**
- ✅ **Notifications for Build Status Changes**  
- ✅ **Customization Settings for API Polling Interval**  
- ✅ **Support for More Deployment Providers (Netlify, GitHub Actions, etc.)**  

---

### **🔄 How to Update**
1. **VS Code Users**: Open Extensions (`Ctrl + Shift + X`) → Find **Cloudflare & Vercel Build Monitor** → Click `Update`.  
2. **Manual Installation**:
   ```sh
   vsce package
   code --install-extension cloudflare-vercel-monitor-1.0.1.vsix
