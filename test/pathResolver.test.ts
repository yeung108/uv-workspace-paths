import { describe, it, expect } from "vitest";
import { filterWorkspaceDependencies } from "../src/pathResolver.js";

describe("filterWorkspaceDependencies", () => {
  const packageToPath = new Map([
    ["ca-lib", "ca-lib"],
    ["ca-messaging", "ca-messaging"],
    ["patient-data-service", "ca-patient-data-service"],
    ["ca-user-service", "ca-user-service"],
  ]);

  const extractPackageName = (dep: string): string => {
    return dep.split("[")[0].split(/[<>=!~]/, 1)[0].trim();
  };

  it("filters to only workspace dependencies", () => {
    const deps = [
      "ca-lib[django]",
      "ca-messaging",
      "requests>=2.0",
      "django>=4.0",
    ];

    const result = filterWorkspaceDependencies(
      deps,
      packageToPath,
      extractPackageName
    );

    expect(result).toEqual(["ca-lib", "ca-messaging"]);
  });

  it("maps package names to directory names", () => {
    const deps = ["patient-data-service", "ca-user-service"];

    const result = filterWorkspaceDependencies(
      deps,
      packageToPath,
      extractPackageName
    );

    expect(result).toEqual(["ca-patient-data-service", "ca-user-service"]);
  });

  it("removes duplicates", () => {
    const deps = ["ca-lib", "ca-lib[extra1]", "ca-lib[extra2]"];

    const result = filterWorkspaceDependencies(
      deps,
      packageToPath,
      extractPackageName
    );

    expect(result).toEqual(["ca-lib"]);
  });

  it("returns empty array when no workspace deps", () => {
    const deps = ["requests", "django", "numpy"];

    const result = filterWorkspaceDependencies(
      deps,
      packageToPath,
      extractPackageName
    );

    expect(result).toEqual([]);
  });
});
