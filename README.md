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

## Requirements

- VS Code 1.85.0 or later
- A uv workspace with `pyproject.toml` files

## License

MIT
