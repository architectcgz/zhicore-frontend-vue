import { describe, expect, it } from "vitest";

import {
  canRedoEditorDraftHistory,
  canUndoEditorDraftHistory,
  createEditorDraftHistory,
  recordEditorDraftHistoryChange,
  redoEditorDraftHistory,
  undoEditorDraftHistory,
} from "../editorDraftHistory";

describe("editorDraftHistory", () => {
  it("starts without undo or redo entries", () => {
    const state = createEditorDraftHistory({
      title: "标题",
      body: "正文",
      activeField: "body",
      selection: { start: 0, end: 0 },
      changedAt: 0,
    });

    expect(canUndoEditorDraftHistory(state)).toBe(false);
    expect(canRedoEditorDraftHistory(state)).toBe(false);
  });

  it("undoes and redoes a body input change", () => {
    const state = createEditorDraftHistory({
      title: "标题",
      body: "正文",
      activeField: "body",
      selection: { start: 0, end: 0 },
      changedAt: 0,
    });

    const changed = recordEditorDraftHistoryChange(
      state,
      {
        title: "标题",
        body: "正文新增",
        activeField: "body",
        selection: { start: 4, end: 4 },
        changedAt: 100,
      },
      { kind: "typing", forceBoundary: true },
    );
    const undone = undoEditorDraftHistory(changed);
    const redone = redoEditorDraftHistory(undone);

    expect(undone.present.body).toBe("正文");
    expect(redone.present.body).toBe("正文新增");
    expect(redone.present.selection).toEqual({ start: 4, end: 4 });
  });

  it("merges continuous typing in the same field within the merge window", () => {
    const state = createEditorDraftHistory({
      title: "标题",
      body: "",
      activeField: "body",
      selection: { start: 0, end: 0 },
      changedAt: 0,
    });

    const firstChange = recordEditorDraftHistoryChange(
      state,
      {
        title: "标题",
        body: "正",
        activeField: "body",
        selection: { start: 1, end: 1 },
        changedAt: 100,
      },
      { kind: "typing", mergeWindowMs: 500 },
    );
    const secondChange = recordEditorDraftHistoryChange(
      firstChange,
      {
        title: "标题",
        body: "正文",
        activeField: "body",
        selection: { start: 2, end: 2 },
        changedAt: 500,
      },
      { kind: "typing", mergeWindowMs: 500 },
    );

    expect(secondChange.past).toHaveLength(1);
    expect(undoEditorDraftHistory(secondChange).present.body).toBe("");
  });

  it("keeps toolbar changes as boundaries and clears redo entries", () => {
    const state = createEditorDraftHistory({
      title: "标题",
      body: "正文",
      activeField: "body",
      selection: { start: 0, end: 2 },
      changedAt: 0,
    });
    const typed = recordEditorDraftHistoryChange(
      state,
      {
        title: "标题",
        body: "正文新增",
        activeField: "body",
        selection: { start: 4, end: 4 },
        changedAt: 100,
      },
      { kind: "typing" },
    );
    const undone = undoEditorDraftHistory(typed);
    const toolbarChanged = recordEditorDraftHistoryChange(
      undone,
      {
        title: "标题",
        body: "**正文**",
        activeField: "body",
        selection: { start: 2, end: 4 },
        changedAt: 200,
      },
      { kind: "toolbar" },
    );

    expect(toolbarChanged.future).toHaveLength(0);
    expect(toolbarChanged.past).toHaveLength(1);
    expect(undoEditorDraftHistory(toolbarChanged).present.body).toBe("正文");
  });

  it("drops the oldest past entries when maxEntries is exceeded", () => {
    const initial = createEditorDraftHistory({
      title: "标题",
      body: "0",
      activeField: "body",
      selection: { start: 1, end: 1 },
      changedAt: 0,
    });

    const first = recordEditorDraftHistoryChange(
      initial,
      {
        title: "标题",
        body: "1",
        activeField: "body",
        selection: { start: 1, end: 1 },
        changedAt: 100,
      },
      { kind: "programmatic", maxEntries: 2 },
    );
    const second = recordEditorDraftHistoryChange(
      first,
      {
        title: "标题",
        body: "2",
        activeField: "body",
        selection: { start: 1, end: 1 },
        changedAt: 200,
      },
      { kind: "programmatic", maxEntries: 2 },
    );
    const third = recordEditorDraftHistoryChange(
      second,
      {
        title: "标题",
        body: "3",
        activeField: "body",
        selection: { start: 1, end: 1 },
        changedAt: 300,
      },
      { kind: "programmatic", maxEntries: 2 },
    );

    expect(third.past.map((snapshot) => snapshot.body)).toEqual(["1", "2"]);
  });
});
