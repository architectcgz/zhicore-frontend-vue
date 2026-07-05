import {
  createPost,
  publishPost,
  saveDraftBody,
  type PublishPostResp,
  type SaveDraftBodyReq,
  type SaveDraftBodyResp,
} from "@/api/post";

import type { EditorServerDraftBaseline } from "./editorDraftSavePayload";

export interface CreateEditorDraftInput {
  title: string;
}

export interface EditorPostWorkflowClient {
  createDraft(input: CreateEditorDraftInput): Promise<EditorServerDraftBaseline>;
  saveDraftBody(
    postId: string,
    input: SaveDraftBodyReq,
  ): Promise<SaveDraftBodyResp>;
  publishDraft(baseline: EditorServerDraftBaseline): Promise<PublishPostResp>;
}

function requirePublishBaseline(
  baseline: EditorServerDraftBaseline,
): { draftBodyId: string; draftBodyHash: string } {
  if (!baseline.baseDraftBodyId || !baseline.baseDraftBodyHash) {
    throw new Error("发布前需要先保存服务端草稿正文");
  }

  return {
    draftBodyId: baseline.baseDraftBodyId,
    draftBodyHash: baseline.baseDraftBodyHash,
  };
}

export function createEditorPostWorkflowClient(): EditorPostWorkflowClient {
  return {
    async createDraft(input) {
      const response = await createPost({
        title: input.title,
      });

      return {
        postId: response.postId,
        basePostVersion: response.postVersion,
      };
    },
    saveDraftBody,
    async publishDraft(baseline) {
      const { draftBodyId, draftBodyHash } = requirePublishBaseline(baseline);

      return publishPost(baseline.postId, {
        basePostVersion: baseline.basePostVersion,
        draftBodyId,
        draftBodyHash,
      });
    },
  };
}
