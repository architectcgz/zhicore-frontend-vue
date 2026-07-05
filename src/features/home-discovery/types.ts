export interface HomeMetric {
  label: string;
  value: string;
}

export interface HomePost {
  href: string;
  category: string;
  readingTime: string;
  title: string;
  summary: string;
  tags: readonly string[];
  author: string;
  publishedAt: string;
  likes: number;
  comments: number;
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
