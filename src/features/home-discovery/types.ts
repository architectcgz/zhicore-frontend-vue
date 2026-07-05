export interface HomeMetric {
  label: string;
  value: string;
}

export interface HomePost {
  id?: string;
  href?: string;
  category: string;
  readingTime: string;
  title: string;
  summary: string;
  tags: readonly string[];
  author: string;
  authorAvatarUrl?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  liked?: boolean | null;
  favorited?: boolean | null;
  engagementUnavailable?: boolean;
}

export interface HomeAuthor {
  initial: string;
  name: string;
  bio: string;
}

export interface HomeDiscoveryData {
  eyebrow: string;
  title: string;
  lede: string;
  searchInitialQuery: string;
  metrics: readonly HomeMetric[];
  contentCategories: readonly string[];
  posts: readonly HomePost[];
  authorsTitle: string;
  authors: readonly HomeAuthor[];
}
