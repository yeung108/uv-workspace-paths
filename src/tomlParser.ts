/** @format */

import { parse } from "smol-toml";
import type { PyProjectToml } from "./types.js";

export function parsePyProjectToml(content: string): PyProjectToml {
  return parse(content) as PyProjectToml;
}

export function parseWorkspaceMembers(content: string): string[] {
  const parsed = parsePyProjectToml(content);
  return parsed.tool?.uv?.workspace?.members ?? [];
}

export function parseProjectName(content: string): string | undefined {
  const parsed = parsePyProjectToml(content);
  return parsed.project?.name;
}

export function parseProjectDependencies(content: string): string[] {
  const parsed = parsePyProjectToml(content);
  return parsed.project?.dependencies ?? [];
}

/**
 * Extract the base package name from a dependency string.
 * Handles extras like "internal-package-1[django_grpc]" -> "internal-package-1"
 * Handles version specs like "requests>=2.0" -> "requests"
 */
export function extractPackageName(dependency: string): string {
  // Remove extras: "internal-package-1[django_grpc]" -> "internal-package-1"
  let name = dependency.split("[")[0];

  // Remove version specifiers: "requests>=2.0" -> "requests"
  name = name.split(/[<>=!~]/, 1)[0];

  // Remove any whitespace
  return name.trim();
}
