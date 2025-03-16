const vscode = require('vscode');
const axios = require('axios');

async function getApiToken(context, platform) {
    let token = context.globalState.get(`${platform}_token`);
    if (!token) {
        token = await vscode.window.showInputBox({
            prompt: `Enter your ${platform} API Token`,
            ignoreFocusOut: true,
            password: true
        });
        if (token) {
            await context.globalState.update(`${platform}_token`, token);
        }
    }
    return token;
}

async function getAccountId(context) {
    let accountId = context.globalState.get('cloudflare_account_id');
    if (!accountId) {
        accountId = await vscode.window.showInputBox({
            prompt: 'Enter your Cloudflare Account ID',
            ignoreFocusOut: true
        });
        if (accountId) {
            await context.globalState.update('cloudflare_account_id', accountId);
        }
    }
    return accountId;
}

async function fetchProjects(apiUrl, token) {
    try {
        const response = await axios.get(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching projects from ${apiUrl}: ${error.message}`);
        return null;
    }
}

async function fetchBuildStatus(apiUrl, token, platform, accountId) {
    const projectsData = await fetchProjects(apiUrl, token);
    if (!projectsData) return;

    let projects = platform === 'Cloudflare' ? projectsData.result : projectsData.projects;
    const projectNames = projects.map(project => platform === 'Cloudflare' ? project.name : project.id);

    for (const projectName of projectNames) {
        const deploymentsApi = platform === 'Cloudflare' 
            ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments` 
            : `https://api.vercel.com/v6/deployments?projectId=${projectName}`;

        const deployments = await fetchProjects(deploymentsApi, token);
        if (deployments) {
            const latestDeployment = platform === 'Cloudflare' ? deployments.result[0] : deployments.deployments[0];
            if (latestDeployment) {
                updateStatusBar(platform, projectName, latestDeployment.latest_stage?.status || latestDeployment.state);
            }
        }
    }
}

function updateStatusBar(platform, projectName, status) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = `${platform} (${projectName}): ${status}`;
    statusBar.show();
}

async function checkBuildStatus(context) {
    const cloudflareToken = await getApiToken(context, 'Cloudflare');
    const vercelToken = await getApiToken(context, 'Vercel');
    const accountId = await getAccountId(context);

    if (cloudflareToken && accountId) {
        const cloudflareProjectsApi = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
        await fetchBuildStatus(cloudflareProjectsApi, cloudflareToken, 'Cloudflare', accountId);
    }

    if (vercelToken) {
        const vercelProjectsApi = 'https://api.vercel.com/v9/projects';
        await fetchBuildStatus(vercelProjectsApi, vercelToken, 'Vercel', null);
    }
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.checkBuildStatus', () => checkBuildStatus(context));
    context.subscriptions.push(disposable);
    
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = "$(sync) Checking builds...";
    statusBar.command = "extension.checkBuildStatus";
    statusBar.show();
    context.subscriptions.push(statusBar);
    
    setInterval(() => checkBuildStatus(context), 120000); // Check build status every 2 minutes
}

function deactivate() {}

module.exports = { activate, deactivate };
