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

export interface TocActiveHeadingInput {
  headings: readonly ReadingHeadingPosition[];
  progressScale: number;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampScale(value: number): number {
  return Math.min(1, Math.max(0, value));
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

export function calculateTocActiveHeadingHref(
  input: TocActiveHeadingInput,
): string {
  if (input.headings.length === 0) {
    return "";
  }

  if (input.headings.length === 1) {
    return input.headings[0].href;
  }

  const lastHeadingIndex = input.headings.length - 1;
  const activeIndex = Math.min(
    lastHeadingIndex,
    Math.floor(clampScale(input.progressScale) * lastHeadingIndex),
  );

  return input.headings[activeIndex].href;
}

function collectHeadingPositions(
  article: HTMLElement,
): ReadingHeadingPosition[] {
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
  const tocProgressScale = ref(clampPercent(initialProgress) / 100);
  const activeHeadingHref = ref(initialActiveHeadingHref);
  let frameId: number | null = null;

  function measureProgress(): void {
    const article = articleRef.value;

    if (!article) {
      return;
    }

    const rect = article.getBoundingClientRect();

    const headings = collectHeadingPositions(article);

    const measuredProgressPercent = calculateReadingProgress({
      articleTop: rect.top + window.scrollY,
      articleHeight: article.scrollHeight,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      topOffset: readingProgressTopOffset,
    });
    const measuredTocProgressScale = clampScale(measuredProgressPercent / 100);

    progressPercent.value = measuredProgressPercent;
    activeHeadingHref.value = calculateTocActiveHeadingHref({
      headings,
      progressScale: measuredTocProgressScale,
    });
    tocProgressScale.value = measuredTocProgressScale;
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
    tocProgressScale,
  };
}
