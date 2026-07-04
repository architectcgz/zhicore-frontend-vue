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
            violations.push(`${relativeToSrc(filePath, srcRoot)} -> ${specifier}`);
          }
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

function isProviderApiImport(specifier: string, fromFile: string, apiRoot: string): boolean {
  if (specifier === "@/api" || specifier.startsWith("@/api/")) {
    return true;
  }
  if (!specifier.startsWith(".")) {
    return false;
  }

  const resolved = normalize(resolve(dirname(fromFile), specifier));
  return resolved === apiRoot || resolved.startsWith(`${apiRoot}/`);
}

function relativeToSrc(filePath: string, srcRoot: string): string {
  return normalize(filePath).replace(`${normalize(srcRoot)}/`, "src/");
}
