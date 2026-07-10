import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getNotificationUnreadBreakdown,
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ListNotificationsResp,
} from "@/api/notification";

import { useNotificationCenterPage } from "../composables/useNotificationCenterPage";

vi.mock("@/api/notification", () => ({
  getNotificationUnreadBreakdown: vi.fn(),
  getNotificationUnreadCount: vi.fn(),
  listNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
}));

function notificationPage(
  items: ListNotificationsResp["items"],
  nextCursor?: string,
): ListNotificationsResp {
  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
    hasMore: Boolean(nextCursor),
  };
}

function notificationItem(
  groupKey: string,
  overrides: Partial<ListNotificationsResp["items"][number]> = {},
): ListNotificationsResp["items"][number] {
  return {
    groupKey,
    latestNotificationId: `latest-${groupKey}`,
    type: "POST_LIKED",
    category: "INTERACTION",
    targetType: "POST",
    targetId: "post-1",
    totalCount: 1,
    unreadCount: 1,
    latestTime: "2026-07-07T08:00:00Z",
    latestContent: "Han Meimei 赞了你的文章",
    actorIds: ["user-1"],
    aggregatedContent: {
      title: "新的互动",
    },
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("useNotificationCenterPage", () => {
  beforeEach(() => {
    vi.mocked(listNotifications).mockReset();
    vi.mocked(getNotificationUnreadCount).mockReset();
    vi.mocked(getNotificationUnreadBreakdown).mockReset();
    vi.mocked(markAllNotificationsRead).mockReset();
    vi.mocked(markNotificationRead).mockReset();

    vi.mocked(getNotificationUnreadCount).mockResolvedValue({ unreadCount: 3 });
    vi.mocked(getNotificationUnreadBreakdown).mockResolvedValue({
      total: 3,
      interaction: 2,
      content: 1,
      social: 0,
      system: 0,
      security: 0,
    });
  });

  it("loads notifications, unread total and category breakdown on creation", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1")], "cursor-2"),
    );

    const page = useNotificationCenterPage();
    expect(page.status.value).toBe("loading");

    await flushPromises();

    expect(page.status.value).toBe("success");
    expect(page.items.value).toHaveLength(1);
    expect(page.items.value[0]).toMatchObject({
      id: "notif-1",
      latestNotificationId: "latest-notif-1",
      category: "interaction",
      title: "新的互动",
      unread: true,
      targetPath: null,
    });
    // 仅有 actorIds 时回退为无名触发者，名字留给 UI 展示 id。
    expect(page.items.value[0].actors).toEqual([{ id: "user-1", name: null }]);
    expect(page.unreadCount.value).toBe(3);
    expect(page.breakdown.value?.content).toBe(1);
    expect(page.hasMore.value).toBe(true);
    expect(listNotifications).toHaveBeenCalledWith({ size: 20 });
  });

  it("maps recentActors summaries into named aggregation actors", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([
        notificationItem("notif-1", {
          actorIds: ["user-1", "user-2"],
          recentActors: [
            { id: "user-1", name: "陈立" },
            { id: "user-2", name: "王雨溪" },
          ],
        }),
      ]),
    );

    const page = useNotificationCenterPage();
    await flushPromises();

    expect(page.items.value[0].actors).toEqual([
      { id: "user-1", name: "陈立" },
      { id: "user-2", name: "王雨溪" },
    ]);
  });

  it("keeps unread facts unknown when only unread summary requests fail", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1")]),
    );
    vi.mocked(getNotificationUnreadCount).mockRejectedValue(
      new Error("unread count failed"),
    );
    vi.mocked(getNotificationUnreadBreakdown).mockRejectedValue(
      new Error("breakdown failed"),
    );

    const page = useNotificationCenterPage();
    await flushPromises();

    expect(page.status.value).toBe("success");
    expect(page.items.value).toHaveLength(1);
    expect(page.unreadCount.value).toBeNull();
    expect(page.breakdown.value).toBeNull();
  });

  it("enters an error state when the list request fails", async () => {
    vi.mocked(listNotifications).mockRejectedValue(new Error("list failed"));

    const page = useNotificationCenterPage();
    await flushPromises();

    expect(page.status.value).toBe("error");
    expect(page.error.value).toBe("list failed");
    expect(page.items.value).toHaveLength(0);
  });

  it("resets pagination and discards stale responses when switching category", async () => {
    const first = deferred<ListNotificationsResp>();
    const second = deferred<ListNotificationsResp>();
    vi.mocked(listNotifications)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const page = useNotificationCenterPage();
    page.selectCategory("content");

    second.resolve(
      notificationPage([
        notificationItem("content-1", {
          category: "CONTENT",
          type: "POST_PUBLISHED",
          latestContent: "你的关注发布了新文章",
          unreadCount: 0,
        }),
      ]),
    );
    first.resolve(notificationPage([notificationItem("stale-1")]));
    await flushPromises();

    expect(page.selectedCategory.value).toBe("content");
    expect(page.items.value.map((item) => item.id)).toEqual(["content-1"]);
    expect(page.items.value[0].category).toBe("content");
    expect(page.cursor.value).toBeNull();
    expect(page.hasMore.value).toBe(false);
    expect(listNotifications).toHaveBeenNthCalledWith(2, {
      size: 20,
      category: "CONTENT",
    });
  });

  it("loads more notifications with the next cursor and stops at the end", async () => {
    vi.mocked(listNotifications)
      .mockResolvedValueOnce(notificationPage([notificationItem("notif-1")], "c2"))
      .mockResolvedValueOnce(notificationPage([notificationItem("notif-2")]));

    const page = useNotificationCenterPage();
    await flushPromises();

    await page.loadMore();
    await flushPromises();
    await page.loadMore();

    expect(page.items.value.map((item) => item.id)).toEqual([
      "notif-1",
      "notif-2",
    ]);
    expect(page.hasMore.value).toBe(false);
    expect(listNotifications).toHaveBeenCalledTimes(2);
    expect(listNotifications).toHaveBeenNthCalledWith(2, {
      size: 20,
      cursor: "c2",
    });
  });

  it("marks all notifications as read with duplicate-submit protection", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([
        notificationItem("notif-1"),
        notificationItem("notif-2", { category: "CONTENT" }),
      ]),
    );
    const markAll = deferred<{
      readAll: true;
      readAt: string;
      affectedCount: number;
    }>();
    vi.mocked(markAllNotificationsRead).mockReturnValue(markAll.promise);

    const page = useNotificationCenterPage();
    await flushPromises();

    const first = page.markAllRead();
    const second = page.markAllRead();
    expect(page.submittingMarkAll.value).toBe(true);
    markAll.resolve({
      readAll: true,
      readAt: "2026-07-07T08:20:00Z",
      affectedCount: 2,
    });
    await Promise.all([first, second]);

    expect(markAllNotificationsRead).toHaveBeenCalledTimes(1);
    expect(page.items.value.every((item) => !item.unread)).toBe(true);
    expect(page.unreadCount.value).toBe(0);
    expect(page.breakdown.value?.total).toBe(0);
    expect(page.submittingMarkAll.value).toBe(false);
  });

  it("keeps unread state when marking all notifications fails", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1")]),
    );
    vi.mocked(markAllNotificationsRead).mockRejectedValue(
      new Error("mark all failed"),
    );

    const page = useNotificationCenterPage();
    await flushPromises();

    await page.markAllRead();

    expect(page.items.value[0].unread).toBe(true);
    expect(page.unreadCount.value).toBe(3);
    expect(page.breakdown.value?.total).toBe(3);
    expect(page.actionError.value).toBe("mark all failed");
  });

  it("selects a notification and exposes it as the active detail", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([
        notificationItem("notif-1"),
        notificationItem("notif-2", { unreadCount: 0 }),
      ]),
    );
    vi.mocked(markNotificationRead).mockResolvedValue({
      notificationId: "latest-notif-1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    });

    const page = useNotificationCenterPage();
    await flushPromises();

    expect(page.activeNotification.value).toBeNull();

    await page.selectNotification("notif-1");

    expect(page.selectedGroupKey.value).toBe("notif-1");
    expect(page.activeNotification.value?.id).toBe("notif-1");
  });

  it("optimistically marks the selected unread notification as read", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([
        notificationItem("notif-1", { unreadCount: 2 }),
        notificationItem("notif-2", { unreadCount: 1 }),
      ]),
    );
    vi.mocked(markNotificationRead).mockResolvedValue({
      notificationId: "latest-notif-1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    });

    const page = useNotificationCenterPage();
    await flushPromises();
    // 起始未读总数为 breakdown mock 的 3。
    expect(page.unreadCount.value).toBe(3);

    await page.selectNotification("notif-1");

    expect(markNotificationRead).toHaveBeenCalledWith("latest-notif-1");
    expect(page.items.value[0].unread).toBe(false);
    expect(page.items.value[0].unreadCount).toBe(0);
    // 未读总数按该分组未读数递减：3 - 2 = 1。
    expect(page.unreadCount.value).toBe(1);
  });

  it("does not mark an already-read notification and sends no request", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1", { unreadCount: 0 })]),
    );

    const page = useNotificationCenterPage();
    await flushPromises();

    await page.selectNotification("notif-1");

    expect(page.selectedGroupKey.value).toBe("notif-1");
    expect(markNotificationRead).not.toHaveBeenCalled();
  });

  it("rolls back unread state when single mark-read fails", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1", { unreadCount: 2 })]),
    );
    vi.mocked(markNotificationRead).mockRejectedValue(
      new Error("mark read failed"),
    );

    const page = useNotificationCenterPage();
    await flushPromises();

    await page.selectNotification("notif-1");

    expect(page.items.value[0].unread).toBe(true);
    expect(page.items.value[0].unreadCount).toBe(2);
    expect(page.unreadCount.value).toBe(3);
    expect(page.actionError.value).toBe("mark read failed");
  });

  it("guards against duplicate single mark-read submissions", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1", { unreadCount: 1 })]),
    );
    const markRead = deferred<{
      notificationId: string;
      read: true;
      readAt: string;
    }>();
    vi.mocked(markNotificationRead).mockReturnValue(markRead.promise);

    const page = useNotificationCenterPage();
    await flushPromises();

    const first = page.selectNotification("notif-1");
    const second = page.selectNotification("notif-1");
    expect(page.submittingReadIds.value.has("notif-1")).toBe(true);
    markRead.resolve({
      notificationId: "latest-notif-1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    });
    await Promise.all([first, second]);

    expect(markNotificationRead).toHaveBeenCalledTimes(1);
    expect(page.submittingReadIds.value.has("notif-1")).toBe(false);
  });

  it("refetches unread facts after read when the total was unknown", async () => {
    vi.mocked(listNotifications).mockResolvedValue(
      notificationPage([notificationItem("notif-1", { unreadCount: 1 })]),
    );
    // 首次加载未读事实失败 -> 未读总数未知。
    vi.mocked(getNotificationUnreadCount)
      .mockRejectedValueOnce(new Error("unread count failed"))
      .mockResolvedValueOnce({ unreadCount: 5 });
    vi.mocked(getNotificationUnreadBreakdown)
      .mockRejectedValueOnce(new Error("breakdown failed"))
      .mockResolvedValueOnce({
        total: 5,
        interaction: 5,
        content: 0,
        social: 0,
        system: 0,
        security: 0,
      });
    vi.mocked(markNotificationRead).mockResolvedValue({
      notificationId: "latest-notif-1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    });

    const page = useNotificationCenterPage();
    await flushPromises();
    expect(page.unreadCount.value).toBeNull();

    await page.selectNotification("notif-1");
    await flushPromises();

    // 成功后重拉，而不是本地伪造 0。
    expect(page.unreadCount.value).toBe(5);
  });

  it("clears the active selection when switching category", async () => {
    vi.mocked(listNotifications)
      .mockResolvedValueOnce(notificationPage([notificationItem("notif-1")]))
      .mockResolvedValueOnce(
        notificationPage([
          notificationItem("content-1", { category: "CONTENT" }),
        ]),
      );
    vi.mocked(markNotificationRead).mockResolvedValue({
      notificationId: "latest-notif-1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    });

    const page = useNotificationCenterPage();
    await flushPromises();

    await page.selectNotification("notif-1");
    expect(page.selectedGroupKey.value).toBe("notif-1");

    await page.selectCategory("content");
    await flushPromises();

    expect(page.selectedGroupKey.value).toBeNull();
    expect(page.activeNotification.value).toBeNull();
  });
});
