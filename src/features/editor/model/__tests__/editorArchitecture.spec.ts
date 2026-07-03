import { describe, expect, it } from "vitest";

import documentViewerSource from "@/components/editor/EditorDocumentViewer.vue?raw";
import previewPaneSource from "@/components/editor/EditorPreviewPane.vue?raw";
import writingPaneSource from "@/components/editor/EditorWritingPane.vue?raw";
import homeOverviewSource from "@/components/home/HomeOverviewWidget.vue?raw";
import appLayoutSource from "@/layouts/AppLayout.vue?raw";
import routePageSource from "@/pages/editor/EditorRoutePage.vue?raw";
import editorRoutesSource from "@/router/routes/editorRoutes.ts?raw";

import featureIndexSource from "../index.ts?raw";
import controllerSource from "../useEditorWorkspaceController.ts?raw";
import draftSource from "../useEditorDraft.ts?raw";
import proseMirrorEngineSource from "../editorProseMirrorEngine.ts?raw";
import desktopWorkspaceSource from "../../ui/EditorDesktopWorkspace.vue?raw";
import mobileWorkspaceSource from "../../ui/EditorMobileWorkspace.vue?raw";
import workspaceSource from "../../ui/EditorWorkspace.vue?raw";

describe("editor architecture boundaries", () => {
  it("uses the formal editor route as the public workspace entry", () => {
    expect(editorRoutesSource).toContain('path: "/editor"');
    expect(editorRoutesSource).toContain('name: "Editor"');
    expect(appLayoutSource).toContain('to="/editor"');
    expect(homeOverviewSource).toContain('to="/editor"');
  });

  it("keeps the document viewer route formally named", () => {
    expect(editorRoutesSource).toContain('path: "/editor-document"');
    expect(editorRoutesSource).toContain('name: "EditorDocument"');
    expect(editorRoutesSource).toContain("EditorDocumentRoutePage.vue");
    expect(documentViewerSource).not.toContain("document-demo");
    expect(documentViewerSource).not.toContain("Demo");
  });

  it("routes the workspace owner through the feature public API", () => {
    expect(routePageSource).toContain("@/features/editor");
    expect(routePageSource).not.toContain(
      "@/features/editor/ui/EditorWorkspace.vue",
    );
  });

  it("keeps desktop and mobile editor shells behind the same route workspace", () => {
    expect(workspaceSource).toContain("EditorDesktopWorkspace");
    expect(workspaceSource).toContain("EditorMobileWorkspace");
    expect(editorRoutesSource).not.toContain('path: "/editor-mobile"');
  });

  it("keeps workflow owner composables out of editor render components", () => {
    [
      documentViewerSource,
      previewPaneSource,
      writingPaneSource,
      desktopWorkspaceSource,
      mobileWorkspaceSource,
    ].forEach((source) => {
      expect(source).not.toMatch(
        /useEditor(?:Draft|Display|PreviewScrollSync)/,
      );
    });
  });

  it("does not expose the unowned HTML compiler path from public editor APIs", () => {
    expect(featureIndexSource).not.toContain("compileEditorBlocksToHtml");
    expect(draftSource).not.toContain("compiledHtml");
  });

  it("keeps the formal editor runtime on ProseMirror instead of markdown-like source transforms", () => {
    expect(featureIndexSource).not.toContain("editorContentAdapter");
    expect(featureIndexSource).not.toContain("editorContentCompiler");
    expect(featureIndexSource).not.toContain("editorValidationPathMapper");
    expect(draftSource).not.toContain("compileEditorContent");
    expect(draftSource).not.toContain("mapEditorCompiledDocument");
    expect(draftSource).not.toContain("compiledDocument");
    expect(draftSource).not.toContain("draftBlocks");
    expect(draftSource).not.toContain("updateBody(nextBody");
    expect(proseMirrorEngineSource).not.toContain(
      "createProseMirrorDocFromSource",
    );
    expect(proseMirrorEngineSource).not.toContain(
      "serializeProseMirrorDocToSource",
    );
    expect(proseMirrorEngineSource).not.toContain(
      "mapSourceSelectionToProseMirrorSelection",
    );
    expect(controllerSource).not.toContain("applyToolbarActionToBody");
    expect(writingPaneSource).not.toContain("applyToolbarActionToBody");
    expect(featureIndexSource).not.toContain("editorToolbarTransforms");
  });

  it("keeps the writing pane as a thin view over extracted editor behavior", () => {
    expect(writingPaneSource.split("\n").length).toBeLessThan(520);
    expect(writingPaneSource).not.toContain("createBodyToolbarCommands");
    expect(writingPaneSource).not.toContain("replaceSelectionWithTable");
  });

  it("allows editor pane edge scrolling to continue on the page", () => {
    expect(writingPaneSource).not.toContain("overscroll-behavior: contain");
    expect(previewPaneSource).not.toContain("overscroll-behavior: contain");
  });

  it("keeps ink theme overrides on workspace variables instead of component globals", () => {
    [previewPaneSource, writingPaneSource].forEach((source) => {
      expect(source).not.toContain(":global(.editor--ink)");
    });
  });

  it("keeps editor background themes from overriding the full page background", () => {
    const backgroundThemeBlocks =
      workspaceSource.match(
        /\.editor--(?:paper|sage|sand|ink)\s*\{[\s\S]*?\n\}/g,
      ) ?? [];

    expect(backgroundThemeBlocks).toHaveLength(4);
    backgroundThemeBlocks.forEach((source) => {
      expect(source).not.toContain("--editor-page-bg");
    });
  });

  it("scopes editor background themes to the editor frame instead of the page heading", () => {
    expect(workspaceSource).toContain(
      "<section :class=\"['editor-frame', activeBackgroundClass]\">",
    );
    expect(workspaceSource).not.toContain(
      "<section :class=\"['editor-workspace', activeBackgroundClass]\">",
    );
  });
});
