import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import homeDiscoverySource from "@/components/home/HomeDiscoveryFeed.vue?raw";
import { homeDiscoveryMock } from "@/features/home-discovery";

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
      activeContentCategory: "全部",
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

  it("renders content categories as the primary article filter", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    expect(wrapper.text()).toContain("内容分类");
    expect(wrapper.text()).toContain("全部");
    expect(wrapper.text()).toContain("前端");
    expect(wrapper.text()).not.toContain("文章分类");
  });

  it("filters visible posts by the active content category", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    await wrapper.setProps({ activeContentCategory: "前端" });

    expect(wrapper.text()).toContain("编辑器为什么应该像一篇文章");
    expect(wrapper.text()).not.toContain("从网关到内容服务");
  });

  it("keeps the article list available without mobile support drawer state", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    expect(wrapper.find(".home-discovery__feed").exists()).toBe(true);
    expect(homeDiscoverySource).not.toContain("mobileSupportOpen");
    expect(homeDiscoverySource).not.toContain(
      "HOME_DISCOVERY_MOBILE_MENU_EVENT",
    );
    expect(homeDiscoverySource).not.toContain(
      "home-discovery__support-panel--mobile-open",
    );
  });

  it("does not render content-area mobile panel controls", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    expect(wrapper.find(".home-discovery__mobile-controls").exists()).toBe(
      false,
    );
    expect(
      wrapper.find('[data-testid="mobile-category-toggle"]').exists(),
    ).toBe(false);
    expect(wrapper.find('[data-testid="mobile-authors-toggle"]').exists()).toBe(
      false,
    );
  });

  it("does not render mobile support drawer controls", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    expect(wrapper.find(".home-discovery__support-head").exists()).toBe(false);
    expect(wrapper.find('[aria-label="关闭首页辅助导航"]').exists()).toBe(
      false,
    );
  });

  it("emits the selected category from the desktop category filter", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    const frontendCategoryButton = wrapper
      .findAll(".home-discovery__category-button")
      .find((button) => button.text().includes("前端"));

    expect(frontendCategoryButton).toBeDefined();
    await frontendCategoryButton!.trigger("click");

    expect(wrapper.emitted("selectContentCategory")).toEqual([["前端"]]);
  });
});
