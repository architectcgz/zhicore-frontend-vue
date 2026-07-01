import { describe, expect, it } from "vitest";

import { useEditorShowcaseDisplay } from "../useEditorShowcaseDisplay";

describe("useEditorShowcaseDisplay", () => {
  it("starts in focus mode with the paper background selected", () => {
    const display = useEditorShowcaseDisplay();

    expect(display.activeMode.value).toBe("focus");
    expect(display.isPreviewMode.value).toBe(false);
    expect(display.activeBackground.value.id).toBe("paper");
  });

  it("switches between focus mode and preview mode", () => {
    const display = useEditorShowcaseDisplay();

    display.selectMode("preview");

    expect(display.activeMode.value).toBe("preview");
    expect(display.isPreviewMode.value).toBe(true);

    display.selectMode("focus");

    expect(display.activeMode.value).toBe("focus");
    expect(display.isPreviewMode.value).toBe(false);
  });

  it("keeps background candidates selectable by id", () => {
    const display = useEditorShowcaseDisplay();

    display.selectBackground("sage");

    expect(display.activeBackground.value.id).toBe("sage");
    expect(display.activeBackgroundClass.value).toBe("editor-showcase--sage");
  });
});
