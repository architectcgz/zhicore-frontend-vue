import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationCenterPageState } from "@/features/notification";

import HomeNotificationsRoutePage from "../HomeNotificationsRoutePage.vue";

const notificationMocks = vi.hoisted(() => ({
  useNotificationCenterPage: vi.fn(),
}));

vi.mock("@/features/notification", () => ({
  useNotificationCenterPage: notificationMocks.useNotificationCenterPage,
}));

function createPageState(
  overrides: Partial<NotificationCenterPageState> = {},
): NotificationCenterPageState {
  const items = ref([
    {
      id: "notif-1",
      latestNotificationId: "latest-notif-1",
      type: "POST_LIKED",
      category: "interaction" as const,
      title: "新的互动",
      body: "Han Meimei 赞了你的文章",
      occurredAt: "2026-07-07T08:00:00Z",
      unread: true,
      unreadCount: 1,
      totalCount: 1,
      targetType: "POST",
      targetId: "post-1",
      targetPath: null,
    },
  ]);

  return {
    status: ref("success"),
    items,
    error: ref(null),
    actionError: ref(null),
    selectedCategory: ref("all"),
    cursor: ref("cursor-2"),
    hasMore: ref(true),
    loadingMore: ref(false),
    unreadCount: ref(1),
    breakdown: ref({
      total: 1,
      interaction: 1,
      content: 0,
      social: 0,
      system: 0,
      security: 0,
    }),
    submittingMarkAll: ref(false),
    categoryCounts: computed(() => ({
      all: 1,
      interaction: 1,
      content: 0,
      social: 0,
      system: 0,
      security: 0,
    })),
    canLoadMore: computed(() => true),
    retry: vi.fn(),
    selectCategory: vi.fn(),
    loadMore: vi.fn(),
    markAllRead: vi.fn(),
    ...overrides,
  } as NotificationCenterPageState;
}

describe("HomeNotificationsRoutePage", () => {
  beforeEach(() => {
    notificationMocks.useNotificationCenterPage.mockReset();
    notificationMocks.useNotificationCenterPage.mockReturnValue(createPageState());
  });

  it("renders real notification success state instead of the unavailable placeholder", () => {
    const wrapper = mount(HomeNotificationsRoutePage);

    expect(wrapper.text()).toContain("通知中心");
    expect(wrapper.text()).toContain("新的互动");
    expect(wrapper.text()).not.toContain("通知暂不可用");
    expect(wrapper.find('input[type="search"]').exists()).toBe(false);
  });

  it("wires category, load more and mark-all actions to the feature owner", async () => {
    const page = createPageState();
    notificationMocks.useNotificationCenterPage.mockReturnValue(page);
    const wrapper = mount(HomeNotificationsRoutePage);

    await wrapper.get('button[aria-label="内容通知"]').trigger("click");
    await wrapper.get('button[aria-label="加载更多通知"]').trigger("click");
    await wrapper.get('button[aria-label="全部已读"]').trigger("click");

    expect(page.selectCategory).toHaveBeenCalledWith("content");
    expect(page.loadMore).toHaveBeenCalledOnce();
    expect(page.markAllRead).toHaveBeenCalledOnce();
    expect(wrapper.find('button[aria-label="标记 notif-1 已读"]').exists()).toBe(
      false,
    );
  });

  it("renders loading, error and empty states with retry", async () => {
    const retry = vi.fn();
    notificationMocks.useNotificationCenterPage.mockReturnValue(
      createPageState({
        status: ref("error"),
        error: ref("通知加载失败"),
        items: ref([]),
        retry,
      }),
    );
    const wrapper = mount(HomeNotificationsRoutePage);

    expect(wrapper.text()).toContain("通知加载失败");
    await wrapper.get('button[aria-label="重新加载通知"]').trigger("click");
    expect(retry).toHaveBeenCalledOnce();

    notificationMocks.useNotificationCenterPage.mockReturnValue(
      createPageState({
        status: ref("loading"),
        items: ref([]),
      }),
    );
    const loadingWrapper = mount(HomeNotificationsRoutePage);
    expect(loadingWrapper.text()).toContain("通知加载中");

    notificationMocks.useNotificationCenterPage.mockReturnValue(
      createPageState({
        status: ref("empty"),
        items: ref([]),
      }),
    );
    const emptyWrapper = mount(HomeNotificationsRoutePage);
    expect(emptyWrapper.text()).toContain("暂无通知");
  });
});
