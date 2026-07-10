import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getMessageUnreadCount,
  listConversations,
  type ConversationSummaryResp,
  type ListConversationsResp,
} from "@/api/message";

import { useMessageCenterPage } from "../composables/useMessageCenterPage";

vi.mock("@/api/message", () => ({
  getMessageUnreadCount: vi.fn(),
  listConversations: vi.fn(),
  listConversationMessages: vi.fn(),
  sendConversationMessage: vi.fn(),
}));

function conversationSummary(
  conversationId: string,
  overrides: Partial<ConversationSummaryResp> = {},
): ConversationSummaryResp {
  return {
    conversationId,
    participantId: `user-${conversationId}`,
    participantName: `联系人 ${conversationId}`,
    participantAvatarInitial: "联",
    lastMessagePreview: "最近一条消息",
    lastMessageAt: "2026-07-07T16:00:00.000Z",
    unreadCount: 2,
    participantOnline: true,
    ...overrides,
  };
}

function conversationPage(
  items: ConversationSummaryResp[],
  nextCursor?: string,
): ListConversationsResp {
  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
    hasMore: Boolean(nextCursor),
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

describe("useMessageCenterPage", () => {
  beforeEach(() => {
    vi.mocked(listConversations).mockReset();
    vi.mocked(getMessageUnreadCount).mockReset();
    vi.mocked(getMessageUnreadCount).mockResolvedValue({ unreadCount: 2 });
  });

  it("loads conversations into success state with mapped view models", async () => {
    vi.mocked(listConversations).mockResolvedValue(
      conversationPage([conversationSummary("conv-a")]),
    );

    const page = useMessageCenterPage();
    await flushPromises();

    expect(page.status.value).toBe("success");
    expect(page.conversations.value).toHaveLength(1);
    expect(page.conversations.value[0].id).toBe("conv-a");
    expect(page.conversations.value[0].participantInitial).toBe("联");
    expect(page.unreadCount.value).toBe(2);
  });

  it("marks an empty conversation list as empty, not error", async () => {
    vi.mocked(listConversations).mockResolvedValue(conversationPage([]));

    const page = useMessageCenterPage();
    await flushPromises();

    expect(page.status.value).toBe("empty");
    expect(page.conversations.value).toHaveLength(0);
  });

  it("surfaces a recoverable error when the list request fails", async () => {
    vi.mocked(listConversations).mockRejectedValue(new Error("网络异常"));

    const page = useMessageCenterPage();
    await flushPromises();

    expect(page.status.value).toBe("error");
    expect(page.error.value).toBe("网络异常");
    expect(page.conversations.value).toHaveLength(0);
  });

  it("keeps conversations visible when only the unread summary fails", async () => {
    vi.mocked(listConversations).mockResolvedValue(
      conversationPage([conversationSummary("conv-a")]),
    );
    vi.mocked(getMessageUnreadCount).mockRejectedValue(new Error("摘要失败"));

    const page = useMessageCenterPage();
    await flushPromises();

    // 未读摘要失败不拖垮会话列表：列表照常成功，未读数降级为 null。
    expect(page.status.value).toBe("success");
    expect(page.conversations.value).toHaveLength(1);
    expect(page.unreadCount.value).toBeNull();
  });

  it("auto-selects the first conversation only when autoSelectFirst is enabled", async () => {
    vi.mocked(listConversations).mockResolvedValue(
      conversationPage([
        conversationSummary("conv-a"),
        conversationSummary("conv-b"),
      ]),
    );

    const withoutAuto = useMessageCenterPage();
    await flushPromises();
    expect(withoutAuto.activeConversationId.value).toBeNull();

    const withAuto = useMessageCenterPage({ autoSelectFirst: true });
    await flushPromises();
    expect(withAuto.activeConversationId.value).toBe("conv-a");
    expect(withAuto.activeConversation.value?.id).toBe("conv-a");
  });

  it("appends the next page and stops when the cursor is exhausted", async () => {
    vi.mocked(listConversations)
      .mockResolvedValueOnce(
        conversationPage([conversationSummary("conv-a")], "1"),
      )
      .mockResolvedValueOnce(conversationPage([conversationSummary("conv-b")]));

    const page = useMessageCenterPage();
    await flushPromises();
    expect(page.canLoadMore.value).toBe(true);

    await page.loadMore();
    await flushPromises();

    expect(page.conversations.value.map((item) => item.id)).toEqual([
      "conv-a",
      "conv-b",
    ]);
    expect(page.hasMore.value).toBe(false);
    expect(page.canLoadMore.value).toBe(false);
  });

  it("discards a stale first-page response after a newer reload", async () => {
    const first = deferred<ListConversationsResp>();
    const second = deferred<ListConversationsResp>();
    vi.mocked(listConversations)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const page = useMessageCenterPage();
    // 触发第二次加载，使第一次响应过期。
    void page.retry();

    second.resolve(conversationPage([conversationSummary("conv-new")]));
    await flushPromises();
    first.resolve(conversationPage([conversationSummary("conv-stale")]));
    await flushPromises();

    // 过期的首次响应不能覆盖较新的列表。
    expect(page.conversations.value.map((item) => item.id)).toEqual([
      "conv-new",
    ]);
  });
});
