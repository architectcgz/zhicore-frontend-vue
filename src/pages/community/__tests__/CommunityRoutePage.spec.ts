import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import CommunityRoutePage from "../CommunityRoutePage.vue";

const selectTopic = vi.fn();

vi.mock("@/features/community", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/community")>()),
  useCommunityPage: () => ({
    topics: [
      { id: "tag-vue", label: "Vue", slug: "vue" },
      { id: "tag-go", label: "Go", slug: "go" },
    ],
    posts: [
      {
        id: "post-1",
        href: "/posts/post-1",
        title: "社区文章",
        summary: "公开社区内容",
        author: "作者",
        publishedAt: "今天",
        commentCount: 2,
      },
    ],
    topicState: computed(() => "ready"),
    feedState: computed(() => "ready"),
    topicError: computed(() => ""),
    feedError: computed(() => ""),
    activeTopicSlug: ref(""),
    selectTopic,
    retryTopics: vi.fn(),
    retryPosts: vi.fn(),
  }),
}));

async function mountCommunityRoutePage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/community", component: CommunityRoutePage },
      { path: "/posts/:id", component: { template: "<div />" } },
    ],
  });
  await router.push("/community");
  await router.isReady();

  return mount(CommunityRoutePage, {
    global: {
      plugins: [router],
    },
  });
}

describe("CommunityRoutePage", () => {
  it("renders the community workspace and forwards topic selection", async () => {
    const wrapper = await mountCommunityRoutePage();

    expect(wrapper.get("#community-route-title").text()).toBe("全部社区");
    expect(wrapper.text()).toContain("社区文章");
    expect(wrapper.text()).toContain("主题社区");

    await wrapper.findAll(".community-route__topic-btn")[1].trigger("click");

    expect(selectTopic).toHaveBeenCalledWith("vue");
  });
});
