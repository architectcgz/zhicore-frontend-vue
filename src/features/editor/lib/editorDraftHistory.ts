import type { EditorTextSelection } from "./editorToolbarTypes";
import type { EditorTiptapDocumentJson } from "../tiptap/editorTiptapEngine";

export type EditorDraftHistoryField = "title" | "body";
export type EditorDraftHistoryChangeKind =
  "typing" | "toolbar" | "programmatic";

export interface EditorDraftHistorySnapshot {
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  activeField: EditorDraftHistoryField;
  selection?: EditorTextSelection;
  changedAt: number;
}

export interface EditorDraftHistoryState {
  past: EditorDraftHistorySnapshot[];
  present: EditorDraftHistorySnapshot;
  future: EditorDraftHistorySnapshot[];
  lastChangeKind?: EditorDraftHistoryChangeKind;
}

export interface RecordEditorDraftHistoryChangeOptions {
  kind?: EditorDraftHistoryChangeKind;
  forceBoundary?: boolean;
  mergeWindowMs?: number;
  maxEntries?: number;
}

const defaultHistoryMaxEntries = 100;
const defaultTypingMergeWindowMs = 500;

function areSnapshotsEquivalent(
  left: EditorDraftHistorySnapshot,
  right: EditorDraftHistorySnapshot,
): boolean {
  return (
    left.title === right.title &&
    JSON.stringify(left.bodyDocumentJson) ===
      JSON.stringify(right.bodyDocumentJson) &&
    left.activeField === right.activeField &&
    left.selection?.start === right.selection?.start &&
    left.selection?.end === right.selection?.end
  );
}

function trimPastEntries(
  past: EditorDraftHistorySnapshot[],
  maxEntries = defaultHistoryMaxEntries,
): EditorDraftHistorySnapshot[] {
  if (past.length <= maxEntries) {
    return past;
  }

  return past.slice(past.length - maxEntries);
}

function shouldMergeChange(
  state: EditorDraftHistoryState,
  nextSnapshot: EditorDraftHistorySnapshot,
  options: RecordEditorDraftHistoryChangeOptions,
): boolean {
  const kind = options.kind ?? "programmatic";
  const mergeWindowMs = options.mergeWindowMs ?? defaultTypingMergeWindowMs;
  const changedAtDelta = nextSnapshot.changedAt - state.present.changedAt;

  return (
    kind === "typing" &&
    state.lastChangeKind === "typing" &&
    state.present.activeField === nextSnapshot.activeField &&
    !options.forceBoundary &&
    changedAtDelta >= 0 &&
    changedAtDelta <= mergeWindowMs
  );
}

export function createEditorDraftHistory(
  initialSnapshot: EditorDraftHistorySnapshot,
): EditorDraftHistoryState {
  return {
    past: [],
    present: initialSnapshot,
    future: [],
  };
}

export function canUndoEditorDraftHistory(
  state: EditorDraftHistoryState,
): boolean {
  return state.past.length > 0;
}

export function canRedoEditorDraftHistory(
  state: EditorDraftHistoryState,
): boolean {
  return state.future.length > 0;
}

export function recordEditorDraftHistoryChange(
  state: EditorDraftHistoryState,
  nextSnapshot: EditorDraftHistorySnapshot,
  options: RecordEditorDraftHistoryChangeOptions = {},
): EditorDraftHistoryState {
  const kind = options.kind ?? "programmatic";

  if (areSnapshotsEquivalent(state.present, nextSnapshot)) {
    return {
      ...state,
      present: nextSnapshot,
      lastChangeKind: kind,
    };
  }

  if (shouldMergeChange(state, nextSnapshot, options)) {
    return {
      past: state.past,
      present: nextSnapshot,
      future: [],
      lastChangeKind: kind,
    };
  }

  return {
    past: trimPastEntries([...state.past, state.present], options.maxEntries),
    present: nextSnapshot,
    future: [],
    lastChangeKind: kind,
  };
}

export function undoEditorDraftHistory(
  state: EditorDraftHistoryState,
): EditorDraftHistoryState {
  if (!canUndoEditorDraftHistory(state)) {
    return state;
  }

  const present = state.past[state.past.length - 1];

  return {
    past: state.past.slice(0, -1),
    present,
    future: [state.present, ...state.future],
    lastChangeKind: "programmatic",
  };
}

export function redoEditorDraftHistory(
  state: EditorDraftHistoryState,
): EditorDraftHistoryState {
  if (!canRedoEditorDraftHistory(state)) {
    return state;
  }

  const [present, ...future] = state.future;

  return {
    past: [...state.past, state.present],
    present,
    future,
    lastChangeKind: "programmatic",
  };
}
