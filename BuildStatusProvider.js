const vscode = require("vscode");
const axios = require("axios");

class BuildStatusProvider {
    constructor(treeProvider) {
        this.treeProvider = treeProvider;
        this.panel = null;
    }

    async fetchBuildStatus() {
        try {
            // Fetching build status from Cloudflare & Vercel APIs (Replace with actual API calls)
            console.log("📡 Fetching latest build status...");
            const projects = [
                { name: "Project 1", status: "success" },
                { name: "Project 2", status: "failed" },
                { name: "Project 3", status: "building" }
            ];
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
