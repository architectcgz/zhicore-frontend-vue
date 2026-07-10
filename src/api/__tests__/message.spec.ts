import { beforeEach, describe, expect, it, vi } from "vitest";

import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "../request";
import {
  getMessageUnreadCount,
  listConversationMessages,
  listConversations,
  sendConversationMessage,
  type ListConversationsResp,
  type ListMessagesResp,
} from "../message";

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

describe("message api", () => {
  beforeEach(() => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(false);
    vi.mocked(getAxiosInstance).mockReset();
  });

  it("lists conversations with cursor and unread filter params", async () => {
    const response: ListConversationsResp = {
      items: [
        {
          conversationId: "conv_1",
          participantId: "user_1",
          participantName: "Han Meimei",
          participantAvatarInitial: "H",
          lastMessagePreview: "在吗？",
          lastMessageAt: "2026-07-07T08:00:00Z",
          unreadCount: 1,
          participantOnline: true,
        },
      ],
      nextCursor: "cursor-2",
      hasMore: true,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    const result = await listConversations({
      cursor: "cursor-1",
      size: 20,
      unreadOnly: true,
    });

    expect(get).toHaveBeenCalledWith("/v1/conversations", {
      params: { cursor: "cursor-1", size: 20, unreadOnly: true },
    });
    expect(result).toEqual(response);
  });

  it("lists conversation messages with an escaped conversation id path", async () => {
    const response: ListMessagesResp = {
      items: [
        {
          messageId: "msg_1",
          direction: "incoming",
          content: "hi",
          sentAt: "2026-07-07T08:00:00Z",
          read: true,
        },
      ],
      hasMore: false,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await listConversationMessages({ conversationId: "conv/with space" });

    expect(get).toHaveBeenCalledWith(
      "/v1/conversations/conv%2Fwith%20space/messages",
      { params: { cursor: undefined, size: undefined } },
    );
  });

  it("sends a message to the escaped conversation path", async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        messageId: "msg_2",
        conversationId: "conv_1",
        direction: "outgoing",
        content: "hello",
        sentAt: "2026-07-07T08:01:00Z",
        read: false,
      },
    });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await sendConversationMessage({ conversationId: "conv_1", content: "hello" });

    expect(post).toHaveBeenCalledWith("/v1/conversations/conv_1/messages", {
      content: "hello",
    });
  });

  it("serves local demo conversations as API-shaped DTOs without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const conversations = await listConversations();

    expect(conversations.items.length).toBeGreaterThan(0);
    expect(conversations.items[0]).toMatchObject({
      conversationId: expect.any(String),
      participantName: expect.any(String),
      lastMessagePreview: expect.any(String),
      lastMessageAt: expect.any(String),
      unreadCount: expect.any(Number),
      participantOnline: expect.any(Boolean),
    });
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("serves local demo messages for a known conversation without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const thread = await listConversationMessages({
      conversationId: "conv-antigravity",
    });

    expect(thread.items.length).toBeGreaterThan(0);
    expect(thread.items[0]).toMatchObject({
      messageId: expect.any(String),
      direction: expect.stringMatching(/incoming|outgoing/),
      content: expect.any(String),
      sentAt: expect.any(String),
      read: expect.any(Boolean),
    });
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("returns an empty demo thread for an unknown conversation without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const thread = await listConversationMessages({ conversationId: "missing" });

    expect(thread.items).toHaveLength(0);
    expect(thread.hasMore).toBe(false);
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("serves a local demo unread count without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const result = await getMessageUnreadCount();

    expect(result.unreadCount).toBeGreaterThan(0);
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });

  it("echoes a local demo sent message as an API-shaped DTO without axios", async () => {
    vi.mocked(isLocalDemoModeEnabled).mockReturnValue(true);

    const result = await sendConversationMessage({
      conversationId: "conv-antigravity",
      content: "本地发送",
    });

    expect(result).toMatchObject({
      conversationId: "conv-antigravity",
      direction: "outgoing",
      content: "本地发送",
      read: false,
    });
    expect(result.messageId).toEqual(expect.any(String));
    expect(getAxiosInstance).not.toHaveBeenCalled();
  });
});
