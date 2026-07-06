import { describe, expect, it } from "vitest";

import articleDetailViewSource from "../ArticleDetailView.vue?raw";

describe("ArticleDetailView", () => {
  it("renders body heading ids so toc anchors scroll to section titles", () => {
    expect(articleDetailViewSource).toContain("<h2");
    expect(articleDetailViewSource).toContain(
      "v-if=\"block.kind === 'heading'\"",
    );
    expect(articleDetailViewSource).toContain(':id="block.id"');
    expect(articleDetailViewSource).toContain(
      'class="article-detail__body-heading reading-typography__heading"',
    );
    expect(articleDetailViewSource).not.toContain(
      '<p v-if="block.kind === \'paragraph\'" :id="block.id"',
    );
    expect(articleDetailViewSource).not.toContain(
      '<blockquote v-else :id="block.id"',
    );
  });

  it("binds toc progress to scroll-driven state instead of static detail data", () => {
    expect(articleDetailViewSource).toContain(
      ':aria-label="`阅读进度 ${progressPercent}%`"',
    );
    expect(articleDetailViewSource).toContain(
      "'--article-progress': `${progressPercent}%`",
    );
    expect(articleDetailViewSource).toContain(
      "'--article-progress-scale': tocProgressScale",
    );
    expect(articleDetailViewSource).toContain("useArticleReadingProgress");
    expect(articleDetailViewSource).toContain("tocProgressScale");
    expect(articleDetailViewSource).not.toContain(
      "--article-progress': `${detail.progressPercent}%",
    );
  });

  it("scales desktop toc progress within the track height", () => {
    expect(articleDetailViewSource).toContain("bottom: 0.5rem;");
    expect(articleDetailViewSource).toContain(
      "transform: scaleY(var(--article-progress-scale, 0));",
    );
    expect(articleDetailViewSource).toContain("transform-origin: top;");
    expect(articleDetailViewSource).not.toContain(
      "height: var(--article-progress);",
    );
  });

  it("centers the desktop toc track on the navigation markers", () => {
    expect(articleDetailViewSource).toContain("--article-toc-marker-size");
    expect(articleDetailViewSource).toContain("--article-toc-track-width");
    expect(articleDetailViewSource).toContain("--article-toc-track-left");
    expect(articleDetailViewSource).toContain(
      "left: var(--article-toc-track-left);",
    );
    expect(articleDetailViewSource).toContain(
      "left: calc(var(--space-4) * -1);",
    );
    expect(articleDetailViewSource).not.toContain(
      "left: calc(var(--space-4) * -1 - 0.0625rem);",
    );
  });

  it("binds active toc item to scroll-driven heading state", () => {
    expect(articleDetailViewSource).toContain(
      ":class=\"{ 'is-active': tocItem.href === activeHeadingHref }\"",
    );
    expect(articleDetailViewSource).not.toContain(
      "tocItem.label === detail.activeTocLabel",
    );
  });

  it("emits article action intents instead of owning API calls", () => {
    expect(articleDetailViewSource).toContain("@click=\"$emit('likePost')\"");
    expect(articleDetailViewSource).toContain(
      "@click=\"$emit('favoritePost')\"",
    );
    expect(articleDetailViewSource).toContain("@click=\"$emit('sharePost')\"");
    expect(articleDetailViewSource).not.toContain("@/api/post");
  });

  it("uses the dock comment composer inside the desktop reading card", () => {
    expect(articleDetailViewSource).toContain(
      '<div class="article-detail__reading-card">',
    );
    expect(articleDetailViewSource).toContain('variant="dock"');
  });

  it("places related reading between the article body and dock comments", () => {
    const bodyIndex = articleDetailViewSource.indexOf(
      'class="article-detail__body reading-typography"',
    );
    const relatedIndex = articleDetailViewSource.indexOf(
      'class="article-detail__related-section"',
    );
    const commentsIndex = articleDetailViewSource.indexOf("<ArticleComments");

    expect(bodyIndex).toBeGreaterThan(-1);
    expect(relatedIndex).toBeGreaterThan(bodyIndex);
    expect(commentsIndex).toBeGreaterThan(relatedIndex);
  });

  it("links related posts with real post ids instead of placeholder anchors", () => {
    expect(articleDetailViewSource).toContain(
      'v-for="item in detail.relatedPosts"',
    );
    expect(articleDetailViewSource).toContain(':href="`/posts/${item.id}`"');
    expect(articleDetailViewSource).not.toContain(
      '<a v-for="item in detail.relatedPosts" :key="item.title" href="#">',
    );
  });
});
