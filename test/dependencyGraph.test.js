"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const dependencyGraph_js_1 = require("../src/dependencyGraph.js");
(0, vitest_1.describe)("buildDependencyGraph", () => {
    let tempDir;
    (0, vitest_1.beforeEach)(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "uv-workspace-test-"));
    });
    (0, vitest_1.afterEach)(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    function createPyproject(dir, content) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "pyproject.toml"), content);
    }
    (0, vitest_1.it)("builds dependency graph for workspace members", () => {
        // Create root pyproject.toml
        createPyproject(tempDir, `
[tool.uv.workspace]
members = ["lib", "service-a", "service-b"]
`);
        // Create member pyproject.toml files
        createPyproject(path.join(tempDir, "lib"), `
[project]
name = "lib"
dependencies = []
`);
        createPyproject(path.join(tempDir, "service-a"), `
[project]
name = "service-a"
dependencies = ["lib", "requests>=2.0"]
`);
        createPyproject(path.join(tempDir, "service-b"), `
[project]
name = "service-b"
dependencies = ["lib", "service-a"]
`);
        const graph = (0, dependencyGraph_js_1.buildDependencyGraph)(tempDir);
        (0, vitest_1.expect)(graph).toEqual({
            "service-a": ["lib"],
            "service-b": ["lib", "service-a"],
        });
    });
    (0, vitest_1.it)("handles package name different from directory name", () => {
        createPyproject(tempDir, `
[tool.uv.workspace]
members = ["ca-patient-service", "ca-user-service"]
`);
        createPyproject(path.join(tempDir, "ca-patient-service"), `
[project]
name = "patient-service"
dependencies = []
`);
        createPyproject(path.join(tempDir, "ca-user-service"), `
[project]
name = "user-service"
dependencies = ["patient-service"]
`);
        const graph = (0, dependencyGraph_js_1.buildDependencyGraph)(tempDir);
        (0, vitest_1.expect)(graph).toEqual({
            "ca-user-service": ["ca-patient-service"],
        });
    });
    (0, vitest_1.it)("returns empty graph when no workspace config", () => {
        createPyproject(tempDir, `
[project]
name = "simple-project"
`);
        const graph = (0, dependencyGraph_js_1.buildDependencyGraph)(tempDir);
        (0, vitest_1.expect)(graph).toEqual({});
    });
});
(0, vitest_1.describe)("findWorkspaceRoot", () => {
    let tempDir;
    (0, vitest_1.beforeEach)(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "uv-workspace-test-"));
    });
    (0, vitest_1.afterEach)(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });
    (0, vitest_1.it)("finds workspace root from nested directory", () => {
        // Create root pyproject.toml with workspace
        fs.writeFileSync(path.join(tempDir, "pyproject.toml"), `
[tool.uv.workspace]
members = ["service-a"]
`);
        // Create nested directory
        const nestedDir = path.join(tempDir, "service-a", "src");
        fs.mkdirSync(nestedDir, { recursive: true });
        const root = (0, dependencyGraph_js_1.findWorkspaceRoot)(nestedDir);
        (0, vitest_1.expect)(root).toBe(tempDir);
    });
    (0, vitest_1.it)("returns undefined when no workspace found", () => {
        const root = (0, dependencyGraph_js_1.findWorkspaceRoot)(tempDir);
        (0, vitest_1.expect)(root).toBeUndefined();
    });
});
//# sourceMappingURL=dependencyGraph.test.js.map