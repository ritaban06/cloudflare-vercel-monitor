const vscode = require("vscode");
const BuildStatusProvider = require("./BuildStatusProvider");
const BuildStatusTreeProvider = require("./BuildStatusTreeProvider");

/**
 * Extension activation function.
 */
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel("Cloudflare Vercel Monitor");
    outputChannel.appendLine("⚡ Extension Activated!");
    console.log("⚡ Extension activated! (Check Log: Extension Host)");
    outputChannel.show(true);

    const treeProvider = new BuildStatusTreeProvider();
    vscode.window.registerTreeDataProvider("buildStatusView", treeProvider);

    console.log("✅ Tree Provider Initialized!");
    outputChannel.appendLine("✅ Tree Provider Initialized!");

    const buildStatusProvider = new BuildStatusProvider(context, treeProvider);

    // Auto-fetch build status on activation
    buildStatusProvider.updateSidebar();

    // Register Refresh Command
    let refreshCommand = vscode.commands.registerCommand("extension.refreshBuildStatus", async () => {
        vscode.window.showInformationMessage("🔄 Refreshing Build Status...");
        console.log("🔄 Refreshing Build Status...");
        outputChannel.appendLine("🔄 Refreshing Build Status...");
        await buildStatusProvider.updateSidebar();
    });

    context.subscriptions.push(refreshCommand, outputChannel);
}

/**
 * Extension deactivation function.
 */
function deactivate() {
    console.log("🛑 Extension Deactivated!");
}

module.exports = { activate, deactivate };
