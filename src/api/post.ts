import type { PostBody, PostBodyWriteInput } from "@/entities/post-body";
import type { ApiCursorReq, ApiCursorResp } from "@/types/api";

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

export interface PostSummaryStats {
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
}

export interface PostViewerState {
  liked?: boolean | null;
  favorited?: boolean | null;
  degraded?: boolean;
}

export interface PostSummaryResp {
  postId: string;
  authorId: string;
  authorName?: string;
  authorAvatarFileId?: string;
  authorAvatarUrl?: string;
  title: string;
  summary?: string;
  coverFileId?: string;
  coverUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "DELETED";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: PostSummaryStats;
  viewer?: PostViewerState;
}

export interface PostTagResp {
  tagId: string;
  name: string;
  slug: string;
}

export interface PostDetailResp {
  post: PostSummaryResp;
  body?: PostBodyResp;
  tags?: PostTagResp[];
}

export interface ListPostsReq extends ApiCursorReq {
  authorId?: string;
  tag?: string;
  categoryId?: string;
  sort?: "latest";
}

export type ListPostsResp = ApiCursorResp<PostSummaryResp>;

export interface PostEngagementBatchStatusItem {
  postId: string;
  liked: boolean | null;
  favorited: boolean | null;
  degraded: boolean;
}

export interface PostEngagementBatchStatusResp {
  items: PostEngagementBatchStatusItem[];
}

export interface LikePostResp {
  postId: string;
  liked: boolean;
  likeCount: number;
}

export interface FavoritePostResp {
  postId: string;
  favorited: boolean;
  favoriteCount: number;
}

export async function createPost(
  input: CreatePostReq,
): Promise<CreatePostResp> {
  const response = await getAxiosInstance().post<CreatePostResp>(
    "/v1/posts",
    input,
  );
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
  const response = await getAxiosInstance().get<PostBodyResp>(
    `/v1/posts/${postId}/body`,
  );
  return response.data;
}

export async function getPostDetail(postId: string): Promise<PostDetailResp> {
  const response = await getAxiosInstance().get<PostDetailResp>(
    `/v1/posts/${postId}`,
  );
  return response.data;
}

export async function listPosts(input?: ListPostsReq): Promise<ListPostsResp> {
  const response = await getAxiosInstance().get<ListPostsResp>("/v1/posts", {
    params: input,
  });
  return response.data;
}

export async function getPostEngagementBatchStatus(
  postIds: string[],
): Promise<PostEngagementBatchStatusResp> {
  const response = await getAxiosInstance().post<PostEngagementBatchStatusResp>(
    "/v1/posts/engagement/batch-status",
    { postIds },
  );
  return response.data;
}

export async function likePost(postId: string): Promise<LikePostResp> {
  const response = await getAxiosInstance().put<LikePostResp>(
    `/v1/posts/${postId}/like`,
  );
  return response.data;
}

export async function favoritePost(postId: string): Promise<FavoritePostResp> {
  const response = await getAxiosInstance().put<FavoritePostResp>(
    `/v1/posts/${postId}/favorite`,
  );
  return response.data;
}
