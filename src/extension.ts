import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { parseWorkspaceMembers } from "./tomlParser.js";

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

  // Only watch root pyproject.toml for workspace member changes
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

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const pyprojectPath = path.join(workspaceRoot, "pyproject.toml");

  // Check if root pyproject.toml exists
  if (!fs.existsSync(pyprojectPath)) {
    updateStatusBar(0, "No pyproject.toml");
    return;
  }

  // Parse workspace members
  let members: string[];
  try {
    const content = fs.readFileSync(pyprojectPath, "utf-8");
    members = parseWorkspaceMembers(content);
  } catch (error) {
    updateStatusBar(0, "Parse error");
    if (showNotification) {
      const message = error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(
        `UV Workspace Paths: Failed to parse pyproject.toml: ${message}`
      );
    }
    return;
  }

  if (members.length === 0) {
    updateStatusBar(0, "No uv workspace");
    if (showNotification) {
      vscode.window.showWarningMessage(
        "UV Workspace Paths: No [tool.uv.workspace] members found"
      );
    }
    return;
  }

  // Set extraPaths to all member directories
  const extraPaths = members.map((m) => path.join(workspaceRoot, m));

  try {
    const config = vscode.workspace.getConfiguration("python.analysis");
    const currentPaths = config.get<string[]>("extraPaths") ?? [];

    // Check if update is needed
    const needsUpdate =
      currentPaths.length !== extraPaths.length ||
      !extraPaths.every((p) => currentPaths.includes(p));

    if (needsUpdate) {
      await config.update(
        "extraPaths",
        extraPaths,
        vscode.ConfigurationTarget.Workspace
      );

      updateStatusBar(members.length, "Active");

      if (showNotification) {
        vscode.window.showInformationMessage(
          `UV Workspace Paths: Configured ${members.length} paths for Python analysis`
        );
      }
    } else {
      updateStatusBar(members.length, "Active");

      if (showNotification) {
        vscode.window.showInformationMessage(
          "UV Workspace Paths: Already up to date"
        );
      }
    }
  } catch (error) {
    updateStatusBar(0, "Error");
    const message = error instanceof Error ? error.message : "Unknown error";
    vscode.window.showErrorMessage(
      `UV Workspace Paths: Failed to update settings: ${message}`
    );
  }
}

function updateStatusBar(memberCount: number, status: string) {
  if (memberCount > 0) {
    statusBarItem.text = `$(file-code) UV Paths: ${memberCount}`;
    statusBarItem.tooltip = `UV Workspace Paths: ${memberCount} workspace members configured. Click to refresh.`;
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
