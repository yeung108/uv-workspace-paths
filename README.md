# UV Workspace Python Paths

A VS Code extension that automatically configures `python.analysis.extraPaths` for [uv workspace](https://docs.astral.sh/uv/concepts/workspaces/) projects.

## Problem

In a uv workspace monorepo, Pylance can't resolve cross-package imports without `python.analysis.extraPaths` configured. Manually maintaining these paths is tedious.

## Solution

Just open your uv workspace folder in VS Code. The extension automatically:
1. Detects `[tool.uv.workspace]` in your root `pyproject.toml`
2. Extracts all workspace member directories
3. Configures `python.analysis.extraPaths` with all members

**No manual configuration needed.**

## Features

- **Automatic activation**: Activates when workspace contains `pyproject.toml`
- **Auto-refresh**: Watches for changes to `pyproject.toml`
- **Manual refresh**: Command palette: "UV Workspace: Refresh Python Paths"
- **Status bar**: Shows active state and member count

## Generated Configuration

The extension writes to `.vscode/settings.json`:

```json
{
  "python.analysis.extraPaths": [
    "/path/to/workspace/internal-package-1",
    "/path/to/workspace/internal-package-2",
    "/path/to/workspace/internal-package-3",
    ...
  ]
}
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `uvWorkspacePaths.autoRefresh` | `true` | Automatically refresh when pyproject.toml changes |

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
```

## Testing Locally

1. Open the extension in VS Code:
   ```bash
   code /path/to/uv-workspace-paths
   ```

2. Press `F5` to launch Extension Development Host

3. In the new window, open your uv workspace folder

4. Verify:
   - Status bar shows "UV Paths: X" (member count)
   - `.vscode/settings.json` contains `python.analysis.extraPaths`
   - Pylance resolves cross-package imports

## Requirements

- VS Code 1.85.0 or later
- A uv workspace with `pyproject.toml` containing `[tool.uv.workspace]`

## License

MIT
