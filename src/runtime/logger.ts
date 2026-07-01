import createDebug from "debug";
import type { Debugger } from "debug";

const appLoggerNamespacePrefix = "zhicore";

export type AppLoggerNamespace = string | readonly string[];

export interface AppLogger {
  namespace: string;
  log: Debugger;
  debug(createArgs: () => [formatter: unknown, ...args: unknown[]]): void;
}

function normalizeLoggerNamespace(namespace: AppLoggerNamespace): string {
  const normalizedNamespace =
    typeof namespace === "string"
      ? namespace.trim()
      : namespace
          .map((part) => part.trim())
          .filter(Boolean)
          .join(":");

  if (!normalizedNamespace) {
    throw new Error("Logger namespace cannot be empty.");
  }

  return normalizedNamespace.startsWith(`${appLoggerNamespacePrefix}:`)
    ? normalizedNamespace
    : `${appLoggerNamespacePrefix}:${normalizedNamespace}`;
}

export function createAppLogger(namespace: AppLoggerNamespace): AppLogger {
  const normalizedNamespace = normalizeLoggerNamespace(namespace);
  const log = createDebug(normalizedNamespace);

  return {
    namespace: normalizedNamespace,
    log,
    debug(createArgs) {
      if (!log.enabled) {
        return;
      }

      log(...createArgs());
    },
  };
}
