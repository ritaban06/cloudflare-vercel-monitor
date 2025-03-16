const vscode = require("vscode");
const axios = require("axios");

class BuildStatusProvider {
    constructor(context, treeProvider) {
        this.context = context; // ✅ Ensure context is stored
        this.treeProvider = treeProvider;
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
        let accountId = this.context.globalState.get("cloudflare_account_id");
        if (!accountId) {
            accountId = await vscode.window.showInputBox({
                prompt: "Enter your Cloudflare Account ID",
                ignoreFocusOut: true
            });
            if (accountId) {
                await this.context.globalState.update("cloudflare_account_id", accountId);
            }
        }
        return accountId;
    }
    
    async fetchBuildStatus() {
        try {
            console.log("📡 Fetching latest build status from APIs...");
    
            // Replace these with your actual API keys and account details
            const CLOUDFLARE_API_TOKEN = await this.getApiToken("Cloudflare");
            const CLOUDFLARE_ACCOUNT_ID = await this.getAccountId();
            const VERCEL_API_TOKEN = await this.getApiToken("Vercel");
    
            if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !VERCEL_API_TOKEN) {
                console.error("❌ API tokens missing. Cannot fetch data.");
                return [];
            }
    
            // Fetch Cloudflare projects
            const cloudflareProjectsUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`;
            const cloudflareResponse = await axios.get(cloudflareProjectsUrl, {
                headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` }
            });
    
            let projects = [];
    
            if (cloudflareResponse.data && cloudflareResponse.data.result) {
                for (const project of cloudflareResponse.data.result) {
                    const deploymentsUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project.name}/deployments`;
                    const deploymentsResponse = await axios.get(deploymentsUrl, {
                        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` }
                    });
    
                    if (deploymentsResponse.data && deploymentsResponse.data.result.length > 0) {
                        const latestDeployment = deploymentsResponse.data.result[0];
                        projects.push({
                            name: project.name,
                            status: latestDeployment.latest_stage.status || "unknown"
                        });
                    }
                }
            }
    
            // Fetch Vercel projects
            const vercelProjectsUrl = "https://api.vercel.com/v9/projects";
            const vercelResponse = await axios.get(vercelProjectsUrl, {
                headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
            });
    
            if (vercelResponse.data && vercelResponse.data.projects) {
                for (const project of vercelResponse.data.projects) {
                    const deploymentsUrl = `https://api.vercel.com/v6/deployments?projectId=${project.id}`;
                    const deploymentsResponse = await axios.get(deploymentsUrl, {
                        headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
                    });
    
                    if (deploymentsResponse.data && deploymentsResponse.data.deployments.length > 0) {
                        const latestDeployment = deploymentsResponse.data.deployments[0];
                        projects.push({
                            name: project.name,
                            status: latestDeployment.state || "unknown"
                        });
                    }
                }
            }
    
            console.log("✅ Build Status Data Fetched:", projects);
            return projects;
        } catch (error) {
            console.error("❌ Error fetching build status:", error);
            return [];
        }
    }
    

    async updateSidebar() {
        const projects = await this.fetchBuildStatus();
        this.renderSidebar(projects);
        this.treeProvider.updateTreeView(projects);
    }

    renderSidebar(projects) {
        if (this.panel) {
            this.panel.dispose();
            this.panel = null;
        }

        this.panel = vscode.window.createWebviewPanel(
            "buildStatusPanel",
            "Cloudflare & Vercel Status",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

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

module.exports = BuildStatusProvider;
