import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeDiscoveryFeed from "@/components/home/HomeDiscoveryFeed.vue";
import { homeDiscoveryMock } from "@/features/home-discovery";

async function mountHomeDiscoveryFeed() {
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
    }
  });
});
