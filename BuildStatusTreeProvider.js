const vscode = require("vscode");

class BuildStatusTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.buildStatus = [{ label: "Fetching build status...", description: "" }];
    }

    updateTreeView(projects) {
        this.buildStatus = projects.map(project => ({
            label: `${project.name} - ${project.status.toUpperCase()}`,
            description: project.status
        }));
        this.refresh();
    }

    refresh() {
        console.log("🔄 Refreshing tree view...");
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return new vscode.TreeItem(element.label);
    }

    getChildren() {
        console.log("📡 Fetching build status for tree view...");
        return this.buildStatus;
    }
}

module.exports = BuildStatusTreeProvider;
