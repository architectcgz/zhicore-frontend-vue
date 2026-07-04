import { describe, expect, it } from "vitest";

import { useContentDetailPage } from "../composables/useContentDetailPage";

describe("useContentDetailPage", () => {
  it("owns comment sort and draft state outside the UI component", () => {
    const page = useContentDetailPage();

    expect(page.detail.comments.length).toBeGreaterThan(0);
    expect(page.activeCommentSort.value).toBe("最有价值");
    expect(page.commentDraftBody.value).toContain("主资源");

    page.selectCommentSort("最新");
    page.updateCommentDraftBody("新的评论草稿");

    expect(page.activeCommentSort.value).toBe("最新");
    expect(page.commentDraftBody.value).toBe("新的评论草稿");
  });

  it("ignores unknown comment sort values", () => {
    const page = useContentDetailPage();

    page.selectCommentSort("不存在");

    expect(page.activeCommentSort.value).toBe("最有价值");
  });

  it("keeps article toc links backed by rendered heading anchors", () => {
    const page = useContentDetailPage();
    const headingAnchorIds = new Set(
      page.detail.bodyBlocks
        .filter((block) => block.kind === "heading")
        .map((block) => ("id" in block ? block.id : undefined))
        .filter((id): id is string => typeof id === "string"),
    );
    for (const tocItem of page.detail.tocItems) {
      expect(headingAnchorIds.has(tocItem.href.replace("#", ""))).toBe(true);
    }
  });
});
