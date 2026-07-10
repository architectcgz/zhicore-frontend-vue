import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import {
  getMessageUnreadCount,
  listConversationMessages,
  listConversations,
  sendConversationMessage,
  type ConversationSummaryResp,
  type ListConversationsResp,
  type ListMessagesResp,
  type MessageResp,
  type SendMessageResp,
} from "@/api/message";

import HomeMessagesRoutePage from "../HomeMessagesRoutePage.vue";
import HomeMessageDetailRoutePage from "../HomeMessageDetailRoutePage.vue";

vi.mock("@/api/message", () => ({
  listConversations: vi.fn(),
  listConversationMessages: vi.fn(),
  getMessageUnreadCount: vi.fn(),
  sendConversationMessage: vi.fn(),
}));

const mockedListConversations = vi.mocked(listConversations);
const mockedListMessages = vi.mocked(listConversationMessages);
const mockedUnreadCount = vi.mocked(getMessageUnreadCount);
const mockedSendMessage = vi.mocked(sendConversationMessage);

function conversationSummary(
  overrides: Partial<ConversationSummaryResp> = {},
): ConversationSummaryResp {
  return {
    conversationId: "conv-antigravity",
    participantId: "user-antigravity",
    participantName: "Antigravity",
    participantAvatarInitial: "AI",
    lastMessagePreview: "编辑器保存冲突那篇我看完了。",
    lastMessageAt: "2026-07-07T16:02:00.000Z",
    unreadCount: 2,
    participantOnline: true,
    ...overrides,
  };
}

function conversationsResp(
  items: ConversationSummaryResp[],
): ListConversationsResp {
  return { items, hasMore: false };
}

function messageResp(overrides: Partial<MessageResp> = {}): MessageResp {
  return {
    messageId: "msg-1",
    direction: "outgoing",
    content: "可以，我们把冲突提示放在正文保存状态旁边。",
    sentAt: "2026-07-07T16:02:00.000Z",
    read: true,
    ...overrides,
  };
}

function messagesResp(items: MessageResp[]): ListMessagesResp {
  return { items, hasMore: false };
}

function sentResp(overrides: Partial<SendMessageResp> = {}): SendMessageResp {
  return {
    messageId: "msg-sent",
    conversationId: "conv-antigravity",
    direction: "outgoing",
    content: "我这边已经收到",
    sentAt: "2026-07-07T16:05:00.000Z",
    read: false,
    ...overrides,
  };
}

async function mountWithRouter(
  component: typeof HomeMessagesRoutePage | typeof HomeMessageDetailRoutePage,
  path: string,
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/messages", component: HomeMessagesRoutePage },
      {
        path: "/messages/:conversationId",
        component: HomeMessageDetailRoutePage,
      },
    ],
  });

  await router.push(path);
  await router.isReady();

  const wrapper = mount(component, {
    global: {
      plugins: [router],
    },
  });
  // 页面挂载即触发会话列表和线程的异步加载，等待所有请求结算后再断言。
  await flushPromises();

  return wrapper;
}

beforeEach(() => {
  mockedListConversations.mockReset();
  mockedListMessages.mockReset();
  mockedUnreadCount.mockReset();
  mockedSendMessage.mockReset();

  mockedListConversations.mockResolvedValue(
    conversationsResp([
      conversationSummary(),
      conversationSummary({
        conversationId: "conv-lin",
        participantId: "user-lin",
        participantName: "Lin",
        participantAvatarInitial: "林",
        lastMessagePreview: "你的编辑器体验笔记我收藏了。",
        lastMessageAt: "2026-07-07T14:12:00.000Z",
        unreadCount: 0,
        participantOnline: false,
      }),
    ]),
  );
  mockedUnreadCount.mockResolvedValue({ unreadCount: 2 });
  mockedListMessages.mockResolvedValue(messagesResp([messageResp()]));
  mockedSendMessage.mockResolvedValue(sentResp());
});

describe("HomeMessagesRoutePage", () => {
  it("renders the inbox conversation list and inline desktop thread after load", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    expect(wrapper.text()).toContain("私信");
    expect(
      wrapper.findAll(".messages-route__conversation").length,
    ).toBeGreaterThan(0);
    expect(wrapper.find(".messages-route__chat--desktop").exists()).toBe(true);
    expect(wrapper.findAll(".messages-route__message").length).toBeGreaterThan(
      0,
    );
    // autoSelectFirst 默认选中第一条会话。
    expect(wrapper.find('a[href="/messages/conv-antigravity"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find(".messages-route__contacts--mobile-list").exists(),
    ).toBe(true);

    const readMessage = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("可以，我们把冲突提示"));
    expect(
      readMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已读");
  });

  it("shows an error state with retry when the conversation list fails", async () => {
    mockedListConversations.mockRejectedValueOnce(new Error("网络错误"));

    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    const errorBox = wrapper.get(".messages-route__list-error");
    expect(errorBox.attributes("role")).toBe("alert");
    expect(errorBox.text()).toContain("网络错误");
    expect(errorBox.find("button").text()).toBe("重试");
  });

  it("sends a message through the API and shows optimistic then sent state", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');
    const sendButton = wrapper.get(".messages-route__send-button");

    expect(sendButton.attributes("disabled")).toBeDefined();

    await input.setValue("我这边已经收到");
    expect(sendButton.attributes("disabled")).toBeUndefined();

    await sendButton.trigger("click");
    await flushPromises();

    expect(mockedSendMessage).toHaveBeenCalledWith({
      conversationId: "conv-antigravity",
      content: "我这边已经收到",
    });

    const newMessage = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("我这边已经收到"));
    expect(
      newMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已发送");
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("keeps a failed message with a retry action when send fails", async () => {
    mockedSendMessage.mockRejectedValueOnce(new Error("发送失败"));

    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');

    await input.setValue("这条会失败");
    await wrapper.get(".messages-route__send-button").trigger("click");
    await flushPromises();

    const failedMessage = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("这条会失败"));
    expect(
      failedMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("发送失败");
    expect(failedMessage?.find(".messages-route__message-retry").exists()).toBe(
      true,
    );

    // 重试成功后转为已发送。
    mockedSendMessage.mockResolvedValueOnce(sentResp({ content: "这条会失败" }));
    await failedMessage?.get(".messages-route__message-retry").trigger("click");
    await flushPromises();

    const retried = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("这条会失败"));
    expect(
      retried?.get(".messages-route__delivery-status").attributes("aria-label"),
    ).toBe("已发送");
  });

  it("does not send blank messages", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');
    const sendButton = wrapper.get(".messages-route__send-button");
    const countBefore = wrapper.findAll(".messages-route__message").length;

    await input.setValue("   ");
    expect(sendButton.attributes("disabled")).toBeDefined();

    await sendButton.trigger("click");
    await flushPromises();

    expect(mockedSendMessage).not.toHaveBeenCalled();
    expect(wrapper.findAll(".messages-route__message")).toHaveLength(
      countBefore,
    );
  });

  it("opens the emoji picker and inserts an emoji into the draft", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');

    expect(wrapper.find('[aria-label="表情"]').exists()).toBe(false);

    await wrapper.get('button[aria-label="选择表情"]').trigger("click");

    const emojiPicker = wrapper.get('[aria-label="表情"]');
    expect(emojiPicker.text()).toContain("😊");

    await emojiPicker.get('button[aria-label="插入 😊"]').trigger("click");

    expect((input.element as HTMLInputElement).value).toBe("😊");
    expect(wrapper.find('[aria-label="表情"]').exists()).toBe(false);
  });

  it("opens conversation management actions from the inbox chat header", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    expect(wrapper.find('[role="menu"]').exists()).toBe(false);

    await wrapper.get('button[aria-label="更多操作"]').trigger("click");

    const menu = wrapper.get('[role="menu"]');
    expect(menu.text()).toContain("拉黑用户");
    expect(menu.text()).toContain("举报对话");
    expect(menu.text()).toContain("删除会话");

    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
  });
});

describe("HomeMessageDetailRoutePage", () => {
  it("renders the routed conversation as active detail", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );

    expect(wrapper.text()).toContain("Lin");
    expect(wrapper.find(".messages-route__contacts--desktop").exists()).toBe(
      true,
    );
    expect(
      wrapper
        .find(
          'a.messages-route__conversation--active[href="/messages/conv-lin"]',
        )
        .exists(),
    ).toBe(true);
    expect(wrapper.find(".messages-route__chat--mobile-detail").exists()).toBe(
      true,
    );
    expect(wrapper.findAll(".messages-route__message").length).toBeGreaterThan(
      0,
    );
  });

  it("shows the not-found empty state for an unknown conversation id", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-unknown",
    );

    expect(wrapper.find(".messages-route__empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("找不到私信会话");
  });

  it("sends a message from the detail composer", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );
    const input = wrapper.get('input[aria-label="消息输入"]');

    mockedSendMessage.mockResolvedValueOnce(
      sentResp({ conversationId: "conv-lin", content: "我稍后整理反馈" }),
    );

    await input.setValue("我稍后整理反馈");
    await wrapper.get(".messages-route__send-button").trigger("click");
    await flushPromises();

    expect(mockedSendMessage).toHaveBeenCalledWith({
      conversationId: "conv-lin",
      content: "我稍后整理反馈",
    });

    const newMessage = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("我稍后整理反馈"));
    expect(
      newMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已发送");
    expect((input.element as HTMLInputElement).value).toBe("");
  });
});
