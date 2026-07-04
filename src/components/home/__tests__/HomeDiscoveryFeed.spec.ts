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
      {
        path: "/editor",
        component: { template: "<div />" },
      },
      {
        path: "/structure",
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
      searchQuery: "",
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

  it("renders the search prompt as placeholder copy instead of an entered query", async () => {
    const wrapper = await mountHomeDiscoveryFeed();
    const searchInput = wrapper.get<HTMLInputElement>(
      ".home-discovery__search input",
    );

    expect(searchInput.element.value).toBe("");
    expect(searchInput.attributes("placeholder")).toBe(
      homeDiscoveryMock.searchInitialQuery,
    );
  });

  it("filters visible posts by the active search query", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    await wrapper.setProps({ searchQuery: "Tiptap" });

    expect(wrapper.text()).toContain("编辑器为什么应该像一篇文章");
    expect(wrapper.text()).not.toContain("从网关到内容服务");
  });
});
