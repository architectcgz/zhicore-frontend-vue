export interface HomeMetric {
  label: string;
  value: string;
}

export interface HomePost {
  href: string;
  category: string;
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

export interface HomeKnowledgeStructure {
  title: string;
  description: string;
}

export interface HomeDiscoveryData {
  eyebrow: string;
  title: string;
  lede: string;
  searchInitialQuery: string;
  metrics: readonly HomeMetric[];
  feedTabs: readonly string[];
  posts: readonly HomePost[];
  knowledgeStructure: HomeKnowledgeStructure;
  authorsTitle: string;
  authors: readonly HomeAuthor[];
}
