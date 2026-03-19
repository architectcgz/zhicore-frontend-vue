/**
 * 文章阅读态 Composable
 * 统一管理阅读进度、当前章节高亮和目录跳转。
 */

import {
  nextTick,
  onMounted,
  onUnmounted,
  readonly,
  shallowRef,
  toRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

export interface PostReadingTocItem {
  level: number;
  title: string;
  anchor: string;
}

export interface UsePostReadingStateOptions {
  articleBody: MaybeRefOrGetter<HTMLElement | null | undefined>;
  tocItems: MaybeRefOrGetter<ReadonlyArray<PostReadingTocItem>>;
  contentVersion?: MaybeRefOrGetter<unknown>;
}

export function usePostReadingState(options: UsePostReadingStateOptions) {
  const readingProgress = shallowRef(0);
  const activeHeading = shallowRef('');

  const articleBodyRef = toRef(() => toValue(options.articleBody));
  const tocItemsRef = toRef(() => toValue(options.tocItems));
  const contentVersionRef = toRef(() => toValue(options.contentVersion));

  let headingObserver: IntersectionObserver | null = null;

  function disconnectHeadingObserver() {
    if (!headingObserver) {
      return;
    }

    headingObserver.disconnect();
    headingObserver = null;
  }

  function updateReadingProgress() {
    const articleBody = articleBodyRef.value;

    if (!articleBody || typeof window === 'undefined') {
      readingProgress.value = 0;
      return;
    }

    const rect = articleBody.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const viewportHeight = window.innerHeight || 1;
    const readingLine = Math.min(120, viewportHeight * 0.18);
    const articleTop = scrollTop + rect.top;
    const articleBottom = articleTop + rect.height;
    const startOffset = articleTop - readingLine;
    const endOffset = articleBottom - (viewportHeight - readingLine);
    const totalDistance = Math.max(1, endOffset - startOffset);
    const consumedDistance = scrollTop - startOffset;
    const progress = (consumedDistance / totalDistance) * 100;

    readingProgress.value = Math.min(100, Math.max(0, progress));
  }

  function setupHeadingObserver() {
    disconnectHeadingObserver();

    const articleBody = articleBodyRef.value;
    const tocItems = tocItemsRef.value;

    if (!articleBody) {
      activeHeading.value = '';
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      activeHeading.value = tocItems[0]?.anchor ?? '';
      return;
    }

    const headings = Array.from(articleBody.querySelectorAll<HTMLElement>('h2[id], h3[id]'));

    if (headings.length === 0) {
      activeHeading.value = '';
      return;
    }

    activeHeading.value = headings[0].id;

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        const nearestEntry = visibleEntries[0];

        if (nearestEntry) {
          activeHeading.value = (nearestEntry.target as HTMLElement).id;
        }
      },
      {
        rootMargin: '-18% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    headings.forEach((heading) => {
      headingObserver?.observe(heading);
    });
  }

  async function refreshReadingState() {
    await nextTick();
    setupHeadingObserver();
    updateReadingProgress();
  }

  function scrollToHeading(anchor: string) {
    if (typeof document === 'undefined') {
      return;
    }

    const targetHeading = document.getElementById(anchor);

    if (!targetHeading) {
      return;
    }

    activeHeading.value = anchor;
    targetHeading.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  watch(
    [contentVersionRef, tocItemsRef],
    () => {
      void refreshReadingState();
    },
    {
      flush: 'post',
    }
  );

  onMounted(() => {
    void refreshReadingState();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress, { passive: true });
  });

  onUnmounted(() => {
    disconnectHeadingObserver();
    window.removeEventListener('scroll', updateReadingProgress);
    window.removeEventListener('resize', updateReadingProgress);
  });

  return {
    readingProgress: readonly(readingProgress),
    activeHeading: readonly(activeHeading),
    refreshReadingState,
    scrollToHeading,
  };
}
