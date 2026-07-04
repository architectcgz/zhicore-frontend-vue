import { useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted, ref, type Ref } from "vue";

const readingProgressTopOffset = 96;

export interface ReadingProgressInput {
  articleTop: number;
  articleHeight: number;
  viewportHeight: number;
  scrollY: number;
  topOffset: number;
}

export interface ReadingHeadingPosition {
  href: string;
  top: number;
}

export interface ActiveHeadingInput {
  headings: readonly ReadingHeadingPosition[];
  scrollY: number;
  topOffset: number;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateReadingProgress(input: ReadingProgressInput): number {
  const start = input.articleTop - input.topOffset;
  const end = input.articleTop + input.articleHeight - input.viewportHeight;

  if (input.scrollY <= start) {
    return 0;
  }

  // 短文章可能整体小于视口，此时没有可滚动阅读区间，越过起点即视为已读完。
  if (end <= start) {
    return 100;
  }

  if (input.scrollY >= end) {
    return 100;
  }

  return clampPercent(((input.scrollY - start) / (end - start)) * 100);
}

export function calculateActiveHeadingHref(input: ActiveHeadingInput): string {
  if (input.headings.length === 0) {
    return "";
  }

  const readingLine = input.scrollY + input.topOffset;
  let activeHeading = input.headings[0];

  for (const heading of input.headings) {
    if (heading.top > readingLine) {
      break;
    }

    activeHeading = heading;
  }

  return activeHeading.href;
}

function collectHeadingPositions(article: HTMLElement): ReadingHeadingPosition[] {
  return Array.from(
    article.querySelectorAll<HTMLElement>(".article-detail__body-heading[id]"),
  ).map((heading) => ({
    href: `#${heading.id}`,
    top: heading.getBoundingClientRect().top + window.scrollY,
  }));
}

export function useArticleReadingProgress(
  articleRef: Ref<HTMLElement | null>,
  initialProgress: number,
  initialActiveHeadingHref = "",
) {
  const progressPercent = ref(clampPercent(initialProgress));
  const activeHeadingHref = ref(initialActiveHeadingHref);
  let frameId: number | null = null;

  function measureProgress(): void {
    const article = articleRef.value;

    if (!article) {
      return;
    }

    const rect = article.getBoundingClientRect();

    progressPercent.value = calculateReadingProgress({
      articleTop: rect.top + window.scrollY,
      articleHeight: article.scrollHeight,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      topOffset: readingProgressTopOffset,
    });
    activeHeadingHref.value = calculateActiveHeadingHref({
      headings: collectHeadingPositions(article),
      scrollY: window.scrollY,
      topOffset: readingProgressTopOffset,
    });
  }

  function scheduleMeasure(): void {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      measureProgress();
    });
  }

  useEventListener(window, "scroll", scheduleMeasure, { passive: true });
  useEventListener(window, "resize", scheduleMeasure);

  onMounted(scheduleMeasure);
  onUnmounted(() => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  });

  return {
    activeHeadingHref,
    progressPercent,
  };
}
