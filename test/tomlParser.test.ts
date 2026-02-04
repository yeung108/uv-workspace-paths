/** @format */

import { describe, expect, it } from "vitest";
import {
  extractPackageName,
  parseProjectDependencies,
  parseProjectName,
  parseWorkspaceMembers,
} from "../src/tomlParser.js";

describe("parseWorkspaceMembers", () => {
  it("parses workspace members from root pyproject.toml", () => {
    const content = `
[tool.uv.workspace]
members = [
    "internal-package-1",
    "internal-package-2",
    "internal-package-3",
]
`;
    const members = parseWorkspaceMembers(content);
    expect(members).toEqual([
      "internal-package-1",
      "internal-package-2",
      "internal-package-3",
    ]);
  });

  it("returns empty array when no workspace config", () => {
    const content = `
[project]
name = "my-project"
`;
    const members = parseWorkspaceMembers(content);
    expect(members).toEqual([]);
  });

  it("returns empty array for empty workspace members", () => {
    const content = `
[tool.uv.workspace]
members = []
`;
    const members = parseWorkspaceMembers(content);
    expect(members).toEqual([]);
  });
});

describe("parseProjectName", () => {
  it("extracts project name", () => {
    const content = `
[project]
name = "patient-data-service"
version = "1.0.0"
`;
    expect(parseProjectName(content)).toBe("patient-data-service");
  });

  it("returns undefined when no project section", () => {
    const content = `
[tool.uv]
dev-dependencies = []
`;
    expect(parseProjectName(content)).toBeUndefined();
  });
});

describe("parseProjectDependencies", () => {
  it("extracts dependencies list", () => {
    const content = `
[project]
name = "my-service"
dependencies = [
    "internal-package-1[django_grpc,psycopg3]",
    "internal-package-2",
    "requests>=2.0",
]
`;
    const deps = parseProjectDependencies(content);
    expect(deps).toEqual([
      "internal-package-1[django_grpc,psycopg3]",
      "internal-package-2",
      "requests>=2.0",
    ]);
  });

  it("returns empty array when no dependencies", () => {
    const content = `
[project]
name = "my-lib"
`;
    expect(parseProjectDependencies(content)).toEqual([]);
  });
});

describe("extractPackageName", () => {
  it("extracts plain package name", () => {
    expect(extractPackageName("internal-package-1")).toBe("internal-package-1");
  });

  it("removes extras", () => {
    expect(extractPackageName("internal-package-1[django_grpc,psycopg3]")).toBe(
      "internal-package-1",
    );
  });

  it("removes version specifiers", () => {
    expect(extractPackageName("requests>=2.0")).toBe("requests");
    expect(extractPackageName("django>=4.0,<5.0")).toBe("django");
    expect(extractPackageName("numpy~=1.21")).toBe("numpy");
    expect(extractPackageName("pandas==2.0.0")).toBe("pandas");
    expect(extractPackageName("scipy!=1.8.0")).toBe("scipy");
  });

  it("handles combination of extras and version", () => {
    expect(extractPackageName("uvicorn[standard]>=0.20")).toBe("uvicorn");
  });

  it("trims whitespace", () => {
    expect(extractPackageName("  internal-package-1  ")).toBe(
      "internal-package-1",
    );
  });
});
