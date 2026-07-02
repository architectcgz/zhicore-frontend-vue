import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useEditorDisplay } from "../useEditorDisplay";

describe("useEditorDisplay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts in focus mode with the paper background selected", () => {
    const display = useEditorDisplay();

    expect(display.activeMode.value).toBe("focus");
    expect(display.isPreviewMode.value).toBe(false);
    expect(display.activeBackground.value.id).toBe("paper");
  });

  it("switches between focus mode and preview mode", () => {
    const display = useEditorDisplay();

    display.selectMode("preview");

    expect(display.activeMode.value).toBe("preview");
    expect(display.isPreviewMode.value).toBe(true);

    display.selectMode("focus");

    expect(display.activeMode.value).toBe("focus");
    expect(display.isPreviewMode.value).toBe(false);
  });

  it("keeps background candidates selectable by id", () => {
    const display = useEditorDisplay();

    display.selectBackground("sage");

    expect(display.activeBackground.value.id).toBe("sage");
    expect(display.activeBackgroundClass.value).toBe("editor--sage");
  });

  it("persists the selected background as a local display preference", () => {
    const display = useEditorDisplay();

    display.selectBackground("ink");

    const restoredDisplay = useEditorDisplay();
    expect(restoredDisplay.activeBackground.value.id).toBe("ink");
  });
});
