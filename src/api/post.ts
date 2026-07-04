import type { PostBody, PostBodyWriteInput } from "@/entities/post-body";

import { getAxiosInstance } from "./request";

export interface CreatePostReq {
  title?: string;
  summary?: string;
  coverFileId?: string;
  topicId?: string;
  categoryId?: string;
  tags?: string[];
  body?: PostBodyWriteInput;
}

export interface CreatePostResp {
  postId: string;
  postVersion: number;
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

export interface PublishPostReq {
  basePostVersion: number;
  draftBodyId: string;
  draftBodyHash: string;
  idempotencyKey?: string;
}

export interface PublishPostResp {
  postId: string;
  postVersion: number;
  publishedAt: string;
}

export type PostBodyResp = PostBody;

export async function createPost(input: CreatePostReq): Promise<CreatePostResp> {
  const response = await getAxiosInstance().post<CreatePostResp>("/v1/posts", input);
  return response.data;
}

export async function saveDraftBody(
  postId: string,
  input: SaveDraftBodyReq,
): Promise<SaveDraftBodyResp> {
  const response = await getAxiosInstance().put<SaveDraftBodyResp>(
    `/v1/posts/${postId}/draft/body`,
    input,
  );

  return response.data;
}

export async function publishPost(
  postId: string,
  input: PublishPostReq,
): Promise<PublishPostResp> {
  const response = await getAxiosInstance().post<PublishPostResp>(
    `/v1/posts/${postId}/publish`,
    input,
  );

  return response.data;
}

export async function getPostBody(postId: string): Promise<PostBodyResp> {
  const response = await getAxiosInstance().get<PostBodyResp>(`/v1/posts/${postId}/body`);
  return response.data;
}
