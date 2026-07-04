import { describe, expect, it } from "vitest";

import { useHomeDiscoveryPage } from "../composables/useHomeDiscoveryPage";

describe("useHomeDiscoveryPage", () => {
  it("owns discovery tab and search state outside the UI component", () => {
    const page = useHomeDiscoveryPage();

    expect(page.discovery.posts.length).toBeGreaterThan(0);
    expect(page.activeFeedTab.value).toBe("推荐");
    expect(page.searchQuery.value).toBe("");

    page.selectFeedTab("最新");
    page.updateSearchQuery("内容服务");

    expect(page.activeFeedTab.value).toBe("最新");
    expect(page.searchQuery.value).toBe("内容服务");
  });

  it("ignores tabs that are not part of the mock discovery data", () => {
    const page = useHomeDiscoveryPage();

    page.selectFeedTab("不存在");

    expect(page.activeFeedTab.value).toBe("推荐");
  });
});
