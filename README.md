# UV Workspace Python Paths

A VS Code extension that automatically configures `python.analysis.extraPaths` for [uv workspace](https://docs.astral.sh/uv/concepts/workspaces/) projects.

## Problem

In a uv workspace monorepo, each service may depend on multiple other workspace members. VS Code's Pylance needs `python.analysis.extraPaths` configured to provide accurate type checking and IntelliSense for cross-package imports.

Manually maintaining these paths is tedious and error-prone, especially as dependencies change.

## Solution

This extension:
1. Parses the root `pyproject.toml` to discover workspace members
2. Parses each member's `pyproject.toml` to extract dependencies
3. Automatically updates your `.code-workspace` file with per-folder `extraPaths` settings

## Features

- **Automatic activation**: Activates when workspace contains `pyproject.toml`
- **Auto-refresh**: Watches for changes to `pyproject.toml` files
- **Manual refresh**: Command palette: "UV Workspace: Refresh Python Paths"
- **Status bar**: Shows active state and member count

## Generated Configuration

The extension adds folder-scoped settings to your `.code-workspace` file:

```json
{
  "folders": [...],
  "settings": {
    "[ca-visit-service]": {
      "python.analysis.extraPaths": [
        "${workspaceFolder:ca-lib}",
        "${workspaceFolder:ca-messaging}",
        "${workspaceFolder:ca-user-service}"
      ]
    }
  }
}
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `uvWorkspacePaths.autoRefresh` | `true` | Automatically refresh when pyproject.toml changes |
| `uvWorkspacePaths.workspaceFile` | `""` | Path to .code-workspace file (auto-detected if empty) |

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Run tests
npm test

# Package extension
npx vsce package
```

## Testing Locally Against a uv Workspace

There are several ways to test this extension against a real uv workspace like `ca/`:

### Option 1: VS Code Extension Development Host (Recommended)

1. Open the extension project in VS Code:
   ```bash
   code /path/to/uv-workspace-paths
   ```

2. Press `F5` to launch the Extension Development Host. This opens a new VS Code window with the extension loaded.

3. In the new window, open your uv workspace:
   - `File > Open Workspace from File...`
   - Select `ca/ca-monorepo.code-workspace` (or your equivalent)

4. The extension should activate automatically. Check:
   - Status bar shows "UV Paths: X" (where X is the number of members with dependencies)
   - Run command: `UV Workspace: Refresh Python Paths` from Command Palette (`Cmd+Shift+P`)

5. Verify the `.code-workspace` file was updated with per-folder `extraPaths` settings.

### Option 2: Install VSIX Locally

1. Package the extension:
   ```bash
   cd /path/to/uv-workspace-paths
   npm install
   npm run compile
   npx vsce package
   ```

2. Install the generated `.vsix` file:
   ```bash
   code --install-extension uv-workspace-paths-0.1.0.vsix
   ```

3. Open your uv workspace in VS Code and verify the extension works.

4. To uninstall:
   ```bash
   code --uninstall-extension clover-health.uv-workspace-paths
   ```

### Option 3: Symlink to VS Code Extensions Directory

1. Build the extension:
   ```bash
   cd /path/to/uv-workspace-paths
   npm install
   npm run compile
   ```

2. Symlink to VS Code extensions:
   ```bash
   ln -s /path/to/uv-workspace-paths ~/.vscode/extensions/uv-workspace-paths
   ```

3. Restart VS Code and open your workspace.

4. To remove: delete the symlink.

### Verification Checklist

After testing, verify:

- [ ] Extension activates (check status bar)
- [ ] `UV Workspace: Refresh Python Paths` command works
- [ ] `.code-workspace` file is updated with `[folder-name]` sections
- [ ] Each folder has correct `python.analysis.extraPaths` based on its `pyproject.toml` dependencies
- [ ] Pylance correctly resolves imports from workspace members
- [ ] File watcher triggers refresh when `pyproject.toml` changes

### Example Expected Output

For a service with dependencies like:
```toml
# ca-visit-service/pyproject.toml
[project]
dependencies = [
    "ca-lib[django_grpc,psycopg3]",
    "ca-messaging",
    "clover-fhir",
    "ca-ehr-service",
    "ca-user-service",
]
```

The extension should generate:
```json
"[ca-visit-service]": {
  "python.analysis.extraPaths": [
    "${workspaceFolder:ca-lib}",
    "${workspaceFolder:ca-messaging}",
    "${workspaceFolder:clover-fhir}",
    "${workspaceFolder:ca-ehr-service}",
    "${workspaceFolder:ca-user-service}"
  ]
}
```

## Requirements

- VS Code 1.85.0 or later
- A uv workspace with `pyproject.toml` files

## License

MIT
