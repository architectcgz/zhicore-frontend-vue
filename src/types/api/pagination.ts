export interface ApiPageReq {
  page?: number;
  size?: number;
}

export interface ApiPageResp<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface ApiCursorReq {
  cursor?: string;
  limit?: number;
}

export interface ApiCursorResp<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}
