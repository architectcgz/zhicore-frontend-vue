import { ref, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { PaginatedResponse, Post, User } from '@/types';
import type {
  ProfileCollectionState,
  ProfileFavoriteChange,
  ProfileLikeChange,
} from '@/types/user/profile';

const PAGE_SIZE = 20;

const createCollectionState = <T>(): ProfileCollectionState<T> => ({
  list: [],
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: true,
  page: 1,
});

interface UseProfileCollectionsOptions {
  userId: Ref<string>;
  getUserPosts: (userId: string, page: number, size: number) => Promise<PaginatedResponse<Post>>;
  getUserFavorites: (
    userId: string,
    page: number,
    size: number
  ) => Promise<PaginatedResponse<Post>>;
  getUserFollowing: (
    userId: string,
    page: number,
    size: number
  ) => Promise<PaginatedResponse<User>>;
  getUserFollowers: (
    userId: string,
    page: number,
    size: number
  ) => Promise<PaginatedResponse<User>>;
}

export function useProfileCollections(options: UseProfileCollectionsOptions) {
  const posts = ref<ProfileCollectionState<Post>>(createCollectionState<Post>());
  const favorites = ref<ProfileCollectionState<Post>>(createCollectionState<Post>());
  const following = ref<ProfileCollectionState<User>>(createCollectionState<User>());
  const followers = ref<ProfileCollectionState<User>>(createCollectionState<User>());

  const loadCollectionPage = async <T>(
    state: Ref<ProfileCollectionState<T>>,
    fetcher: (page: number, size: number) => Promise<PaginatedResponse<T>>,
    messages: {
      loadErrorMessage: string;
      loadMoreErrorMessage: string;
    },
    append = false
  ) => {
    if (append) {
      if (state.value.loadingMore || !state.value.hasMore) {
        return;
      }

      state.value.loadingMore = true;
    } else {
      state.value.loading = true;
      state.value.error = '';
    }

    try {
      const nextPage = append ? state.value.page + 1 : 1;
      const result = await fetcher(nextPage, PAGE_SIZE);

      state.value.list = append ? [...state.value.list, ...result.items] : result.items;
      state.value.hasMore = result.hasMore;
      state.value.page = nextPage;
    } catch (requestError) {
      if (append) {
        ElMessage.error(messages.loadMoreErrorMessage);
      } else {
        state.value.error = messages.loadErrorMessage;
      }

      console.error(messages.loadErrorMessage, requestError);
    } finally {
      if (append) {
        state.value.loadingMore = false;
      } else {
        state.value.loading = false;
      }
    }
  };

  const loadPostsPage = async (append = false) => {
    await loadCollectionPage(
      posts,
      (page, size) => options.getUserPosts(options.userId.value, page, size),
      {
        loadErrorMessage: '加载文章失败',
        loadMoreErrorMessage: '加载更多文章失败',
      },
      append
    );
  };

  const loadFavoritesPage = async (append = false) => {
    await loadCollectionPage(
      favorites,
      (page, size) => options.getUserFavorites(options.userId.value, page, size),
      {
        loadErrorMessage: '加载收藏失败',
        loadMoreErrorMessage: '加载更多收藏失败',
      },
      append
    );
  };

  const loadFollowingPage = async (append = false) => {
    await loadCollectionPage(
      following,
      (page, size) => options.getUserFollowing(options.userId.value, page, size),
      {
        loadErrorMessage: '加载关注列表失败',
        loadMoreErrorMessage: '加载更多关注失败',
      },
      append
    );
  };

  const loadFollowersPage = async (append = false) => {
    await loadCollectionPage(
      followers,
      (page, size) => options.getUserFollowers(options.userId.value, page, size),
      {
        loadErrorMessage: '加载粉丝列表失败',
        loadMoreErrorMessage: '加载更多粉丝失败',
      },
      append
    );
  };

  const resetCollectionStates = () => {
    posts.value = createCollectionState<Post>();
    favorites.value = createCollectionState<Post>();
    following.value = createCollectionState<User>();
    followers.value = createCollectionState<User>();
  };

  const updatePostCollections = (updater: (post: Post) => Post) => {
    posts.value.list = posts.value.list.map(updater);
    favorites.value.list = favorites.value.list.map(updater);
  };

  const handleLikeChange = (change: ProfileLikeChange) => {
    updatePostCollections((post) =>
      post.id === change.postId
        ? { ...post, isLiked: change.isLiked, likeCount: change.likeCount }
        : post
    );
  };

  const handleFavoriteChange = (change: ProfileFavoriteChange) => {
    updatePostCollections((post) =>
      post.id === change.postId
        ? {
            ...post,
            isFavorited: change.isFavorited,
            favoriteCount: change.favoriteCount,
          }
        : post
    );
  };

  return {
    posts,
    favorites,
    following,
    followers,
    resetCollectionStates,
    loadPostsPage,
    loadFavoritesPage,
    loadFollowingPage,
    loadFollowersPage,
    handleLikeChange,
    handleFavoriteChange,
  };
}
