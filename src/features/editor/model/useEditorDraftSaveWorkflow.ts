import { computed, readonly, ref, type ComputedRef, type Ref } from "vue";

import type { PostBodyWriteInput } from "@/entities/post-body";

import {
  buildSaveDraftBodyPayload,
  type EditorDraftServerSaveClient,
  type EditorServerDraftBaseline,
} from "./editorDraftSavePayload";
import type { EditorSavedDraftSnapshot } from "./editorDraftSnapshot";

export type EditorDraftSaveStatus = "saved" | "dirty" | "saving";

export interface UseEditorDraftSaveWorkflowOptions {
  now: () => Date;
  hasUnsavedChanges: ComputedRef<boolean>;
  getPostBodyWriteInput: () => PostBodyWriteInput;
  createSavedDraftSnapshot: (savedAt: Date) => EditorSavedDraftSnapshot;
  savedDraftSnapshot: Ref<EditorSavedDraftSnapshot>;
  persistCurrentDraftToLocal: (snapshot: EditorSavedDraftSnapshot) => void;
  compilePreviewNow: () => void;
  serverDraftBaseline?: EditorServerDraftBaseline;
  serverSaveClient?: EditorDraftServerSaveClient;
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

  async function saveDraft(): Promise<void> {
    if (!canSaveDraft.value) {
      return;
    }

    isSavingDraft.value = true;

    try {
      options.compilePreviewNow();
      const savedAt = options.now();
      const baseline = serverDraftBaseline.value;

      if (baseline && options.serverSaveClient) {
        const response = await options.serverSaveClient.saveDraftBody(
          baseline.postId,
          buildSaveDraftBodyPayload(
            baseline,
            options.getPostBodyWriteInput(),
            savedAt,
          ),
        );

        // 服务端返回的 draftBodyHash 才是下一次乐观保存基线；本地 hash
        // 只用于前端 dirty 判断，不能混入 Content API 请求。
        serverDraftBaseline.value = {
          postId: response.postId,
          basePostVersion: response.postVersion,
          baseDraftBodyId: response.draftBodyId,
          baseDraftBodyHash: response.draftBodyHash,
        };
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
  };
}
