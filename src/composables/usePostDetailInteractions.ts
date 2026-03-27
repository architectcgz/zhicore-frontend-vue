import { computed, onUnmounted, ref, type Ref } from 'vue';
import { postApi } from '@/api/post';
import type { Post } from '@/types';

interface UsePostDetailInteractionsOptions {
  post: Ref<Post | undefined>;
  postOverrides: Ref<Partial<Post>>;
  commentsSectionRef: Ref<HTMLElement | null>;
  defaultAvatar: string;
  defaultCoverImage: string;
}

export function usePostDetailInteractions(options: UsePostDetailInteractionsOptions) {
  const likeLoading = ref(false);
  const favoriteLoading = ref(false);
  const linkCopied = ref(false);
  let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  const copyLabel = computed(() => (linkCopied.value ? '已复制' : '复制链接'));

  const updatePostOverrides = (nextOverride: Partial<Post>) => {
    options.postOverrides.value = {
      ...options.postOverrides.value,
      ...nextOverride,
    };
  };

  const handleLike = async () => {
    if (!options.post.value || likeLoading.value) {
      return;
    }

    likeLoading.value = true;

    try {
      const nextIsLiked = !options.post.value.isLiked;

      if (options.post.value.isLiked) {
        await postApi.unlikePost(options.post.value.id);
      } else {
        await postApi.likePost(options.post.value.id);
      }

      updatePostOverrides({
        isLiked: nextIsLiked,
        likeCount: Math.max(0, options.post.value.likeCount + (nextIsLiked ? 1 : -1)),
      });
    } catch (requestError) {
      console.error('点赞操作失败:', requestError);
    } finally {
      likeLoading.value = false;
    }
  };

  const handleFavorite = async () => {
    if (!options.post.value || favoriteLoading.value) {
      return;
    }

    favoriteLoading.value = true;

    try {
      const nextIsFavorited = !options.post.value.isFavorited;

      if (options.post.value.isFavorited) {
        await postApi.unfavoritePost(options.post.value.id);
      } else {
        await postApi.favoritePost(options.post.value.id);
      }

      updatePostOverrides({
        isFavorited: nextIsFavorited,
        favoriteCount: Math.max(0, options.post.value.favoriteCount + (nextIsFavorited ? 1 : -1)),
      });
    } catch (requestError) {
      console.error('收藏操作失败:', requestError);
    } finally {
      favoriteLoading.value = false;
    }
  };

  const scrollToComments = () => {
    options.commentsSectionRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const helperTextarea = document.createElement('textarea');
        helperTextarea.value = url;
        helperTextarea.setAttribute('readonly', 'true');
        helperTextarea.style.position = 'absolute';
        helperTextarea.style.left = '-9999px';
        document.body.appendChild(helperTextarea);
        helperTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(helperTextarea);
      }

      linkCopied.value = true;

      if (copyResetTimer) {
        clearTimeout(copyResetTimer);
      }

      copyResetTimer = setTimeout(() => {
        linkCopied.value = false;
      }, 2200);
    } catch (requestError) {
      console.error('复制链接失败:', requestError);
    }
  };

  const handleCommentCountChange = (count: number) => {
    updatePostOverrides({
      commentCount: count,
    });
  };

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = options.defaultCoverImage;
  };

  const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = options.defaultAvatar;
  };

  onUnmounted(() => {
    if (copyResetTimer) {
      clearTimeout(copyResetTimer);
    }
  });

  return {
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
  };
}
