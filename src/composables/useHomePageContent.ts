import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CreatorRankingItem, TopicRankingItem } from '@/api/ranking';
import { useHotPostsQuery } from '@/queries/posts/useHotPostsQuery';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';
import { useHotCreatorsQuery } from '@/queries/ranking/useHotCreatorsQuery';
import { useHotTopicsQuery } from '@/queries/ranking/useHotTopicsQuery';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import type { Post, Tag } from '@/types';
import type { CreatorHighlight, HomeQuickLink, HomeSummaryStat, PostInteractionChange, TopicHighlight } from '@/types/home';
import { formatCompactNumber, getErrorMessage } from '@/utils/home-formatters';

const HOME_SECONDARY_POST_LIMIT = 4;
const FEATURED_ROTATION_INTERVAL = 6000;

const quickLinks: HomeQuickLink[] = [
  {
    title: '进入标签广场',
    description: '按主题寻找正在增长的内容脉络。',
    to: '/tags',
    kicker: 'Topics',
  },
  {
    title: '查看趋势榜单',
    description: '快速定位本周最有讨论度的内容与作者。',
    to: '/ranking',
    kicker: 'Ranking',
  },
  {
    title: '开始发布内容',
    description: '把你的笔记、观察和方案整理成可读文章。',
    to: '/posts/create',
    kicker: 'Create',
  },
];

const postsQueryParams = {
  size: 20,
  sort: 'latest',
} as const;

export function useHomePageContent() {
  const isMounted = ref(false);
  const postOverrides = ref<Record<string, Partial<Post>>>({});
  const featuredIndex = ref(0);
  let featuredTimer: ReturnType<typeof setInterval> | null = null;

  const creatorRankingParams = ref({
    page: 1,
    size: 3,
    period: 'monthly' as const,
  });
  const topicRankingParams = ref({
    page: 1,
    size: 6,
    period: 'weekly' as const,
  });

  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching: postsFetching,
    error: postsError,
    refetch: refetchPosts,
  } = usePostsQuery({
    ...postsQueryParams,
  });

  const { data: tagsData, isLoading: tagsLoading } = useHotTagsQuery();
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError,
  } = useHotPostsQuery({
    page: 0,
    size: 5,
  });
  const { data: hotCreatorsData, isLoading: creatorsLoading } = useHotCreatorsQuery(creatorRankingParams);
  const { data: hotTopicsData, isLoading: topicsLoading } = useHotTopicsQuery(topicRankingParams);

  const posts = computed<Post[]>(() => postsData.value?.items ?? []);
  const displayPosts = computed<Post[]>(() => {
    const overrides = postOverrides.value;
    return posts.value.map((post) => {
      const patch = overrides[post.id];
      return patch ? { ...post, ...patch } : post;
    });
  });

  const featuredCandidates = computed<Post[]>(() => displayPosts.value.slice(0, 5));
  const featuredPost = computed<Post | null>(() => {
    if (!featuredCandidates.value.length) {
      return null;
    }

    return featuredCandidates.value[featuredIndex.value] ?? featuredCandidates.value[0];
  });
  const secondaryPosts = computed<Post[]>(() => {
    if (!featuredPost.value) {
      return displayPosts.value.slice(0, HOME_SECONDARY_POST_LIMIT);
    }

    return displayPosts.value
      .filter((post) => post.id !== featuredPost.value?.id)
      .slice(0, HOME_SECONDARY_POST_LIMIT);
  });

  const tags = computed<Tag[]>(() => tagsData.value ?? []);
  const trendingPosts = computed<Post[]>(() => trendingData.value?.items ?? []);
  const heroTags = computed<Tag[]>(() => tags.value.slice(0, 4));
  const creatorItems = computed<CreatorRankingItem[]>(() => hotCreatorsData.value?.items ?? []);
  const topicItems = computed<TopicRankingItem[]>(() => hotTopicsData.value?.items ?? []);

  const topicHighlights = computed<TopicHighlight[]>(() => {
    if (topicItems.value.length > 0) {
      return topicItems.value.slice(0, 6).map((item) => ({
        id: item.id,
        name: item.tag.name,
        slug: item.tag.slug,
        description: item.tag.description || '持续增长中的讨论主题',
        posts: item.metrics.posts,
        views: item.metrics.totalViews,
        likes: item.metrics.totalLikes,
        growth: item.metrics.growth,
      }));
    }

    return tags.value.slice(0, 6).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '等待更多创作者加入这个主题。',
      posts: tag.postCount || 0,
      views: 0,
      likes: 0,
      growth: 0,
    }));
  });

  const creatorHighlights = computed<CreatorHighlight[]>(() => {
    if (creatorItems.value.length > 0) {
      return creatorItems.value.slice(0, 3).map((item) => ({
        id: item.user.id,
        nickname: item.user.nickname,
        avatar: item.user.avatar,
        bio: item.user.bio || '持续分享技术与创作观察。',
        posts: item.metrics.posts,
        followers: item.metrics.followers,
        views: item.metrics.totalViews,
        score: item.score,
      }));
    }

    return displayPosts.value
      .filter((post): post is Post & { author: NonNullable<Post['author']> } => Boolean(post.author))
      .slice(0, 3)
      .map((post) => ({
        id: post.author.id,
        nickname: post.author.nickname,
        avatar: post.author.avatar,
        bio: post.author.bio || '从最新文章中被识别出的活跃作者。',
        posts: post.author.postsCount || 0,
        followers: post.author.followersCount || 0,
        views: post.viewCount || 0,
        score: post.likeCount || 0,
      }));
  });

  const summaryStats = computed<HomeSummaryStat[]>(() => [
    {
      label: '最新内容',
      value: `${postsData.value?.total ?? displayPosts.value.length}`,
      detail: '持续更新的创作者文章',
    },
    {
      label: '热议标签',
      value: `${tags.value.length}`,
      detail: '高频参与的主题讨论',
    },
    {
      label: '趋势观察',
      value: `${trendingPosts.value.length}`,
      detail: '社区关注较高的热门内容',
    },
  ]);

  const totalViews = computed(() => displayPosts.value.reduce((sum, post) => sum + (post.viewCount || 0), 0));
  const insightLine = computed(() => {
    if (!displayPosts.value.length) {
      return '新内容发布后，这里会展示社区里的最新动态。';
    }

    return `当前内容已累计 ${formatCompactNumber(totalViews.value)} 次浏览，覆盖创作、工程与社区讨论。`;
  });
  const curationNotes = computed(() => [
    `热门主题下已有 ${formatCompactNumber(topicHighlights.value.reduce((sum, topic) => sum + topic.posts, 0))} 篇内容`,
    `${creatorHighlights.value.length} 位活跃作者正在持续更新`,
    `${trendingPosts.value.length} 篇热门文章值得优先阅读`,
  ]);

  const isLoading = computed(() => postsLoading.value || (postsFetching.value && !postsData.value));
  const isSidebarLoading = computed(() => tagsLoading.value || trendingLoading.value);
  const showDiscoverySkeleton = computed(() => topicsLoading.value || creatorsLoading.value);
  const postsErrorMessage = computed(() =>
    postsError.value ? getErrorMessage(postsError.value) : null
  );

  const restartFeaturedTimer = (listLength: number) => {
    if (featuredTimer) {
      clearInterval(featuredTimer);
      featuredTimer = null;
    }

    if (listLength <= 1) {
      return;
    }

    featuredTimer = setInterval(() => {
      featuredIndex.value = (featuredIndex.value + 1) % listLength;
    }, FEATURED_ROTATION_INTERVAL);
  };

  onMounted(() => {
    isMounted.value = true;
    restartFeaturedTimer(featuredCandidates.value.length);
  });

  onUnmounted(() => {
    if (!featuredTimer) {
      return;
    }

    clearInterval(featuredTimer);
    featuredTimer = null;
  });

  watch(featuredCandidates, (list) => {
    if (featuredIndex.value >= list.length) {
      featuredIndex.value = 0;
    }

    restartFeaturedTimer(list.length);
  });

  const handleHomeRetry = () => {
    void refetchPosts();
  };

  const switchFeatured = (nextIndex: number) => {
    if (!featuredCandidates.value.length) {
      return;
    }

    const maxIndex = featuredCandidates.value.length - 1;
    featuredIndex.value = Math.min(maxIndex, Math.max(0, nextIndex));
  };

  const handleFeaturedWheel = (event: WheelEvent) => {
    if (featuredCandidates.value.length <= 1) {
      return;
    }

    if (event.deltaY > 0) {
      switchFeatured((featuredIndex.value + 1) % featuredCandidates.value.length);
      return;
    }

    if (event.deltaY < 0) {
      switchFeatured(
        (featuredIndex.value - 1 + featuredCandidates.value.length) % featuredCandidates.value.length
      );
    }
  };

  const patchPostOverride = (postId: string, patch: Partial<Post>) => {
    const current = postOverrides.value[postId] || {};
    postOverrides.value = {
      ...postOverrides.value,
      [postId]: { ...current, ...patch },
    };
  };

  const handleLikeChange = (data: Pick<PostInteractionChange, 'postId' | 'isLiked' | 'likeCount'>) => {
    patchPostOverride(data.postId, {
      isLiked: data.isLiked,
      likeCount: data.likeCount,
    });
  };

  const handleFavoriteChange = (
    data: Pick<PostInteractionChange, 'postId' | 'isFavorited' | 'favoriteCount'>
  ) => {
    patchPostOverride(data.postId, {
      isFavorited: data.isFavorited,
      favoriteCount: data.favoriteCount,
    });
  };

  return {
    isMounted,
    quickLinks,
    heroTags,
    summaryStats,
    featuredPost,
    featuredCandidates,
    featuredIndex,
    curationNotes,
    insightLine,
    switchFeatured,
    handleFeaturedWheel,
    showDiscoverySkeleton,
    topicHighlights,
    creatorHighlights,
    isLoading,
    postsErrorMessage,
    handleHomeRetry,
    displayPosts,
    secondaryPosts,
    handleLikeChange,
    handleFavoriteChange,
    trendingPosts,
    isSidebarLoading,
    trendingError,
  };
}
