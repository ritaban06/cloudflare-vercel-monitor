const vscode = require('vscode');
const axios = require('axios');

class BuildStatusProvider {
    constructor(context) {
        this.context = context;
        this.panel = null;
    }

    async getApiToken(platform) {
        let token = this.context.globalState.get(`${platform}_token`);
        if (!token) {
            token = await vscode.window.showInputBox({
                prompt: `Enter your ${platform} API Token`,
                ignoreFocusOut: true,
                password: true
            });
            if (token) {
                await this.context.globalState.update(`${platform}_token`, token);
            }
        }
        return token;
    }

    async getAccountId() {
        let accountId = this.context.globalState.get('cloudflare_account_id');
        if (!accountId) {
            accountId = await vscode.window.showInputBox({
                prompt: 'Enter your Cloudflare Account ID',
                ignoreFocusOut: true
            });
            if (accountId) {
                await this.context.globalState.update('cloudflare_account_id', accountId);
            }
        }
        return accountId;
    }

    async fetchProjects(apiUrl, token) {
        try {
            const response = await axios.get(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            vscode.window.showErrorMessage(`Error fetching projects: ${error.message}`);
            return null;
        }
    }

    async fetchBuildStatus(apiUrl, token, platform, accountId) {
        const projectsData = await this.fetchProjects(apiUrl, token);
        if (!projectsData) return [];

        let projects = platform === 'Cloudflare' ? projectsData.result : projectsData.projects;
        const projectNames = projects.map(project => platform === 'Cloudflare' ? project.name : project.id);

        let projectStatuses = [];

        for (const projectName of projectNames) {
            const deploymentsApi = platform === 'Cloudflare'
                ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`
                : `https://api.vercel.com/v6/deployments?projectId=${projectName}`;

            const deployments = await this.fetchProjects(deploymentsApi, token);
            if (deployments) {
                const latestDeployment = platform === 'Cloudflare' ? deployments.result[0] : deployments.deployments[0];
                if (latestDeployment) {
                    projectStatuses.push({
                        name: projectName,
                        status: latestDeployment.latest_stage?.status || latestDeployment.state
                    });
                }
            }
        }

        return projectStatuses;
    }

    async updateSidebar() {
        const cloudflareToken = await this.getApiToken('Cloudflare');
        const vercelToken = await this.getApiToken('Vercel');
        const accountId = await this.getAccountId();

        let allStatuses = [];

        if (cloudflareToken && accountId) {
            const cloudflareProjectsApi = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;
            const cloudflareStatuses = await this.fetchBuildStatus(cloudflareProjectsApi, cloudflareToken, 'Cloudflare', accountId);
            allStatuses = [...allStatuses, ...cloudflareStatuses];
        }

        if (vercelToken) {
            const vercelProjectsApi = 'https://api.vercel.com/v9/projects';
            const vercelStatuses = await this.fetchBuildStatus(vercelProjectsApi, vercelToken, 'Vercel', null);
            allStatuses = [...allStatuses, ...vercelStatuses];
        }

        this.renderSidebar(allStatuses);
    }

    renderSidebar(projects) {
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'buildStatusPanel',
                'Cloudflare & Vercel Status',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
        }

        const styles = `
            <style>
                body { font-family: Arial, sans-serif; padding: 10px; }
                h2 { color: #007acc; }
                .project { margin: 10px 0; padding: 10px; border-radius: 5px; }
                .success { background-color: #d4edda; color: #155724; }
                .failed { background-color: #f8d7da; color: #721c24; }
                .building { background-color: #fff3cd; color: #856404; }
            </style>
        `;

        const projectHtml = projects.map(project => {
            let statusClass = project.status === 'success' ? 'success' : (project.status === 'failed' ? 'failed' : 'building');
            return `<div class="project ${statusClass}"><strong>${project.name}</strong> - ${project.status.toUpperCase()}</div>`;
        }).join('');

        this.panel.webview.html = `
            <html>
                <head>${styles}</head>
                <body>
                    <h2>Cloudflare & Vercel Build Status</h2>
                    ${projectHtml || '<p>No projects found.</p>'}
                    <button onclick="refreshStatus()">🔄 Refresh</button>
                    <script>
                        const vscode = acquireVsCodeApi();
                        function refreshStatus() {
                            vscode.postMessage({ command: 'refresh' });
                        }
                    </script>
                </body>
            </html>
        `;

        this.panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'refresh') {
                this.updateSidebar();
            }
        });
    }
}

function activate(context) {
    let provider = new BuildStatusProvider(context);

    let sidebarCommand = vscode.commands.registerCommand('extension.openBuildStatus', () => {
        provider.updateSidebar();
    });

    context.subscriptions.push(sidebarCommand);

    setInterval(() => provider.updateSidebar(), 120000); // Refresh every 2 minutes
}

function deactivate() {}

module.exports = { activate, deactivate };
