# Cloudflare & Vercel Build Monitor - VS Code Extension

Monitor your **Cloudflare Pages** and **Vercel** deployments inside **VS Code**.  
This extension fetches **real-time build status** and displays it in a **sidebar tree view** and a **webview panel**.

## 🚀 Features
- **📡 Fetch Build Status**: Monitors deployments from Cloudflare Pages & Vercel.
- **📊 Sidebar View**: Displays project statuses in a VS Code sidebar panel.
- **🔍 Webview Dashboard**: Shows detailed build logs and status.
- **🔄 Auto Refresh**: Fetches new build statuses on extension activation.
- **📢 Command Palette Support**: Refresh build status with `Ctrl + Shift + P` → `Refresh Build Status`.

## 🛠 Installation
### 1️⃣ Install from VSIX (Manual)
1. Download the **VSIX package** from the GitHub releases.
2. Open **VS Code**, go to `Extensions (Ctrl + Shift + X)`.
3. Click on **More Actions (⋮) → Install from VSIX...**.
4. Select the downloaded `.vsix` file.

### 2️⃣ Install from Marketplace (Coming Soon)
Once published, install via the VS Code Marketplace.

## 🔧 Setup & Usage
### 1️⃣ **Enter API Credentials**
- On first use, the extension will **ask for API tokens**.
- You need:
  - **Cloudflare API Token**
  - **Cloudflare Account ID**
  - **Vercel API Token**

### 2️⃣ **View Build Status**
- Open **Command Palette (`Ctrl + Shift + P`)** and run:
- A **sidebar view** will appear under **Explorer**.
- A **webview panel** will display deployment details.

### 3️⃣ **Refresh Build Status**
- Open **Command Palette (`Ctrl + Shift + P`)** and run:
- The sidebar and webview will update automatically.

## 🔗 API References
- [Cloudflare Pages API](https://developers.cloudflare.com/pages/platform/api/)
- [Vercel API](https://vercel.com/docs/rest-api)

## 🐛 Troubleshooting
- **No build status showing?**  
- Ensure your **API tokens** are correct.
- Check the **Output Panel (`View → Output → Cloudflare Vercel Monitor`)** for errors.
- **Extension not updating?**  
- Run `Developer: Reload Window` from the Command Palette.
- Restart VS Code.

## ✨ Contributing
Want to improve this extension? Feel free to **fork** and submit a PR!  
Report issues in the [GitHub repository](https://github.com/ritaban06/cloudflare-vercel-monitor).

## ⚖️ License
This extension is licensed under the **MIT License**.
