import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { buildDependencyGraph, findWorkspaceRoot } from "../src/dependencyGraph.js";

describe("buildDependencyGraph", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "uv-workspace-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function createPyproject(dir: string, content: string) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "pyproject.toml"), content);
  }

  it("builds dependency graph for workspace members", () => {
    // Create root pyproject.toml
    createPyproject(
      tempDir,
      `
[tool.uv.workspace]
members = ["lib", "service-a", "service-b"]
`
    );

    // Create member pyproject.toml files
    createPyproject(
      path.join(tempDir, "lib"),
      `
[project]
name = "lib"
dependencies = []
`
    );

    createPyproject(
      path.join(tempDir, "service-a"),
      `
[project]
name = "service-a"
dependencies = ["lib", "requests>=2.0"]
`
    );

    createPyproject(
      path.join(tempDir, "service-b"),
      `
[project]
name = "service-b"
dependencies = ["lib", "service-a"]
`
    );

    const graph = buildDependencyGraph(tempDir);

    expect(graph).toEqual({
      "service-a": ["lib"],
      "service-b": ["lib", "service-a"],
    });
  });

  it("handles package name different from directory name", () => {
    createPyproject(
      tempDir,
      `
[tool.uv.workspace]
members = ["ca-patient-service", "ca-user-service"]
`
    );

    createPyproject(
      path.join(tempDir, "ca-patient-service"),
      `
[project]
name = "patient-service"
dependencies = []
`
    );

    createPyproject(
      path.join(tempDir, "ca-user-service"),
      `
[project]
name = "user-service"
dependencies = ["patient-service"]
`
    );

    const graph = buildDependencyGraph(tempDir);

    expect(graph).toEqual({
      "ca-user-service": ["ca-patient-service"],
    });
  });

  it("returns empty graph when no workspace config", () => {
    createPyproject(
      tempDir,
      `
[project]
name = "simple-project"
`
    );

    const graph = buildDependencyGraph(tempDir);
    expect(graph).toEqual({});
  });
});

describe("findWorkspaceRoot", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "uv-workspace-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("finds workspace root from nested directory", () => {
    // Create root pyproject.toml with workspace
    fs.writeFileSync(
      path.join(tempDir, "pyproject.toml"),
      `
[tool.uv.workspace]
members = ["service-a"]
`
    );

    // Create nested directory
    const nestedDir = path.join(tempDir, "service-a", "src");
    fs.mkdirSync(nestedDir, { recursive: true });

    const root = findWorkspaceRoot(nestedDir);
    expect(root).toBe(tempDir);
  });

  it("returns undefined when no workspace found", () => {
    const root = findWorkspaceRoot(tempDir);
    expect(root).toBeUndefined();
  });
});
