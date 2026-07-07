import { describe, expect, it } from "vitest";

import articleCommentsSource from "@/components/content/ArticleComments.vue?raw";
import articleDetailSource from "@/components/content/ArticleDetailView.vue?raw";
import homeOverviewSource from "@/components/home/HomeOverviewWidget.vue?raw";
import authRouteWorkspaceSource from "@/features/auth/ui/AuthRouteWorkspace.vue?raw";
import communityWorkspaceSource from "@/features/community/ui/CommunityWorkspace.vue?raw";
import homeDiscoveryExploreWorkspaceSource from "@/features/home-discovery/ui/HomeDiscoveryExploreWorkspace.vue?raw";
import contentRouteSource from "@/pages/content/ContentDetailRoutePage.vue?raw";
import exploreRouteSource from "@/pages/explore/ExploreRoutePage.vue?raw";
import messageDetailRouteSource from "@/pages/home/HomeMessageDetailRoutePage.vue?raw";
import notificationsRouteSource from "@/pages/home/HomeNotificationsRoutePage.vue?raw";
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
    expectNoUiMockFixtures(homeOverviewSource, ["metrics", "posts", "authors"]);
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
    expect(homeRouteSource).toContain("HomeOverviewWidget");
    expect(homeRouteSource).not.toContain("useHomeDiscoveryRoutePage");
    expect(exploreRouteSource).toContain("useHomeDiscoveryRoutePage");
    expect(contentRouteSource).toContain("useContentDetailRoutePage");
    expect(messageDetailRouteSource).toContain("useMessageCenterRoutePage");
  });

  it("keeps route synchronization and auth redirect adapters out of route pages", () => {
    for (const source of [
      homeRouteSource,
      exploreRouteSource,
      contentRouteSource,
      messageDetailRouteSource,
    ]) {
      expect(source).not.toContain("useRoute(");
      expect(source).not.toContain("useRouter(");
    }

    expect(homeRouteSource).not.toContain("@/stores/auth");
    expect(exploreRouteSource).not.toContain("@/stores/auth");
    expect(contentRouteSource).not.toContain("@/stores/auth");
  });

  it("keeps page-local viewport and list controller state out of route pages", () => {
    expect(contentRouteSource).not.toContain("window.innerWidth");
    expect(contentRouteSource).not.toContain("resize");

    expect(notificationsRouteSource).not.toContain("const selectedCategory");
    expect(notificationsRouteSource).not.toContain("const currentPage");
    expect(notificationsRouteSource).not.toContain("filteredNotifications");
    expect(notificationsRouteSource).not.toContain("function selectCategory");
    expect(notificationsRouteSource).not.toContain("function goNextPage");
  });
});
