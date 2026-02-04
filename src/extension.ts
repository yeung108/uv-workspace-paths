import * as vscode from "vscode";
import * as path from "path";
import { buildDependencyGraph, findWorkspaceRoot } from "./dependencyGraph.js";
import {
  updateWorkspaceFile,
  findWorkspaceFile,
} from "./workspaceUpdater.js";

let statusBarItem: vscode.StatusBarItem;
let fileWatcher: vscode.FileSystemWatcher | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("UV Workspace Paths extension activated");

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "uvWorkspacePaths.refresh";
  context.subscriptions.push(statusBarItem);

  // Register refresh command
  const refreshCommand = vscode.commands.registerCommand(
    "uvWorkspacePaths.refresh",
    async () => {
      await refreshPaths(true);
    }
  );
  context.subscriptions.push(refreshCommand);

  // Set up file watcher
  setupFileWatcher(context);

  // Initial refresh
  refreshPaths(false);
}

export function deactivate() {
  if (fileWatcher) {
    fileWatcher.dispose();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

function setupFileWatcher(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("uvWorkspacePaths");
  const autoRefresh = config.get<boolean>("autoRefresh", true);

  if (!autoRefresh) {
    return;
  }

  fileWatcher = vscode.workspace.createFileSystemWatcher("**/pyproject.toml");

  const debounceRefresh = debounce(() => refreshPaths(false), 1000);

  fileWatcher.onDidChange(debounceRefresh);
  fileWatcher.onDidCreate(debounceRefresh);
  fileWatcher.onDidDelete(debounceRefresh);

  context.subscriptions.push(fileWatcher);
}

async function refreshPaths(showNotification: boolean) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    updateStatusBar(0, "No workspace");
    return;
  }

  // Find the workspace root (directory containing pyproject.toml with [tool.uv.workspace])
  const firstFolder = workspaceFolders[0].uri.fsPath;
  const workspaceRoot = findWorkspaceRoot(firstFolder);

  if (!workspaceRoot) {
    updateStatusBar(0, "No uv workspace");
    if (showNotification) {
      vscode.window.showWarningMessage(
        "UV Workspace Paths: No uv workspace found (pyproject.toml with [tool.uv.workspace])"
      );
    }
    return;
  }

  // Find the .code-workspace file
  const config = vscode.workspace.getConfiguration("uvWorkspacePaths");
  let workspaceFilePath = config.get<string>("workspaceFile", "");

  if (!workspaceFilePath) {
    workspaceFilePath = (await findWorkspaceFile(workspaceRoot)) ?? "";
  }

  if (!workspaceFilePath) {
    updateStatusBar(0, "No .code-workspace");
    if (showNotification) {
      vscode.window.showWarningMessage(
        "UV Workspace Paths: No .code-workspace file found"
      );
    }
    return;
  }

  // Build dependency graph
  const graph = buildDependencyGraph(workspaceRoot);
  const memberCount = Object.keys(graph).length;

  // Update the workspace file
  try {
    const result = await updateWorkspaceFile(workspaceFilePath, graph);

    updateStatusBar(memberCount, "Active");

    if (showNotification) {
      if (result.updated) {
        vscode.window.showInformationMessage(
          `UV Workspace Paths: Updated ${result.foldersUpdated} folder(s) in workspace file`
        );
      } else {
        vscode.window.showInformationMessage(
          "UV Workspace Paths: Workspace file is already up to date"
        );
      }
    }
  } catch (error) {
    updateStatusBar(0, "Error");
    const message =
      error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(
      `UV Workspace Paths: Failed to update workspace file: ${message}`
    );
  }
}

function updateStatusBar(memberCount: number, status: string) {
  if (memberCount > 0) {
    statusBarItem.text = `$(file-code) UV Paths: ${memberCount}`;
    statusBarItem.tooltip = `UV Workspace Paths: ${memberCount} members with dependencies configured. Click to refresh.`;
  } else {
    statusBarItem.text = `$(file-code) UV Paths: ${status}`;
    statusBarItem.tooltip = `UV Workspace Paths: ${status}. Click to refresh.`;
  }
  statusBarItem.show();
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
