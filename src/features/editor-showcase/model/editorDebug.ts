export const isEditorDebugMode =
  import.meta.env.VITE_ZHICORE_EDITOR_DEBUG === "true";

function createEditorDebugLogger() {
  function log(...args: unknown[]): void {
    if (!isEditorDebugMode) {
      return;
    }

    console.debug("[zhicore-editor]", ...args);
  }

  return {
    log,
  };
}

export const editorDebugLogger = createEditorDebugLogger();
