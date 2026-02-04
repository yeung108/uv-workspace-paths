"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pathResolver_js_1 = require("../src/pathResolver.js");
(0, vitest_1.describe)("filterWorkspaceDependencies", () => {
    const packageToPath = new Map([
        ["ca-lib", "ca-lib"],
        ["ca-messaging", "ca-messaging"],
        ["patient-data-service", "ca-patient-data-service"],
        ["ca-user-service", "ca-user-service"],
    ]);
    const extractPackageName = (dep) => {
        return dep.split("[")[0].split(/[<>=!~]/, 1)[0].trim();
    };
    (0, vitest_1.it)("filters to only workspace dependencies", () => {
        const deps = [
            "ca-lib[django]",
            "ca-messaging",
            "requests>=2.0",
            "django>=4.0",
        ];
        const result = (0, pathResolver_js_1.filterWorkspaceDependencies)(deps, packageToPath, extractPackageName);
        (0, vitest_1.expect)(result).toEqual(["ca-lib", "ca-messaging"]);
    });
    (0, vitest_1.it)("maps package names to directory names", () => {
        const deps = ["patient-data-service", "ca-user-service"];
        const result = (0, pathResolver_js_1.filterWorkspaceDependencies)(deps, packageToPath, extractPackageName);
        (0, vitest_1.expect)(result).toEqual(["ca-patient-data-service", "ca-user-service"]);
    });
    (0, vitest_1.it)("removes duplicates", () => {
        const deps = ["ca-lib", "ca-lib[extra1]", "ca-lib[extra2]"];
        const result = (0, pathResolver_js_1.filterWorkspaceDependencies)(deps, packageToPath, extractPackageName);
        (0, vitest_1.expect)(result).toEqual(["ca-lib"]);
    });
    (0, vitest_1.it)("returns empty array when no workspace deps", () => {
        const deps = ["requests", "django", "numpy"];
        const result = (0, pathResolver_js_1.filterWorkspaceDependencies)(deps, packageToPath, extractPackageName);
        (0, vitest_1.expect)(result).toEqual([]);
    });
});
//# sourceMappingURL=pathResolver.test.js.map