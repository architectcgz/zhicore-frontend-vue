import { computed, ref, type CSSProperties } from 'vue';
import { useRoute } from 'vue-router';
import { useMarkdown } from '@/composables/useMarkdown';
import { usePostDetailInteractions } from '@/composables/usePostDetailInteractions';
import { usePostReadingState } from '@/composables/usePostReadingState';
import { usePostQuery } from '@/queries/posts/usePostQuery';
import { useRecommendedPostsQuery } from '@/queries/posts/useRecommendedPostsQuery';
import { useRelatedPostsQuery } from '@/queries/posts/useRelatedPostsQuery';
import type { Post } from '@/types';
import type { PostDetailErrorPresentation, RelatedPostCard } from '@/types/post/detail';
import {
  buildArticlePresentation,
  extractPlainText,
  getPostPreview,
  getPostReadingMinutes,
} from '@/utils/post-detail-content';
import { getPostDetailErrorMessage } from '@/utils/post-detail-formatters';

interface UsePostDetailContentOptions {
  id: string;
}

const defaultAvatar = '/images/default-avatar.svg';
const defaultCoverImage = '/images/default-post-cover.svg';

export function usePostDetailContent(options: UsePostDetailContentOptions) {
  const route = useRoute();
  const postId = computed(() => String(options.id ?? route.params.id ?? '').trim());
  const { renderMarkdown, sanitizeHtml, generateExcerpt, calculateReadingTime } = useMarkdown();

  const { data: postData, isLoading, error, refetch } = usePostQuery(postId);
  const { data: relatedPostsData, isLoading: relatedPostsLoading } = useRelatedPostsQuery(postId, {
    size: 3,
  });
  const { data: recommendedPostsData, isLoading: recommendedPostsLoading } =
    useRecommendedPostsQuery({
      page: 1,
      size: 4,
    });

  const postOverrides = ref<Partial<Post>>({});
  const commentsSectionRef = ref<HTMLElement | null>(null);
  const articleBodyRef = ref<HTMLElement | null>(null);

  const post = computed<Post | undefined>(() => {
    if (!postData.value) {
      return undefined;
    }

    return {
      ...postData.value,
      ...postOverrides.value,
    };
  });

  const articleSource = computed(() => {
    if (!post.value) {
      return '';
    }

    if (post.value.htmlContent?.trim()) {
      return post.value.htmlContent;
    }

    return renderMarkdown(post.value.content || '');
  });

  const articlePresentation = computed(() =>
    buildArticlePresentation(articleSource.value, sanitizeHtml)
  );
  const articleHtml = computed(() => articlePresentation.value.html);
  const tocItems = computed(() => articlePresentation.value.toc);
  const commentCount = computed(() => post.value?.commentCount ?? 0);
  const articleText = computed(() => extractPlainText(articleHtml.value));
  const articleSummary = computed(() => {
    if (post.value?.excerpt?.trim()) {
      return post.value.excerpt;
    }

    if (!articleText.value) {
      return '';
    }

    return generateExcerpt(articleText.value, 120);
  });
  const readingTime = computed(() =>
    calculateReadingTime(post.value?.content || articleText.value)
  );
  const headerTags = computed(() => post.value?.tags?.slice(0, 4) ?? []);
  const sectionCount = computed(() => tocItems.value.length);
  const relatedPosts = computed<Post[]>(() => {
    const currentPostId = post.value?.id;
    const directMatches = (relatedPostsData.value ?? [])
      .filter((item): item is Post => Boolean(item?.id && item.id !== currentPostId))
      .slice(0, 3);

    if (directMatches.length > 0) {
      return directMatches;
    }

    return (recommendedPostsData.value?.items ?? [])
      .filter((item): item is Post => Boolean(item?.id && item.id !== currentPostId))
      .slice(0, 3);
  });

  const isRelatedLoading = computed(
    () =>
      (relatedPostsLoading.value && relatedPosts.value.length === 0) ||
      (recommendedPostsLoading.value && relatedPosts.value.length === 0)
  );
  const relatedSectionKicker = computed(() =>
    relatedPostsData.value?.length ? '相关文章' : '继续阅读'
  );
  const relatedSectionTitle = computed(() =>
    relatedPostsData.value?.length ? '沿着相近主题继续读下去' : '这些内容也值得继续打开'
  );

  const { readingProgress, activeHeading, scrollToHeading } = usePostReadingState({
    articleBody: articleBodyRef,
    tocItems,
    contentVersion: articleHtml,
  });

  const normalizedReadingProgress = computed(() => {
    if (!Number.isFinite(readingProgress.value)) {
      return 0;
    }

    return Math.min(100, Math.max(0, readingProgress.value));
  });

  const readingProgressPercent = computed(() => Math.round(normalizedReadingProgress.value));
  const readingBatteryStyle = computed<CSSProperties>(
    () =>
      ({
        '--reading-progress-angle': `${(normalizedReadingProgress.value / 100) * 360}deg`,
        '--reading-progress-percent': `${normalizedReadingProgress.value}%`,
      }) as CSSProperties
  );

  const relatedCards = computed<RelatedPostCard[]>(() =>
    relatedPosts.value.map((entry) => ({
      id: entry.id,
      title: entry.title,
      eyebrow: entry.tags[0]?.name || '继续阅读',
      readingMinutes: getPostReadingMinutes(entry, calculateReadingTime),
      excerpt: getPostPreview(entry, generateExcerpt),
      authorName: entry.author?.nickname || '匿名用户',
      commentCount: entry.commentCount || 0,
    }))
  );

  const errorPresentation = computed<PostDetailErrorPresentation>(() => {
    const rawMessage = getPostDetailErrorMessage(error.value).trim();
    const normalizedMessage = rawMessage.toLowerCase();

    if (
      normalizedMessage.includes('404') ||
      normalizedMessage.includes('not found') ||
      rawMessage.includes('不存在')
    ) {
      return {
        title: '文章不存在或已下线',
        message: '当前文章可能已被删除，或暂时不可访问。',
        detail: '',
      };
    }

    if (
      normalizedMessage.includes('401') ||
      normalizedMessage.includes('403') ||
      rawMessage.includes('未授权') ||
      rawMessage.includes('没有权限') ||
      rawMessage.includes('登录')
    ) {
      return {
        title: '当前账号暂时无法查看',
        message: '请先登录或切换到有权限的账号后再试。',
        detail: '',
      };
    }

    return {
      title: '暂时无法加载文章',
      message: '网络波动或服务繁忙导致加载失败，请稍后重试。',
      detail: rawMessage,
    };
  });

  const handleRetry = () => {
    void refetch();
  };

  const {
    likeLoading,
    favoriteLoading,
    copyLabel,
    handleLike,
    handleFavorite,
    scrollToComments,
    handleCopyLink,
    handleCommentCountChange,
    handleImageError,
    handleAvatarError,
  } = usePostDetailInteractions({
    post,
    postOverrides,
    commentsSectionRef,
    defaultAvatar,
    defaultCoverImage,
  });

  const setArticleBodyRef = (element: Element | null) => {
    articleBodyRef.value = element instanceof HTMLElement ? element : null;
  };

  const setCommentsSectionRef = (element: Element | null) => {
    commentsSectionRef.value = element instanceof HTMLElement ? element : null;
  };

  return {
    defaultAvatar,
    error,
    errorPresentation,
    post,
    isLoading,
    handleRetry,
    sectionCount,
    articleSummary,
    headerTags,
    readingTime,
    commentCount,
    handleAvatarError,
    articleHtml,
    handleImageError,
    postTags: computed(() => post.value?.tags ?? []),
    setArticleBodyRef,
    readingBatteryStyle,
    readingProgressPercent,
    tocItems,
    activeHeading,
    scrollToHeading,
    likeLoading,
    favoriteLoading,
    handleLike,
    handleFavorite,
    scrollToComments,
    handleCopyLink,
    copyLabel,
    relatedSectionKicker,
    relatedSectionTitle,
    isRelatedLoading,
    relatedCards,
    setCommentsSectionRef,
    handleCommentCountChange,
  };
}
