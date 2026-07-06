import type { ApiPageReq } from "@/types/api";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import {
  getMockCreateCommentResp,
  getMockListCommentsPageResp,
} from "./mock/contentMockApi";
import { getAxiosInstance } from "./request";

export type CommentSort = "RECOMMENDED" | "HOT" | "TIME";

export interface CreateCommentReq {
  content?: string;
  parentCommentId?: string;
  imageFileIds?: string[];
  voiceFileId?: string;
  voiceDuration?: number;
}

export interface CreateCommentResp {
  postId: string;
  commentId: string;
  rootCommentId?: string;
  parentCommentId?: string;
  createdAt: string;
}

export interface CommentAuthorSummary {
  publicId?: string;
  displayName?: string;
  avatarFileId?: string;
  avatarUrl?: string;
  unavailable?: boolean;
}

export interface CommentItem {
  postId: string;
  commentId: string;
  rootCommentId?: string;
  parentCommentId?: string;
  author: CommentAuthorSummary;
  content?: string;
  imageFileIds?: string[];
  imageUrls?: string[];
  voiceFileId?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  status: "NORMAL" | "DELETED";
  stats: {
    likeCount: number;
    replyCount: number;
  };
  viewer?: {
    liked: boolean;
  };
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListCommentsPageReq extends ApiPageReq {
  sort?: CommentSort;
}

export interface TopLevelCommentPageResp {
  items: CommentItem[];
  page: number;
  size: number;
  totalComments: number;
  totalTopLevelComments: number;
  pages: number;
}

export async function createComment(
  postId: string,
  input: CreateCommentReq,
): Promise<CreateCommentResp> {
  if (isLocalDemoModeEnabled()) {
    return getMockCreateCommentResp(postId);
  }

  const response = await getAxiosInstance().post<CreateCommentResp>(
    `/v1/posts/${postId}/comments`,
    input,
  );
  return response.data;
}

export async function listCommentsPage(
  postId: string,
  input?: ListCommentsPageReq,
): Promise<TopLevelCommentPageResp> {
  if (isLocalDemoModeEnabled()) {
    return getMockListCommentsPageResp(postId, input);
  }

  const response = await getAxiosInstance().get<TopLevelCommentPageResp>(
    `/v1/posts/${postId}/comments/page`,
    { params: input },
  );
  return response.data;
}
