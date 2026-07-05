import { mount } from "@vue/test-utils";
import { computed, reactive, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
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
    metrics: [],
    contentCategories: ["全部", "Vue"],
    posts: [],
    authorsTitle: "",
    authors: [],
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
    routes: [{ path: "/explore", component: ExploreRoutePage }],
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
  it("does not present an error state as an empty zero-count result", async () => {
    pageState.feedState.value = "error";
    pageState.feedError.value = "list failed";
    pageState.discovery.posts = [];

    const wrapper = await mountExploreRoutePage();

    expect(wrapper.get(".explore-header__summary").text()).toContain("--");
    expect(wrapper.get(".feed-state.error").text()).toContain("list failed");
    expect(wrapper.get(".explore-header__summary").text()).not.toContain(
      "公开内容0",
    );
  });
});
