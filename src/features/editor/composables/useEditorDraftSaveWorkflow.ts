import { computed, readonly, ref, type ComputedRef, type Ref } from "vue";

import type { PostBodyWriteInput } from "@/entities/post-body";

import {
  buildSaveDraftBodyPayload,
  type EditorDraftServerSaveClient,
  type EditorServerDraftBaseline,
} from "../lib/editorDraftSavePayload";
import type { EditorSavedDraftSnapshot } from "../lib/editorDraftSnapshot";
import type { EditorPostWorkflowClient } from "../lib/editorPostWorkflowClient";

export type EditorDraftSaveStatus = "saved" | "dirty" | "saving";

export interface UseEditorDraftSaveWorkflowOptions {
  now: () => Date;
  hasUnsavedChanges: ComputedRef<boolean>;
  getDraftTitle?: () => string;
  getPostBodyWriteInput: () => PostBodyWriteInput;
  createSavedDraftSnapshot: (savedAt: Date) => EditorSavedDraftSnapshot;
  savedDraftSnapshot: Ref<EditorSavedDraftSnapshot>;
  persistCurrentDraftToLocal: (snapshot: EditorSavedDraftSnapshot) => void;
  compilePreviewNow: () => void;
  serverDraftBaseline?: EditorServerDraftBaseline;
  serverSaveClient?: EditorDraftServerSaveClient;
  serverPostClient?: EditorPostWorkflowClient;
  onServerDraftBaselineChange?: (
    baseline: EditorServerDraftBaseline | undefined,
  ) => void;
}

export function useEditorDraftSaveWorkflow(
  options: UseEditorDraftSaveWorkflowOptions,
) {
  const serverDraftBaseline = ref<EditorServerDraftBaseline | undefined>(
    options.serverDraftBaseline,
  );
  const isSavingDraft = ref(false);
  const draftSaveStatus = computed<EditorDraftSaveStatus>(() => {
    if (isSavingDraft.value) {
      return "saving";
    }

    return options.hasUnsavedChanges.value ? "dirty" : "saved";
  });
  const canSaveDraft = computed(
    () => !isSavingDraft.value && options.hasUnsavedChanges.value,
  );

  function commitSavedSnapshot(savedAt: Date): void {
    const nextSavedSnapshot = options.createSavedDraftSnapshot(savedAt);

    options.savedDraftSnapshot.value = nextSavedSnapshot;
    options.persistCurrentDraftToLocal(nextSavedSnapshot);
  }

  function replaceServerDraftBaseline(
    baseline: EditorServerDraftBaseline | undefined,
  ): void {
    serverDraftBaseline.value = baseline;
    options.onServerDraftBaselineChange?.(baseline);
  }

  async function saveCurrentBodyToServer(
    baseline: EditorServerDraftBaseline,
    savedAt: Date,
  ): Promise<EditorServerDraftBaseline> {
    const serverClient = options.serverPostClient ?? options.serverSaveClient;

    if (!serverClient) {
      return baseline;
    }

    const response = await serverClient.saveDraftBody(
      baseline.postId,
      buildSaveDraftBodyPayload(
        baseline,
        options.getPostBodyWriteInput(),
        savedAt,
      ),
    );

    // 服务端返回的 draftBodyHash 才是下一次乐观保存基线；本地 hash
    // 只用于前端 dirty 判断，不能混入 Content API 请求。
    return {
      postId: response.postId,
      basePostVersion: response.postVersion,
      baseDraftBodyId: response.draftBodyId,
      baseDraftBodyHash: response.draftBodyHash,
    };
  }

  async function ensureServerDraft(): Promise<
    EditorServerDraftBaseline | undefined
  > {
    if (!options.serverPostClient) {
      return serverDraftBaseline.value;
    }

    if (
      serverDraftBaseline.value?.baseDraftBodyId &&
      serverDraftBaseline.value.baseDraftBodyHash &&
      !options.hasUnsavedChanges.value
    ) {
      return serverDraftBaseline.value;
    }

    isSavingDraft.value = true;

    try {
      options.compilePreviewNow();
      const savedAt = options.now();
      let baseline = serverDraftBaseline.value;

      if (!baseline) {
        baseline = await options.serverPostClient.createDraft({
          title: options.getDraftTitle?.().trim() ?? "",
        });
        replaceServerDraftBaseline(baseline);
      }

      const nextBaseline = await saveCurrentBodyToServer(baseline, savedAt);
      replaceServerDraftBaseline(nextBaseline);
      commitSavedSnapshot(savedAt);
      return nextBaseline;
    } finally {
      isSavingDraft.value = false;
    }
  }

  async function saveDraft(): Promise<void> {
    if (!canSaveDraft.value) {
      return;
    }

    if (options.serverPostClient) {
      await ensureServerDraft();
      return;
    }

    isSavingDraft.value = true;

    try {
      options.compilePreviewNow();
      const savedAt = options.now();
      const baseline = serverDraftBaseline.value;

      if (baseline && options.serverSaveClient) {
        replaceServerDraftBaseline(
          await saveCurrentBodyToServer(baseline, savedAt),
        );
        commitSavedSnapshot(savedAt);
        return;
      }

      await Promise.resolve();
      commitSavedSnapshot(savedAt);
    } finally {
      isSavingDraft.value = false;
    }
  }

  return {
    serverDraftBaseline: readonly(serverDraftBaseline),
    draftSaveStatus,
    canSaveDraft,
    saveDraft,
    ensureServerDraft,
    replaceServerDraftBaseline,
  };
}
