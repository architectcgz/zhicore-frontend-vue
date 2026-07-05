import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { homeDiscoveryMock } from "@/features/home-discovery";

async function mountHomeDiscoveryFeed(
  props: Partial<InstanceType<typeof HomeDiscoveryFeed>["$props"]> = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/auth/login", component: { template: "<div />" } },
      { path: "/structure", component: { template: "<div />" } },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(HomeDiscoveryFeed, {
    props: {
      discovery: homeDiscoveryMock,
      activeContentCategory: "全部",
      searchQuery: "",
      feedState: "ready",
      feedError: "",
      ...props,
    },
    global: {
      plugins: [router],
    },
  });
}

describe("HomeDiscoveryFeed", () => {
  it("mounts successfully with the new design", async () => {
    const wrapper = await mountHomeDiscoveryFeed();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".home-discovery__hero-title").text()).toContain(
      "结构化知识",
    );
  });

  it("renders article cards with the shared default presentation", async () => {
    const wrapper = await mountHomeDiscoveryFeed();
    const articles = wrapper.findAll(".home-discovery__article");

    expect(articles).toHaveLength(homeDiscoveryMock.posts.length);

    for (const [index, article] of articles.entries()) {
      const post = homeDiscoveryMock.posts[index];

      expect(article.find(".home-discovery__article-author-row").exists()).toBe(
        false,
      );
      expect(
        article.find(".home-discovery__author-info-bottom").text(),
      ).toContain(post.author);
      expect(
        article.findAll(".home-discovery__author-name-small"),
      ).toHaveLength(1);
      expect(
        article.find(".home-discovery__image-placeholder").classes(),
      ).toContain("dark-bg");
      expect(article.find("img[src*='pravatar.cc']").exists()).toBe(false);
    }
  });

  it("emits category selection from feed nav instead of hardcoding active class", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    const frontendTab = wrapper
      .findAll(".home-discovery__nav-item")
      .find((item) => item.text() === "前端");
    await frontendTab?.trigger("click");

    expect(wrapper.emitted("selectContentCategory")).toEqual([["前端"]]);
    expect(wrapper.html()).not.toContain(
      'class="home-discovery__nav-item active"',
    );
  });

  it("renders loading, error and empty states from the workflow owner", async () => {
    const loading = await mountHomeDiscoveryFeed({ feedState: "loading" });
    expect(loading.get('[data-testid="home-feed-loading"]').text()).toContain(
      "正在加载",
    );

    const error = await mountHomeDiscoveryFeed({
      feedState: "error",
      feedError: "list failed",
    });
    expect(error.get('[data-testid="home-feed-error"]').text()).toContain(
      "list failed",
    );
    await error.get('[data-testid="home-feed-retry"]').trigger("click");
    expect(error.emitted("retry")).toHaveLength(1);

    const empty = await mountHomeDiscoveryFeed({
      discovery: {
        ...homeDiscoveryMock,
        posts: [],
      },
      feedState: "empty",
    });
    expect(empty.get('[data-testid="home-feed-empty"]').text()).toContain(
      "暂无内容",
    );
  });

  it("links post title and comments only when the card has a real href", async () => {
    const wrapper = await mountHomeDiscoveryFeed({
      discovery: {
        ...homeDiscoveryMock,
        posts: [
          {
            ...homeDiscoveryMock.posts[0],
            id: "post-1",
            href: "/posts/post-1",
          },
          {
            ...homeDiscoveryMock.posts[1],
            href: undefined,
          },
        ],
      },
    });

    expect(
      wrapper.get('[data-testid="home-post-title-link"]').attributes("href"),
    ).toBe("/posts/post-1");
    expect(
      wrapper.get('[data-testid="home-post-comments-link"]').attributes("href"),
    ).toBe("/posts/post-1#comments");
    expect(
      wrapper.find('[data-testid="home-post-title-static"]').exists(),
    ).toBe(true);
  });

  it("emits post engagement actions only for cards with a real post id", async () => {
    const wrapper = await mountHomeDiscoveryFeed({
      discovery: {
        ...homeDiscoveryMock,
        posts: [
          {
            ...homeDiscoveryMock.posts[0],
            id: "post-1",
            href: "/posts/post-1",
          },
          {
            ...homeDiscoveryMock.posts[1],
            id: undefined,
            href: undefined,
          },
        ],
      },
    });

    await wrapper.get('[data-testid="home-post-like"]').trigger("click");
    await wrapper.get('[data-testid="home-post-favorite"]').trigger("click");

    expect(wrapper.emitted("likePost")).toEqual([["post-1"]]);
    expect(wrapper.emitted("favoritePost")).toEqual([["post-1"]]);
    expect(
      wrapper.find('[data-testid="home-post-like-disabled"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="home-post-favorite-disabled"]').exists(),
    ).toBe(true);
  });

  it("disables engagement actions when viewer engagement is unavailable", async () => {
    const wrapper = await mountHomeDiscoveryFeed({
      discovery: {
        ...homeDiscoveryMock,
        posts: [
          {
            ...homeDiscoveryMock.posts[0],
            id: "post-1",
            href: "/posts/post-1",
            engagementUnavailable: true,
          },
        ],
      },
    });

    expect(wrapper.find('[data-testid="home-post-like"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="home-post-favorite"]').exists()).toBe(
      false,
    );
    expect(
      wrapper
        .get('[data-testid="home-post-like-disabled"]')
        .attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper
        .get('[data-testid="home-post-favorite-disabled"]')
        .attributes("disabled"),
    ).toBeDefined();
  });

  it("reflects selected like and favorite state in action buttons", async () => {
    const wrapper = await mountHomeDiscoveryFeed({
      discovery: {
        ...homeDiscoveryMock,
        posts: [
          {
            ...homeDiscoveryMock.posts[0],
            id: "post-1",
            href: "/posts/post-1",
            liked: true,
            favorited: true,
          },
        ],
      },
    });

    expect(
      wrapper.get('[data-testid="home-post-like"]').attributes("aria-pressed"),
    ).toBe("true");
    expect(
      wrapper
        .get('[data-testid="home-post-favorite"]')
        .attributes("aria-pressed"),
    ).toBe("true");
  });

  it("renders engagement action errors from the workflow owner", async () => {
    const wrapper = await mountHomeDiscoveryFeed({
      engagementActionError: "操作失败",
    });

    expect(
      wrapper.get('[data-testid="home-engagement-error"]').text(),
    ).toContain("操作失败");
  });

  it("hides demo-only sidebar content unless explicitly enabled", async () => {
    const wrapper = await mountHomeDiscoveryFeed();

    expect(wrapper.find(".home-discovery__sidebar").exists()).toBe(false);

    const demo = await mountHomeDiscoveryFeed({
      showSupplementarySidebar: true,
    });
    expect(demo.find(".home-discovery__sidebar").exists()).toBe(true);
  });
});
