export interface CommunityTopic {
  id: string;
  label: string;
  slug: string;
}

export interface CommunityPost {
  id: string;
  href: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  commentCount: number;
}

export type CommunityLoadState = "loading" | "ready" | "empty" | "error";
