import { describe, expect, it } from "vitest";

import actionBarSource from "@/components/editor-showcase/EditorActionBar.vue?raw";
import documentViewerSource from "@/components/editor-showcase/EditorDocumentViewerDemo.vue?raw";
import previewPaneSource from "@/components/editor-showcase/EditorPreviewPane.vue?raw";
import writingPaneSource from "@/components/editor-showcase/EditorWritingPane.vue?raw";
import homeOverviewSource from "@/components/home/HomeOverviewWidget.vue?raw";
import appLayoutSource from "@/layouts/AppLayout.vue?raw";
import routePageSource from "@/pages/editor/EditorRoutePage.vue?raw";
import editorRoutesSource from "@/router/routes/editorRoutes.ts?raw";

import compilerIndexSource from "../editorContentCompiler/index.ts?raw";
import featureIndexSource from "../index.ts?raw";
import draftSource from "../useEditorShowcaseDraft.ts?raw";

describe("editor showcase architecture boundaries", () => {
  it("uses the formal editor route as the public workspace entry", () => {
    expect(editorRoutesSource).toContain('path: "/editor"');
    expect(editorRoutesSource).toContain('name: "Editor"');
    expect(editorRoutesSource).not.toContain('path: "/editor-showcase"');
    expect(appLayoutSource).toContain('to="/editor"');
    expect(homeOverviewSource).toContain('to="/editor"');
  });

  it("routes the workspace owner through the feature public API", () => {
    expect(routePageSource).toContain("@/features/editor-showcase");
    expect(routePageSource).not.toContain(
      "@/features/editor-showcase/ui/EditorWorkspace.vue",
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

  it("allows editor pane edge scrolling to continue on the page", () => {
    expect(writingPaneSource).not.toContain("overscroll-behavior: contain");
    expect(previewPaneSource).not.toContain("overscroll-behavior: contain");
  });

  it("keeps ink theme overrides on workspace variables instead of component globals", () => {
    [actionBarSource, previewPaneSource, writingPaneSource].forEach((source) => {
      expect(source).not.toContain(":global(.editor-showcase--ink)");
    });
  });
});
