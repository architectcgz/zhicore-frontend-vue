import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { contentDetailResponseMock } from "@/features/content-detail/config/contentDetailResponseMock";
import { mapContentDetailResponse } from "@/features/content-detail/lib/contentDetailResponseMapper";

import ArticleDetailMobileView from "../ArticleDetailMobileView.vue";
import articleDetailMobileViewSource from "../ArticleDetailMobileView.vue?raw";

function mountArticleDetailMobileView() {
  return mount(ArticleDetailMobileView, {
    props: {
      detail: mapContentDetailResponse(contentDetailResponseMock),
      activeCommentSort: "最有价值",
      commentDraftBody: "",
    },
    global: {
      stubs: {
        ArticleComments: true,
      },
    },
  });
}

describe("ArticleDetailMobileView", () => {
  it("keeps the floating action entry visible as a true mobile sphere", () => {
    expect(articleDetailMobileViewSource).toContain(
      'class="article-detail-mobile__fab"',
    );
    expect(articleDetailMobileViewSource).toContain("width: 4rem;");
    expect(articleDetailMobileViewSource).toContain("height: 4rem;");
    expect(articleDetailMobileViewSource).toContain("border-radius: 50%;");
    expect(articleDetailMobileViewSource).toContain("z-index: 80;");
  });

  it("opens article actions from a floating control", async () => {
    const wrapper = mountArticleDetailMobileView();

    expect(
      wrapper.get('[data-testid="mobile-article-actions-toggle"]').attributes(),
    ).toMatchObject({
      "aria-expanded": "false",
    });
    expect(
      wrapper.find('[data-testid="mobile-article-actions"]').exists(),
    ).toBe(false);

    await wrapper
      .get('[data-testid="mobile-article-actions-toggle"]')
      .trigger("click");

    expect(
      wrapper.get('[data-testid="mobile-article-actions-toggle"]').attributes(),
    ).toMatchObject({
      "aria-expanded": "true",
    });
    expect(
      wrapper.get('[data-testid="mobile-article-actions"]').text(),
    ).toContain("18");
    expect(
      wrapper.get('[data-testid="mobile-article-actions"]').text(),
    ).toContain("--");
    expect(
      wrapper.get('[data-testid="mobile-article-actions"]').text(),
    ).toContain("分享");
    expect(
      wrapper.get('[data-testid="mobile-article-actions"]').text(),
    ).toContain("本文导航");
    expect(
      wrapper.get('[data-testid="mobile-article-actions"]').text(),
    ).toContain("请求事实层");
  });

  it("closes article actions after selecting a toc heading", async () => {
    const wrapper = mountArticleDetailMobileView();

    await wrapper
      .get('[data-testid="mobile-article-actions-toggle"]')
      .trigger("click");
    await wrapper
      .get('[data-testid="mobile-article-actions"] a')
      .trigger("click");

    expect(
      wrapper.find('[data-testid="mobile-article-actions"]').exists(),
    ).toBe(false);
    expect(
      wrapper.get('[data-testid="mobile-article-actions-toggle"]').attributes(),
    ).toMatchObject({
      "aria-expanded": "false",
    });
  });
});
