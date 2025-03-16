const vscode = require("vscode");

class BuildStatusTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.buildStatus = [];
    }

    updateTreeView(projects) {
        this.buildStatus = projects.map(project => new vscode.TreeItem(
            `${project.name} - ${project.status.toUpperCase()}`,
            vscode.TreeItemCollapsibleState.None
        ));
        this.refresh();
    }

    refresh() {
        console.log("🔄 Refreshing tree view...");
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren() {
        console.log("📡 Fetching build status for tree view...");
        return this.buildStatus.length > 0
            ? this.buildStatus
            : [new vscode.TreeItem("No projects found")];
    }
}

module.exports = BuildStatusTreeProvider;
