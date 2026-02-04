import * as fs from "fs";
import * as path from "path";
import type { DependencyGraph } from "./types.js";
import {
  parseWorkspaceMembers,
  parseProjectDependencies,
  extractPackageName,
} from "./tomlParser.js";
import {
  buildPackageToPathMap,
  filterWorkspaceDependencies,
} from "./pathResolver.js";

/**
 * Build a dependency graph for all workspace members.
 * Returns a map of folder name -> list of workspace member folder names it depends on.
 */
export function buildDependencyGraph(workspaceRoot: string): DependencyGraph {
  // Read workspace members from root pyproject.toml
  const rootPyprojectPath = path.join(workspaceRoot, "pyproject.toml");
  let members: string[];

  try {
    const rootContent = fs.readFileSync(rootPyprojectPath, "utf-8");
    members = parseWorkspaceMembers(rootContent);
  } catch {
    // No root pyproject.toml or can't read it
    return {};
  }

  if (members.length === 0) {
    return {};
  }

  // Build package name -> directory mapping
  const packageToPath = buildPackageToPathMap(workspaceRoot, members);

  // Build dependency graph
  const graph: DependencyGraph = {};

  for (const member of members) {
    const memberPyprojectPath = path.join(
      workspaceRoot,
      member,
      "pyproject.toml"
    );

    try {
      const content = fs.readFileSync(memberPyprojectPath, "utf-8");
      const dependencies = parseProjectDependencies(content);

      const workspaceDeps = filterWorkspaceDependencies(
        dependencies,
        packageToPath,
        extractPackageName
      );

      // Don't include self-references
      const filteredDeps = workspaceDeps.filter((dep) => dep !== member);

      if (filteredDeps.length > 0) {
        graph[member] = filteredDeps;
      }
    } catch {
      // Skip members we can't read
      continue;
    }
  }

  return graph;
}

/**
 * Find the workspace root by looking for a pyproject.toml with [tool.uv.workspace].
 */
export function findWorkspaceRoot(startPath: string): string | undefined {
  let current = startPath;

  while (current !== path.dirname(current)) {
    const pyprojectPath = path.join(current, "pyproject.toml");

    try {
      const content = fs.readFileSync(pyprojectPath, "utf-8");
      const members = parseWorkspaceMembers(content);

      if (members.length > 0) {
        return current;
      }
    } catch {
      // Continue searching
    }

    current = path.dirname(current);
  }

  return undefined;
}
