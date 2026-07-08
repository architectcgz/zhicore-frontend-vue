/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const checkedRoots = ["pages", "components", "layouts"];
const sourceExtensions = new Set([".ts", ".tsx", ".vue"]);
const importPattern =
  /(?:import\s+(?:type\s+)?[\s\S]*?\s+from\s+|export\s+[\s\S]*?\s+from\s+|import\s*\()\s*["']([^"']+)["']/g;

describe("api boundary", () => {
  it("keeps pages, components and layouts from importing provider API adapters directly", () => {
    const srcRoot = resolve(process.cwd(), "src");
    const apiRoot = normalize(join(srcRoot, "api"));
    const violations: string[] = [];

    for (const root of checkedRoots) {
      const absoluteRoot = join(srcRoot, root);
      if (!existsSync(absoluteRoot)) continue;

      for (const filePath of collectSourceFiles(absoluteRoot)) {
        const source = readFileSync(filePath, "utf8");
        for (const specifier of importSpecifiers(source)) {
          if (isProviderApiImport(specifier, filePath, apiRoot)) {
            violations.push(
              `${relativeToSrc(filePath, srcRoot)} -> ${specifier}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps local mock API fixtures owned by the API adapter layer", () => {
    const srcRoot = resolve(process.cwd(), "src");
    const apiRoot = normalize(join(srcRoot, "api"));
    const mockApiRoot = normalize(join(apiRoot, "mock"));
    const violations: string[] = [];

    for (const filePath of collectSourceFiles(srcRoot)) {
      if (isInsidePath(filePath, apiRoot)) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");
      for (const specifier of importSpecifiers(source)) {
        if (isApiMockImport(specifier, filePath, mockApiRoot)) {
          violations.push(
            `${relativeToSrc(filePath, srcRoot)} -> ${specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

function collectSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === "__tests__") {
        continue;
      }
      files.push(...collectSourceFiles(path));
      continue;
    }
    if (sourceExtensions.has(extname(path))) {
      files.push(path);
    }
  }
  return files;
}

function importSpecifiers(source: string): string[] {
  return [...source.matchAll(importPattern)].map((match) => match[1]);
}

function isProviderApiImport(
  specifier: string,
  fromFile: string,
  apiRoot: string,
): boolean {
  if (specifier === "@/api" || specifier.startsWith("@/api/")) {
    return true;
  }
  if (!specifier.startsWith(".")) {
    return false;
  }

  const resolved = normalize(resolve(dirname(fromFile), specifier));
  return resolved === apiRoot || resolved.startsWith(`${apiRoot}/`);
}

function isApiMockImport(
  specifier: string,
  fromFile: string,
  mockApiRoot: string,
): boolean {
  if (specifier === "@/api/mock" || specifier.startsWith("@/api/mock/")) {
    return true;
  }
  if (!specifier.startsWith(".")) {
    return false;
  }

  const resolved = normalize(resolve(dirname(fromFile), specifier));
  return resolved === mockApiRoot || resolved.startsWith(`${mockApiRoot}/`);
}

function isInsidePath(filePath: string, root: string): boolean {
  const normalizedFilePath = normalize(filePath);
  const normalizedRoot = normalize(root);
  return (
    normalizedFilePath === normalizedRoot ||
    normalizedFilePath.startsWith(`${normalizedRoot}/`)
  );
}

function relativeToSrc(filePath: string, srcRoot: string): string {
  return normalize(filePath).replace(`${normalize(srcRoot)}/`, "src/");
}
