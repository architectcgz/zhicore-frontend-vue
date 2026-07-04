import { describe, expect, it } from "vitest";

import articleCommentsSource from "@/components/content/ArticleComments.vue?raw";
import articleDetailSource from "@/components/content/ArticleDetailView.vue?raw";
import homeDiscoverySource from "@/components/home/HomeDiscoveryFeed.vue?raw";
import contentRouteSource from "@/pages/content/ContentDetailRoutePage.vue?raw";
import homeRouteSource from "@/pages/home/HomeRoutePage.vue?raw";

describe("page layer separation", () => {
  it("keeps mock data out of UI components", () => {
    expect(homeDiscoverySource).not.toContain("const metrics");
    expect(homeDiscoverySource).not.toContain("const posts");
    expect(homeDiscoverySource).not.toContain("const authors");
    expect(articleDetailSource).not.toContain("const tocItems");
    expect(articleDetailSource).not.toContain("const relatedPosts");
    expect(articleCommentsSource).not.toContain("const comments");
  });

  it("keeps route pages as composition surfaces over feature page logic", () => {
    expect(homeRouteSource).toContain("useHomeDiscoveryPage");
    expect(contentRouteSource).toContain("useContentDetailPage");
  });
});
