import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeOverviewWidget from "@/components/home/HomeOverviewWidget.vue";

async function mountHomeOverviewWidget() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/editor", component: { template: "<div />" } },
      { path: "/explore", component: { template: "<div />" } },
      { path: "/community", component: { template: "<div />" } },
      { path: "/resources", component: { template: "<div />" } },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(HomeOverviewWidget, {
    global: {
      plugins: [router],
    },
  });
}

describe("HomeOverviewWidget", () => {
  it("renders the home page as a product overview instead of another article feed", async () => {
    const wrapper = await mountHomeOverviewWidget();

    expect(wrapper.get("#home-overview-title").text()).toBe(
      "结构化知识工作台",
    );
    expect(wrapper.find(".home-discovery__article").exists()).toBe(false);
    expect(wrapper.find(".home-discovery__feed-nav").exists()).toBe(false);
  });

  it("links each home entry to a distinct product area", async () => {
    const wrapper = await mountHomeOverviewWidget();
    const entryHrefs = wrapper
      .findAll(".home-overview__entry")
      .map((entry) => entry.attributes("href"));

    expect(wrapper.get('a[href="/editor"]').text()).toContain("开始写作");
    expect(wrapper.get('a[href="/explore"]').text()).toContain("浏览内容");
    expect(entryHrefs).toEqual([
      "/editor",
      "/explore",
      "/community",
      "/resources",
    ]);
  });
});
