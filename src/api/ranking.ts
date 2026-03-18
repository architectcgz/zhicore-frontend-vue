/**
 * 排行榜相关 API 接口。
 *
 * 当前 contract-aligned 的 public ranking slice 只保留活跃 UI 已使用的后端确认读能力：
 * - `GET /ranking/posts/hot/details`
 * - `GET /ranking/creators/hot`
 *
 * 其余仍依赖 ID-only 返回或未进入当前页面的排行榜能力，统一放到
 * `src/api/ranking-legacy.ts`，避免继续污染活跃读路径。
 */

import { httpClient } from '@/utils/request';
import { normalizePost } from '@/api/post';
import type {
  Post,
  User,
  Tag,
  RankingItem,
} from '@/types';

interface BackendHotPostDTO {
  id: number | string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  ownerId?: number | string;
  ownerName?: string;
  ownerAvatar?: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
  viewCount?: number;
}

export interface RankingQueryParams {
  page?: number;
  size?: number;
  period?: 'daily' | 'weekly' | 'monthly';
  category?: string;
  tag?: string;
}

export interface PostRankingItem extends RankingItem {
  post: Post;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    favorites: number;
  };
}

export interface CreatorRankingItem extends RankingItem {
  user: User;
  metrics: {
    posts: number;
    totalViews: number;
    totalLikes: number;
    followers: number;
    engagement: number;
  };
}

export interface TopicRankingItem extends RankingItem {
  tag: Tag;
  metrics: {
    posts: number;
    totalViews: number;
    totalLikes: number;
    followers: number;
    growth: number;
  };
}

export interface RankingStats {
  totalPosts: number;
  totalCreators: number;
  totalTopics: number;
  periodStats: {
    period: string;
    posts: number;
    creators: number;
    topics: number;
  };
}

export class RankingApi {
  async getHotPostDetails(params?: { page?: number; size?: number }): Promise<Post[]> {
    const requestParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    };
    const posts = await httpClient.get<BackendHotPostDTO[]>('/ranking/posts/hot/details', requestParams);
    return posts.map(normalizePost);
  }

  async getHotCreatorIds(params?: { page?: number; size?: number }): Promise<string[]> {
    const requestParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    };
    const userIds = await httpClient.get<Array<number | string>>('/ranking/creators/hot', requestParams);
    return userIds.map((userId) => String(userId));
  }
}

export const rankingApi = new RankingApi();
