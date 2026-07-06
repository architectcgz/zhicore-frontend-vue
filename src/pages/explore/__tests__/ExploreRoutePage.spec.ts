import { mount } from "@vue/test-utils";
import { computed, reactive, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import ExploreRoutePage from "../ExploreRoutePage.vue";

import type { HomeDiscoveryData } from "@/features/home-discovery";

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isLoggedIn: false,
    restore: vi.fn(),
  }),
}));

const pageState = {
  discovery: reactive<HomeDiscoveryData>({
    eyebrow: "Explore",
    title: "发现内容",
    lede: "",
    searchInitialQuery: "",
    metrics: [{ label: "今日发布", value: "1" }],
    contentCategories: ["全部", "Vue", "架构"],
    posts: [
      {
        id: "post-1",
        href: "/posts/post-1",
        category: "Vue",
        readingTime: "8 分钟阅读",
        title: "Vue 组合式页面边界",
        summary: "页面只装配状态和组件，避免把 API 细节扩散到路由层。",
        tags: ["Vue", "前端"],
        author: "Lin",
        publishedAt: "今天",
        likes: 12,
        comments: 4,
      },
    ],
    authorsTitle: "",
    authors: [{ initial: "林", name: "Lin", bio: "前端工程化" }],
  }),
  feedState: ref<"loading" | "ready" | "empty" | "error">("ready"),
  feedError: ref(""),
  engagementActionError: ref(""),
  activeContentCategory: ref("全部"),
};

vi.mock("@/features/home-discovery", () => ({
  useHomeDiscoveryPage: () => ({
    discovery: pageState.discovery,
    feedState: computed(() => pageState.feedState.value),
    feedError: computed(() => pageState.feedError.value),
    engagementActionError: computed(
      () => pageState.engagementActionError.value,
    ),
    activeContentCategory: computed(
      () => pageState.activeContentCategory.value,
    ),
    selectContentCategory: vi.fn(),
    retry: vi.fn(),
    likePost: vi.fn(),
    favoritePost: vi.fn(),
  }),
}));

async function mountExploreRoutePage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/explore", component: ExploreRoutePage },
      { path: "/posts/:id", component: { template: "<div />" } },
      { path: "/community", component: { template: "<div />" } },
    ],
  });
  await router.push("/explore");
  await router.isReady();

  return mount(ExploreRoutePage, {
    global: {
      plugins: [router],
    },
  });
}

describe("ExploreRoutePage", () => {
  beforeEach(() => {
    pageState.discovery.contentCategories = ["全部", "Vue", "架构"];
    pageState.discovery.posts = [
      {
        id: "post-1",
        href: "/posts/post-1",
        category: "Vue",
        readingTime: "8 分钟阅读",
        title: "Vue 组合式页面边界",
        summary: "页面只装配状态和组件，避免把 API 细节扩散到路由层。",
        tags: ["Vue", "前端"],
        author: "Lin",
        publishedAt: "今天",
        likes: 12,
        comments: 4,
      },
    ];
    pageState.discovery.authors = [
      { initial: "林", name: "Lin", bio: "前端工程化" },
    ];
    pageState.feedState.value = "ready";
    pageState.feedError.value = "";
    pageState.engagementActionError.value = "";
    pageState.activeContentCategory.value = "全部";
  });

  it("does not present an error state as an empty zero-count result", async () => {
    pageState.feedState.value = "error";
    pageState.feedError.value = "list failed";
    pageState.discovery.posts = [];

    const wrapper = await mountExploreRoutePage();

    expect(wrapper.get(".explore-hero__stats").text()).toContain("--");
    expect(wrapper.get(".explore-state").text()).toContain("list failed");
    expect(wrapper.get(".explore-hero__stats").text()).not.toContain("Posts0");
  });

  it("renders the restored explore sidebar and derives counts from local page data", async () => {
    const wrapper = await mountExploreRoutePage();
    const stats = wrapper.findAll(".explore-hero__stat");

    expect(stats[0].text()).toContain("1Posts");
    expect(stats[1].text()).toContain("3Categories");
    expect(stats[2].text()).toContain("1Contributors");
    expect(wrapper.get(".explore-panel").text()).toContain("Filter by");
    expect(wrapper.get(".explore-tag-cloud").text()).toContain("Vue");
    expect(wrapper.get(".explore-trending").text()).toContain(
      "Vue 组合式页面边界",
    );
    expect(wrapper.get(".explore-communities").text()).toContain(
      "Design Systems",
    );
  });
});
