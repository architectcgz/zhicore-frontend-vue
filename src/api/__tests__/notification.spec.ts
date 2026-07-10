import { beforeEach, describe, expect, it, vi } from "vitest";

import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { ApiError, getAxiosInstance } from "../request";
import {
  getNotificationUnreadBreakdown,
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ListNotificationsResp,
} from "../notification";

vi.mock("../request", async () => {
  const actual = await vi.importActual<typeof import("../request")>(
    "../request",
  );

  return {
    ...actual,
    getAxiosInstance: vi.fn(),
  };
});

vi.mock("@/runtime/localDemoMode", () => ({
  isLocalDemoModeEnabled: vi.fn(() => false),
}));

describe("notification api", () => {
  beforeEach(() => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(false);
    vi.mocked(getAxiosInstance).mockReset();
  });

  it("lists notification groups with cursor, category and unread filters", async () => {
    const response: ListNotificationsResp = {
      items: [
        {
          groupKey: "recipient:1:INTERACTION:POST_LIKED:POST:post_1",
          latestNotificationId: "notif_1",
          type: "POST_LIKED",
          category: "INTERACTION",
          targetType: "POST",
          targetId: "post_1",
          totalCount: 3,
          unreadCount: 2,
          latestTime: "2026-07-07T08:00:00Z",
          latestContent: "Han Meimei 赞了你的文章",
          actorIds: ["user_1"],
          aggregatedContent: {
            title: "新的互动",
          },
        },
      ],
      nextCursor: "cursor-2",
      hasMore: true,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(
      listNotifications({
        cursor: "cursor-1",
        size: 20,
        category: "INTERACTION",
        unreadOnly: true,
      }),
    ).resolves.toEqual(response);

    expect(get).toHaveBeenCalledWith("/v1/notifications", {
      params: {
        cursor: "cursor-1",
        size: 20,
        category: "INTERACTION",
        unreadOnly: true,
      },
    });
  });

  it("serves local demo notifications as API-shaped DTOs without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const page = await listNotifications({ size: 20 });
    const unreadCount = await getNotificationUnreadCount();
    const breakdown = await getNotificationUnreadBreakdown();
    const readAll = await markAllNotificationsRead();

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items[0]).toMatchObject({
      groupKey: expect.any(String),
      latestNotificationId: expect.any(String),
      category: "INTERACTION",
      unreadCount: expect.any(Number),
    });
    expect(unreadCount).toEqual({
      unreadCount: page.items.reduce((sum, item) => sum + item.unreadCount, 0),
    });
    expect(breakdown.total).toBe(unreadCount.unreadCount);
    expect(readAll).toMatchObject({
      readAll: true,
      affectedCount: unreadCount.unreadCount,
    });
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("reads unread total and category breakdown", async () => {
    const unreadCount = { unreadCount: 8 };
    const breakdown = {
      total: 8,
      interaction: 3,
      content: 2,
      social: 1,
      system: 1,
      security: 1,
    };
    const get = vi
      .fn()
      .mockResolvedValueOnce({ data: unreadCount })
      .mockResolvedValueOnce({ data: breakdown });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getNotificationUnreadCount()).resolves.toEqual(unreadCount);
    await expect(getNotificationUnreadBreakdown()).resolves.toEqual(breakdown);

    expect(get).toHaveBeenNthCalledWith(
      1,
      "/v1/notifications/unread-count",
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/v1/notifications/unread/breakdown",
    );
  });

  it("marks a single notification as read by id", async () => {
    const read = {
      notificationId: "notif_1",
      read: true,
      readAt: "2026-07-07T08:15:00Z",
    };
    const post = vi.fn().mockResolvedValueOnce({ data: read });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(markNotificationRead("notif_1")).resolves.toEqual(read);

    expect(post).toHaveBeenCalledWith("/v1/notifications/notif_1/read");
  });

  it("serves a local demo single mark-read response without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    await expect(markNotificationRead("local-demo-notif")).resolves.toMatchObject(
      {
        notificationId: "local-demo-notif",
        read: true,
      },
    );
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("marks all notifications as read", async () => {
    const all = {
      readAll: true,
      readAt: "2026-07-07T08:10:00Z",
      affectedCount: 5,
    };
    const post = vi.fn().mockResolvedValueOnce({ data: all });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(markAllNotificationsRead()).resolves.toEqual(all);

    expect(post).toHaveBeenCalledWith("/v1/notifications/read-all");
  });

  it("does not swallow auth or service errors", async () => {
    const authError = new ApiError("请先登录", { code: 2006, status: 401 });
    const serviceError = new ApiError("服务暂时不可用", {
      code: 1004,
      status: 503,
    });
    const get = vi.fn().mockRejectedValue(authError);
    const post = vi.fn().mockRejectedValue(serviceError);
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getNotificationUnreadCount()).rejects.toBe(authError);
    await expect(markAllNotificationsRead()).rejects.toBe(serviceError);
    await expect(markNotificationRead("notif_1")).rejects.toBe(serviceError);
  });
});
