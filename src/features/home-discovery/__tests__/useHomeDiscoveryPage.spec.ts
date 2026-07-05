import { describe, expect, it } from "vitest";

import { useHomeDiscoveryPage } from "../composables/useHomeDiscoveryPage";

describe("useHomeDiscoveryPage", () => {
  it("owns content category and search state outside the UI component", () => {
    const page = useHomeDiscoveryPage();

    expect(page.discovery.posts.length).toBeGreaterThan(0);
    expect(page.activeContentCategory.value).toBe("全部");
    expect(page.searchQuery.value).toBe("");

    page.selectContentCategory("前端");
    page.updateSearchQuery("内容服务");

    expect(page.activeContentCategory.value).toBe("前端");
    expect(page.searchQuery.value).toBe("内容服务");
  });

  it("ignores categories that are not part of the mock discovery data", () => {
    const page = useHomeDiscoveryPage();

    page.selectContentCategory("不存在");

    expect(page.activeContentCategory.value).toBe("全部");
  });
});
