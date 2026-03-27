export interface TocItem {
  level: number;
  title: string;
  anchor: string;
}

export interface PostDetailErrorPresentation {
  title: string;
  message: string;
  detail: string;
}

export interface RelatedPostCard {
  id: string;
  title: string;
  eyebrow: string;
  readingMinutes: number;
  excerpt: string;
  authorName: string;
  commentCount: number;
}
