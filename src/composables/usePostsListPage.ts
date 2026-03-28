import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';
import { useInfinitePostsQuery } from '@/queries/posts/useInfinitePostsQuery';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';
import { useLikePostMutation } from '@/queries/posts/useLikePostMutation';
import { useFavoritePostMutation } from '@/queries/posts/useFavoritePostMutation';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import { useHotCreatorsQuery } from '@/queries/ranking/useHotCreatorsQuery';
import type { Post } from '@/types';

export type PostListSort = 'latest' | 'popular' | 'hot';
export type PostListTimeRange = 'all' | 'today' | 'week' | 'month';

export interface PostListFilters {
  sort: PostListSort;
  tagIds: string[];
  timeRange: PostListTimeRange;
}

const DESKTOP_PAGE_SIZE = 10;
const MOBILE_PAGE_SIZE = 10;

function buildDateRange(timeRange: PostListTimeRange) {
  if (timeRange === 'all') {
    return {};
  }

  const now = new Date();
  const start = new Date(now);

  if (timeRange === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (timeRange === 'week') {
    const dayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayOffset);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return {
    dateFrom: start.toISOString(),
    dateTo: now.toISOString(),
  };
}

function getPostTimestamp(post: Post) {
  return new Date(post.publishedAt || post.createdAt).getTime();
}

export function usePostsListPage() {
  const sort = ref<PostListSort>('latest');
  const tagIds = ref<string[]>([]);
  const timeRange = ref<PostListTimeRange>('all');
  const page = ref(1);
  const isMobile = ref(false);
  const postOverrides = ref<Record<string, Partial<Post>>>({});

  let mediaQuery: MediaQueryList | null = null;
  let cleanupMediaListener: (() => void) | null = null;

  const desktopEnabled = computed(() => !isMobile.value);
  const mobileEnabled = computed(() => isMobile.value);
  const activeDateRange = computed(() => buildDateRange(timeRange.value));

  const desktopParams = computed(() => ({
    page: page.value,
    size: DESKTOP_PAGE_SIZE,
    sort: sort.value,
    status: 'PUBLISHED' as const,
    tagId: tagIds.value.length === 1 ? tagIds.value[0] : undefined,
    tagIds: tagIds.value.length > 0 ? tagIds.value : undefined,
    ...activeDateRange.value,
  }));
  const mobileParams = computed(() => ({
    size: MOBILE_PAGE_SIZE,
    sort: sort.value,
    status: 'PUBLISHED' as const,
    tagId: tagIds.value.length === 1 ? tagIds.value[0] : undefined,
    tagIds: tagIds.value.length > 0 ? tagIds.value : undefined,
    ...activeDateRange.value,
  }));

  const desktopQuery = usePostsQuery(desktopParams, { enabled: desktopEnabled });
  const mobileQuery = useInfinitePostsQuery(mobileParams, { enabled: mobileEnabled });

  const tagOptionsQuery = useHotTagsQuery(ref({ limit: 20, period: 'week' as const }));
  const hotTagsQuery = useHotTagsQuery(ref({ limit: 8, period: 'week' as const }));
  const hotCreatorsQuery = useHotCreatorsQuery(
    ref({
      page: 1,
      size: 4,
      period: 'monthly' as const,
    }),
  );

  const likeMutation = useLikePostMutation();
  const favoriteMutation = useFavoritePostMutation();

  const rawDesktopPosts = computed(() => desktopQuery.data.value?.items ?? []);
  const rawMobilePosts = computed(() =>
    mobileQuery.data.value?.pages.flatMap((pageData) => pageData.items ?? []) ?? [],
  );

  const applyOverrides = (post: Post) => {
    const patch = postOverrides.value[post.id];
    return patch ? { ...post, ...patch } : post;
  };

  const matchesFilters = (post: Post) => {
    if (tagIds.value.length > 0) {
      const postTagIds = new Set(post.tags.map((tag) => tag.id));
      const hasSelectedTag = tagIds.value.some((tagId) => postTagIds.has(tagId));

      if (!hasSelectedTag) {
        return false;
      }
    }

    if (timeRange.value !== 'all') {
      const { dateFrom } = activeDateRange.value;
      const threshold = dateFrom ? new Date(dateFrom).getTime() : 0;

      if (getPostTimestamp(post) < threshold) {
        return false;
      }
    }

    return true;
  };

  const filteredDesktopPosts = computed(() =>
    rawDesktopPosts.value.map(applyOverrides).filter(matchesFilters),
  );
  const filteredMobilePosts = computed(() =>
    rawMobilePosts.value.map(applyOverrides).filter(matchesFilters),
  );

  const posts = computed(() => (isMobile.value ? filteredMobilePosts.value : filteredDesktopPosts.value));
  const total = computed(() => {
    if (isMobile.value) {
      return filteredMobilePosts.value.length;
    }

    if (tagIds.value.length > 0 || timeRange.value !== 'all') {
      return filteredDesktopPosts.value.length;
    }

    return desktopQuery.data.value?.total ?? filteredDesktopPosts.value.length;
  });
  const availableTags = computed(() => tagOptionsQuery.data.value ?? []);
  const hotTags = computed(() => hotTagsQuery.data.value ?? []);
  const hotCreators = computed(() => hotCreatorsQuery.data.value?.items ?? []);

  const isLoading = computed(() =>
    isMobile.value ? mobileQuery.isLoading.value : desktopQuery.isLoading.value || desktopQuery.isFetching.value,
  );
  const errorMessage = computed(() => {
    const error = isMobile.value ? mobileQuery.error.value : desktopQuery.error.value;
    return error instanceof Error ? error.message : error ? String(error) : null;
  });
  const hasNextPage = computed(() => mobileQuery.hasNextPage.value ?? false);
  const isFetchingNextPage = computed(() => mobileQuery.isFetchingNextPage.value);

  const syncBreakpoint = () => {
    if (typeof window === 'undefined') {
      return;
    }

    mediaQuery = window.matchMedia('(max-width: 767px)');
    isMobile.value = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      isMobile.value = event.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    cleanupMediaListener = () => mediaQuery?.removeEventListener('change', handleChange);
  };

  if (getCurrentInstance()) {
    onMounted(syncBreakpoint);

    onUnmounted(() => {
      cleanupMediaListener?.();
    });
  } else {
    syncBreakpoint();
  }

  const patchPost = (postId: string, patch: Partial<Post>) => {
    const currentPatch = postOverrides.value[postId] ?? {};
    postOverrides.value = {
      ...postOverrides.value,
      [postId]: { ...currentPatch, ...patch },
    };
  };

  const findCurrentPost = (postId: string) => posts.value.find((post) => post.id === postId);

  const updateFilters = (filters: PostListFilters) => {
    sort.value = filters.sort;
    tagIds.value = filters.tagIds;
    timeRange.value = filters.timeRange;
    page.value = 1;
  };

  const updatePage = (nextPage: number) => {
    page.value = nextPage;
  };

  const handleLike = async (postId: string) => {
    const currentPost = findCurrentPost(postId);

    if (!currentPost) {
      return;
    }

    await likeMutation.mutateAsync({
      postId,
      isLiked: currentPost.isLiked,
    });

    patchPost(postId, {
      isLiked: !currentPost.isLiked,
      likeCount: Math.max(0, currentPost.likeCount + (currentPost.isLiked ? -1 : 1)),
    });
  };

  const handleFavorite = async (postId: string) => {
    const currentPost = findCurrentPost(postId);

    if (!currentPost) {
      return;
    }

    await favoriteMutation.mutateAsync({
      postId,
      isFavorited: currentPost.isFavorited,
    });

    patchPost(postId, {
      isFavorited: !currentPost.isFavorited,
      favoriteCount: Math.max(0, currentPost.favoriteCount + (currentPost.isFavorited ? -1 : 1)),
    });
  };

  const loadMore = () => {
    if (!isMobile.value || !hasNextPage.value || isFetchingNextPage.value) {
      return;
    }

    void mobileQuery.fetchNextPage();
  };

  return {
    sort,
    tagIds,
    timeRange,
    page,
    isMobile,
    availableTags,
    hotTags,
    hotCreators,
    posts,
    total,
    isLoading,
    errorMessage,
    hasNextPage,
    isFetchingNextPage,
    updateFilters,
    updatePage,
    handleLike,
    handleFavorite,
    loadMore,
  };
}
