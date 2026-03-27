export type ProfileTabKey = 'posts' | 'favorites' | 'following' | 'followers';

export interface ProfileTabLoadRequest {
  tab: ProfileTabKey;
  append?: boolean;
}

export interface ProfileCollectionState<T> {
  list: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string;
  hasMore: boolean;
  page: number;
}

export interface ProfileLikeChange {
  postId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface ProfileFavoriteChange {
  postId: string;
  isFavorited: boolean;
  favoriteCount: number;
}
