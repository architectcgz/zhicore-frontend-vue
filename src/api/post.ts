import type { PostBodyWriteInput } from "@/entities/post-body";

import { getAxiosInstance } from "./request";

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  traceId?: string;
}

export interface SaveDraftBodyReq extends PostBodyWriteInput {
  basePostVersion: number;
  baseDraftBodyId?: string;
  baseDraftBodyHash?: string;
  clientSavedAt?: string;
}

export interface SaveDraftBodyResp {
  postId: string;
  postVersion: number;
  draftBodyId: string;
  draftBodyHash: string;
  savedAt: string;
  wordCount: number;
}

export async function saveDraftBody(
  postId: string,
  input: SaveDraftBodyReq,
): Promise<SaveDraftBodyResp> {
  const response = await getAxiosInstance().put<ApiEnvelope<SaveDraftBodyResp>>(
    `/v1/posts/${postId}/draft/body`,
    input,
  );

  return response.data.data;
}
