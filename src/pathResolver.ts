import * as fs from "fs";
import * as path from "path";
import { parseProjectName } from "./tomlParser.js";

/**
 * Build a mapping from package names to their directory paths.
 * This handles cases where package name differs from directory name.
 * e.g., "patient-data-service" -> "/path/to/ca-patient-data-service"
 */
export function buildPackageToPathMap(
  workspaceRoot: string,
  members: string[]
): Map<string, string> {
  const map = new Map<string, string>();

  for (const member of members) {
    const pyprojectPath = path.join(workspaceRoot, member, "pyproject.toml");

    try {
      const content = fs.readFileSync(pyprojectPath, "utf-8");
      const packageName = parseProjectName(content) ?? member;

      // Map package name to member directory name (not full path)
      map.set(packageName, member);

      // Also map the directory name itself in case it's used directly
      if (packageName !== member) {
        map.set(member, member);
      }
    } catch {
      // If we can't read the file, just map the member to itself
      map.set(member, member);
    }
  }

  return map;
}

/**
 * Given a list of dependencies, filter to only those that are workspace members.
 * Returns the directory names (not package names) for use in extraPaths.
 */
export function filterWorkspaceDependencies(
  dependencies: string[],
  packageToPath: Map<string, string>,
  extractPackageName: (dep: string) => string
): string[] {
  const result: string[] = [];

  for (const dep of dependencies) {
    const packageName = extractPackageName(dep);
    const memberDir = packageToPath.get(packageName);

    if (memberDir !== undefined) {
      result.push(memberDir);
    }
  }

  return [...new Set(result)]; // Remove duplicates
}
