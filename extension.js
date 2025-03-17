const vscode = require("vscode");
const BuildStatusProvider = require("./BuildStatusProvider");
const BuildStatusTreeProvider = require("./BuildStatusTreeProvider");

function activate(context) {
    const outputChannel = vscode.window.createOutputChannel("Cloudflare Vercel Monitor");
    outputChannel.appendLine("⚡ Extension Activated!");
    console.log("⚡ Extension activated! (Check Log: Extension Host)");
    outputChannel.show(true);

    const treeProvider = new BuildStatusTreeProvider(context);
    vscode.window.registerTreeDataProvider("buildStatusView", treeProvider);

    console.log("✅ Tree Provider Initialized!");
    outputChannel.appendLine("✅ Tree Provider Initialized!");

    const buildStatusProvider = new BuildStatusProvider(context, treeProvider);

    buildStatusProvider.updateSidebar();

    // ✅ Register Refresh Command
    let refreshCommand = vscode.commands.registerCommand("extension.refreshBuildStatus", async () => {
        vscode.window.showInformationMessage("🔄 Refreshing Build Status...");
        console.log("🔄 Refreshing Build Status...");
        outputChannel.appendLine("🔄 Refreshing Build Status...");
        await buildStatusProvider.updateSidebar();
    });

    // ✅ Register Clear API Tokens Command
    let clearTokensCommand = vscode.commands.registerCommand("extension.clearTokens", async () => {
        console.log("🗑 Clearing API Tokens...");
        outputChannel.appendLine("🗑 Clearing API Tokens...");

        await context.globalState.update("Cloudflare_token", undefined);
        await context.globalState.update("cloudflare_account_id", undefined);
        await context.globalState.update("Vercel_token", undefined);

        vscode.window.showInformationMessage("✅ API Tokens Cleared! Restart VS Code.");
    });

    // ✅ Add both commands to subscriptions
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(clearTokensCommand);
    context.subscriptions.push(outputChannel);
}

function deactivate() {
    console.log("🛑 Extension Deactivated!");
}

module.exports = { activate, deactivate };
