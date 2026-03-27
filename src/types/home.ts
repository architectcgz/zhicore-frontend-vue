import type { Post, Tag } from '@/types';

export interface TopicHighlight {
  id: string;
  name: string;
  slug: string;
  description: string;
  posts: number;
  views: number;
  likes: number;
  growth: number;
}

export interface CreatorHighlight {
  id: string;
  nickname: string;
  avatar: string | null;
  bio: string;
  posts: number;
  followers: number;
  views: number;
  score: number;
}

export interface HomeSummaryStat {
  label: string;
  value: string;
  detail: string;
}

export interface HomeQuickLink {
  title: string;
  description: string;
  to: string;
  kicker: 'Topics' | 'Ranking' | 'Create';
}

export interface PostInteractionChange {
  postId: string;
  isLiked?: boolean;
  likeCount?: number;
  isFavorited?: boolean;
  favoriteCount?: number;
}

export interface HomeHeroSectionProps {
  insightLine: string;
  heroTags: Tag[];
  summaryStats: HomeSummaryStat[];
  featuredPost: Post | null;
  featuredCandidates: Post[];
  featuredIndex: number;
  curationNotes: string[];
}
