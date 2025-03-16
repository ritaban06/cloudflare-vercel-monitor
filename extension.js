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

async function fetchBuildStatus(apiUrl, token, platform) {
    const projectsData = await fetchProjects(apiUrl, token);
    if (!projectsData) return;

    let projects = platform === 'Cloudflare' ? projectsData.result : projectsData.projects;
    const projectIds = projects.map(project => platform === 'Cloudflare' ? project.name : project.id);

    for (const projectId of projectIds) {
        const deploymentsApi = platform === 'Cloudflare' 
            ? `https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/${projectId}/deployments` 
            : `https://api.vercel.com/v6/deployments?projectId=${projectId}`;

        const deployments = await fetchProjects(deploymentsApi, token);
        if (deployments) {
            const latestDeployment = platform === 'Cloudflare' ? deployments.result[0] : deployments.deployments[0];
            if (latestDeployment) {
                updateStatusBar(platform, projectId, latestDeployment.latest_stage?.status || latestDeployment.state);
            }
        }
    }
}

function updateStatusBar(platform, projectId, status) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.text = `${platform} (${projectId}): ${status}`;
    statusBar.show();
}

async function checkBuildStatus(context) {
    const cloudflareToken = await getApiToken(context, 'Cloudflare');
    const vercelToken = await getApiToken(context, 'Vercel');

    const cloudflareProjectsApi = 'https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects';
    const vercelProjectsApi = 'https://api.vercel.com/v9/projects';

    await fetchBuildStatus(cloudflareProjectsApi, cloudflareToken, 'Cloudflare');
    await fetchBuildStatus(vercelProjectsApi, vercelToken, 'Vercel');
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
