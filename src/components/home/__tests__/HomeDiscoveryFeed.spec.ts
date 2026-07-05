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
    expect(wrapper.find(".home-discovery__hero-title").text()).toContain("结构化知识");
  });
});
