import type { SaveDraftBodyReq, SaveDraftBodyResp } from "@/api/post";
import type { PostBodyWriteInput } from "@/entities/post-body";

export interface EditorServerDraftBaseline {
  postId: string;
  basePostVersion: number;
  baseDraftBodyId?: string;
  baseDraftBodyHash?: string;
}

export interface EditorDraftServerSaveClient {
  saveDraftBody(
    postId: string,
    input: SaveDraftBodyReq,
  ): Promise<SaveDraftBodyResp>;
}

function isServerDraftBodyHash(hash: string | undefined): hash is string {
  return Boolean(hash && !hash.startsWith("local:"));
}

export function createEditorDraftSaveRequest(
  baseline: EditorServerDraftBaseline,
  writeInput: PostBodyWriteInput,
  clientSavedAt: Date,
): SaveDraftBodyReq {
  return {
    ...writeInput,
    basePostVersion: baseline.basePostVersion,
    ...(baseline.baseDraftBodyId
      ? { baseDraftBodyId: baseline.baseDraftBodyId }
      : {}),
    ...(isServerDraftBodyHash(baseline.baseDraftBodyHash)
      ? { baseDraftBodyHash: baseline.baseDraftBodyHash }
      : {}),
    clientSavedAt: clientSavedAt.toISOString(),
  };
}
