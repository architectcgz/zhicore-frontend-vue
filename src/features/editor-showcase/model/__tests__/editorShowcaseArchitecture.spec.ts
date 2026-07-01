import { describe, expect, it } from "vitest";

import actionBarSource from "@/components/editor-showcase/EditorActionBar.vue?raw";
import documentViewerSource from "@/components/editor-showcase/EditorDocumentViewerDemo.vue?raw";
import previewPaneSource from "@/components/editor-showcase/EditorPreviewPane.vue?raw";
import writingPaneSource from "@/components/editor-showcase/EditorWritingPane.vue?raw";
import routePageSource from "@/pages/editor/EditorShowcaseRoutePage.vue?raw";

import compilerIndexSource from "../editorContentCompiler/index.ts?raw";
import featureIndexSource from "../index.ts?raw";
import draftSource from "../useEditorShowcaseDraft.ts?raw";

describe("editor showcase architecture boundaries", () => {
  it("routes the workspace owner through the feature public API", () => {
    expect(routePageSource).toContain("@/features/editor-showcase");
    expect(routePageSource).not.toContain(
      "@/components/editor-showcase/EditorWorkspaceDemo.vue",
    );
  });

  it("keeps workflow owner composables out of editor showcase render components", () => {
    [
      actionBarSource,
      documentViewerSource,
      previewPaneSource,
      writingPaneSource,
    ].forEach((source) => {
      expect(source).not.toMatch(
        /useEditor(?:ShowcaseDraft|ShowcaseDisplay|PreviewScrollSync)/,
      );
    });
  });

  it("does not expose the unowned HTML compiler path from public editor APIs", () => {
    expect(featureIndexSource).not.toContain("compileEditorBlocksToHtml");
    expect(compilerIndexSource).not.toContain("compileEditorBlocksToHtml");
    expect(draftSource).not.toContain("compiledHtml");
  });
});
