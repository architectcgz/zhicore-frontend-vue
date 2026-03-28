export interface PostReaderAvatar {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface PostReadingPresence {
  readingCount: number;
  avatars: PostReaderAvatar[];
}
