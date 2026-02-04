import { describe, it, expect } from "vitest";
import {
  parseWorkspaceMembers,
  parseProjectName,
  parseProjectDependencies,
  extractPackageName,
} from "../src/tomlParser.js";

describe("parseWorkspaceMembers", () => {
  it("parses workspace members from root pyproject.toml", () => {
    const content = `
[tool.uv.workspace]
members = [
    "ca-lib",
    "ca-user-service",
    "ca-visit-service",
]
`;
    const members = parseWorkspaceMembers(content);
    expect(members).toEqual(["ca-lib", "ca-user-service", "ca-visit-service"]);
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
    "ca-lib[django_grpc,psycopg3]",
    "ca-messaging",
    "requests>=2.0",
]
`;
    const deps = parseProjectDependencies(content);
    expect(deps).toEqual([
      "ca-lib[django_grpc,psycopg3]",
      "ca-messaging",
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
    expect(extractPackageName("ca-lib")).toBe("ca-lib");
  });

  it("removes extras", () => {
    expect(extractPackageName("ca-lib[django_grpc,psycopg3]")).toBe("ca-lib");
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
    expect(extractPackageName("  ca-lib  ")).toBe("ca-lib");
  });
});
