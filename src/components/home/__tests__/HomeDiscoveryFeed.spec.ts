import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { homeDiscoveryMock } from "@/features/home-discovery/config/homeDiscoveryMock";

async function mountHomeDiscoveryFeed() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div />" },
      },
      {
        path: "/posts/:postId",
        component: { template: "<div />" },
      },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(HomeDiscoveryFeed, {
    props: {
      discovery: homeDiscoveryMock,
      activeFeedTab: "推荐",
      searchQuery: homeDiscoveryMock.searchInitialQuery,
    },
    global: {
      plugins: [router],
    },
  });
}

describe("HomeDiscoveryFeed", () => {
  it("links recommended posts to their detail pages", async () => {
    const wrapper = await mountHomeDiscoveryFeed();
    const firstPost = homeDiscoveryMock.posts[0];

    const firstPostLink = wrapper.find(
      `.home-discovery__article[href="${firstPost.href}"]`,
    );

    expect(firstPostLink.exists()).toBe(true);
    expect(firstPostLink.text()).toContain(firstPost.title);
  });
});
