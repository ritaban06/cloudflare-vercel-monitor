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
