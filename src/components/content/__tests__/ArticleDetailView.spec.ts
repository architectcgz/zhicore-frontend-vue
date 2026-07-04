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
      ":style=\"{ '--article-progress': `${progressPercent}%` }\"",
    );
    expect(articleDetailViewSource).toContain("useArticleReadingProgress");
    expect(articleDetailViewSource).not.toContain(
      "--article-progress': `${detail.progressPercent}%",
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
});
