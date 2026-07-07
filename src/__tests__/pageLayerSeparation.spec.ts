import { describe, expect, it } from "vitest";

import articleCommentsSource from "@/components/content/ArticleComments.vue?raw";
import articleDetailSource from "@/components/content/ArticleDetailView.vue?raw";
import homeDiscoverySource from "@/components/home/HomeDiscoveryFeed.vue?raw";
import authRouteWorkspaceSource from "@/features/auth/ui/AuthRouteWorkspace.vue?raw";
import communityWorkspaceSource from "@/features/community/ui/CommunityWorkspace.vue?raw";
import homeDiscoveryExploreWorkspaceSource from "@/features/home-discovery/ui/HomeDiscoveryExploreWorkspace.vue?raw";
import contentRouteSource from "@/pages/content/ContentDetailRoutePage.vue?raw";
import homeRouteSource from "@/pages/home/HomeRoutePage.vue?raw";

function expectNoUiMockFixtures(
  source: string,
  names: readonly string[],
): void {
  expect(source).not.toMatch(/from\s+["']@\/api\/mock\//);
  expect(source).not.toMatch(/from\s+["'][^"']*(?:mock|fixture)[^"']*["']/i);

  for (const name of names) {
    expect(source).not.toMatch(new RegExp(`\\bconst\\s+${name}\\s*=\\s*\\[`));
  }
}

describe("page layer separation", () => {
  it("keeps mock data out of UI components", () => {
    expectNoUiMockFixtures(homeDiscoverySource, [
      "metrics",
      "posts",
      "authors",
    ]);
    expectNoUiMockFixtures(articleDetailSource, ["tocItems", "relatedPosts"]);
    expectNoUiMockFixtures(articleCommentsSource, ["comments"]);
    expectNoUiMockFixtures(authRouteWorkspaceSource, []);
    expectNoUiMockFixtures(communityWorkspaceSource, [
      "topics",
      "posts",
      "trendingTopics",
      "latestPosts",
    ]);
    expectNoUiMockFixtures(homeDiscoveryExploreWorkspaceSource, [
      "metrics",
      "posts",
      "authors",
    ]);
  });

  it("keeps route pages as composition surfaces over feature page logic", () => {
    expect(homeRouteSource).toContain("useHomeDiscoveryPage");
    expect(contentRouteSource).toContain("useContentDetailPage");
  });
});
