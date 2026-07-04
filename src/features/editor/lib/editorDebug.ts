import { createAppLogger, type AppLogger } from "@/runtime/logger";

export const isEditorDebugMode =
  import.meta.env.VITE_ZHICORE_EDITOR_DEBUG === "true";

export type EditorLoggerNamespace =
  "compiler" | "scroll" | "toolbar" | "workspace";

export type EditorDebugNamespace = EditorLoggerNamespace;
export type EditorDebugLogger = AppLogger;

export function createEditorLogger(
  namespace: EditorLoggerNamespace,
): EditorDebugLogger {
  return createAppLogger(["editor", namespace]);
}

export const createEditorDebugLogger = createEditorLogger;
