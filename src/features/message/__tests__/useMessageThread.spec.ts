import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import {
  listConversationMessages,
  sendConversationMessage,
  type ListMessagesResp,
  type MessageResp,
  type SendMessageResp,
} from "@/api/message";

import { useMessageThread } from "../composables/useMessageThread";

vi.mock("@/api/message", () => ({
  getMessageUnreadCount: vi.fn(),
  listConversations: vi.fn(),
  listConversationMessages: vi.fn(),
  sendConversationMessage: vi.fn(),
}));

function message(
  messageId: string,
  overrides: Partial<MessageResp> = {},
): MessageResp {
  return {
    messageId,
    direction: "incoming",
    content: "历史消息",
    sentAt: "2026-07-07T16:00:00.000Z",
    read: true,
    ...overrides,
  };
}

function messagePage(
  items: MessageResp[],
  nextCursor?: string,
): ListMessagesResp {
  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
    hasMore: Boolean(nextCursor),
  };
}

function sentReceipt(
  conversationId: string,
  content: string,
): SendMessageResp {
  return {
    messageId: `receipt-${content}`,
    conversationId,
    direction: "outgoing",
    content,
    sentAt: "2026-07-07T16:05:00.000Z",
    read: false,
  };
}

describe("useMessageThread", () => {
  beforeEach(() => {
    vi.mocked(listConversationMessages).mockReset();
    vi.mocked(sendConversationMessage).mockReset();
  });

  it("stays idle without a conversation id and loads on selection", async () => {
    const conversationId = ref<string | null>(null);
    vi.mocked(listConversationMessages).mockResolvedValue(
      messagePage([message("msg-1")]),
    );

    const thread = useMessageThread(conversationId);
    await flushPromises();
    expect(thread.status.value).toBe("idle");
    expect(listConversationMessages).not.toHaveBeenCalled();

    conversationId.value = "conv-a";
    await flushPromises();
    expect(thread.status.value).toBe("success");
    expect(thread.messages.value).toHaveLength(1);
  });

  it("marks an empty history as empty state", async () => {
    vi.mocked(listConversationMessages).mockResolvedValue(messagePage([]));

    const thread = useMessageThread(() => "conv-a");
    await flushPromises();

    expect(thread.status.value).toBe("empty");
  });

  it("optimistically appends a sending message then swaps to the receipt on success", async () => {
    vi.mocked(listConversationMessages).mockResolvedValue(messagePage([]));
    vi.mocked(sendConversationMessage).mockImplementation((input) =>
      Promise.resolve(sentReceipt(input.conversationId, input.content)),
    );

    const thread = useMessageThread(() => "conv-a");
    await flushPromises();

    thread.draft.value = "你好";
    const sending = thread.send();
    // 乐观追加：立即出现一条 sending 消息，草稿清空。
    expect(thread.messages.value).toHaveLength(1);
    expect(thread.messages.value[0].deliveryState).toBe("sending");
    expect(thread.draft.value).toBe("");

    await sending;
    await flushPromises();

    // 成功后回执替换本地消息，转为已发送。
    expect(thread.messages.value).toHaveLength(1);
    expect(thread.messages.value[0].id).toBe("receipt-你好");
    expect(thread.messages.value[0].deliveryState).toBe("sent");
    expect(thread.sending.value).toBe(false);
  });

  it("marks a failed send as failed and retries it to success", async () => {
    vi.mocked(listConversationMessages).mockResolvedValue(messagePage([]));
    vi.mocked(sendConversationMessage).mockRejectedValueOnce(
      new Error("发送失败"),
    );

    const thread = useMessageThread(() => "conv-a");
    await flushPromises();

    thread.draft.value = "重试消息";
    await thread.send();
    await flushPromises();

    // 失败：本地消息保留并标记 failed，输入不丢失。
    expect(thread.messages.value).toHaveLength(1);
    const failedId = thread.messages.value[0].id;
    expect(thread.messages.value[0].deliveryState).toBe("failed");
    expect(thread.messages.value[0].text).toBe("重试消息");
    expect(thread.error.value).toBe("发送失败");

    // 重试成功后转为已发送回执。
    vi.mocked(sendConversationMessage).mockResolvedValueOnce(
      sentReceipt("conv-a", "重试消息"),
    );
    await thread.retryMessage(failedId);
    await flushPromises();

    expect(thread.messages.value).toHaveLength(1);
    expect(thread.messages.value[0].deliveryState).toBe("sent");
  });

  it("does not send blank drafts", async () => {
    vi.mocked(listConversationMessages).mockResolvedValue(messagePage([]));

    const thread = useMessageThread(() => "conv-a");
    await flushPromises();

    thread.draft.value = "   ";
    expect(thread.canSend.value).toBe(false);
    await thread.send();

    expect(sendConversationMessage).not.toHaveBeenCalled();
    expect(thread.messages.value).toHaveLength(0);
  });

  it("clears the thread and returns to idle when the conversation is deselected", async () => {
    vi.mocked(listConversationMessages).mockResolvedValue(
      messagePage([message("msg-1")]),
    );
    const conversationId = ref<string | null>("conv-a");

    const thread = useMessageThread(conversationId);
    await flushPromises();
    expect(thread.messages.value).toHaveLength(1);

    conversationId.value = null;
    await flushPromises();

    expect(thread.status.value).toBe("idle");
    expect(thread.messages.value).toHaveLength(0);
  });
});
