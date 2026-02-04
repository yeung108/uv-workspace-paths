"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tomlParser_js_1 = require("../src/tomlParser.js");
(0, vitest_1.describe)("parseWorkspaceMembers", () => {
    (0, vitest_1.it)("parses workspace members from root pyproject.toml", () => {
        const content = `
[tool.uv.workspace]
members = [
    "ca-lib",
    "ca-user-service",
    "ca-visit-service",
]
`;
        const members = (0, tomlParser_js_1.parseWorkspaceMembers)(content);
        (0, vitest_1.expect)(members).toEqual(["ca-lib", "ca-user-service", "ca-visit-service"]);
    });
    (0, vitest_1.it)("returns empty array when no workspace config", () => {
        const content = `
[project]
name = "my-project"
`;
        const members = (0, tomlParser_js_1.parseWorkspaceMembers)(content);
        (0, vitest_1.expect)(members).toEqual([]);
    });
    (0, vitest_1.it)("returns empty array for empty workspace members", () => {
        const content = `
[tool.uv.workspace]
members = []
`;
        const members = (0, tomlParser_js_1.parseWorkspaceMembers)(content);
        (0, vitest_1.expect)(members).toEqual([]);
    });
});
(0, vitest_1.describe)("parseProjectName", () => {
    (0, vitest_1.it)("extracts project name", () => {
        const content = `
[project]
name = "patient-data-service"
version = "1.0.0"
`;
        (0, vitest_1.expect)((0, tomlParser_js_1.parseProjectName)(content)).toBe("patient-data-service");
    });
    (0, vitest_1.it)("returns undefined when no project section", () => {
        const content = `
[tool.uv]
dev-dependencies = []
`;
        (0, vitest_1.expect)((0, tomlParser_js_1.parseProjectName)(content)).toBeUndefined();
    });
});
(0, vitest_1.describe)("parseProjectDependencies", () => {
    (0, vitest_1.it)("extracts dependencies list", () => {
        const content = `
[project]
name = "my-service"
dependencies = [
    "ca-lib[django_grpc,psycopg3]",
    "ca-messaging",
    "requests>=2.0",
]
`;
        const deps = (0, tomlParser_js_1.parseProjectDependencies)(content);
        (0, vitest_1.expect)(deps).toEqual([
            "ca-lib[django_grpc,psycopg3]",
            "ca-messaging",
            "requests>=2.0",
        ]);
    });
    (0, vitest_1.it)("returns empty array when no dependencies", () => {
        const content = `
[project]
name = "my-lib"
`;
        (0, vitest_1.expect)((0, tomlParser_js_1.parseProjectDependencies)(content)).toEqual([]);
    });
});
(0, vitest_1.describe)("extractPackageName", () => {
    (0, vitest_1.it)("extracts plain package name", () => {
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("ca-lib")).toBe("ca-lib");
    });
    (0, vitest_1.it)("removes extras", () => {
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("ca-lib[django_grpc,psycopg3]")).toBe("ca-lib");
    });
    (0, vitest_1.it)("removes version specifiers", () => {
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("requests>=2.0")).toBe("requests");
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("django>=4.0,<5.0")).toBe("django");
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("numpy~=1.21")).toBe("numpy");
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("pandas==2.0.0")).toBe("pandas");
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("scipy!=1.8.0")).toBe("scipy");
    });
    (0, vitest_1.it)("handles combination of extras and version", () => {
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("uvicorn[standard]>=0.20")).toBe("uvicorn");
    });
    (0, vitest_1.it)("trims whitespace", () => {
        (0, vitest_1.expect)((0, tomlParser_js_1.extractPackageName)("  ca-lib  ")).toBe("ca-lib");
    });
});
//# sourceMappingURL=tomlParser.test.js.map