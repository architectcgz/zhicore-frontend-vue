import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import {
  getMessageUnreadCount,
  listConversationMessages,
  listConversations,
  markConversationRead,
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
  markConversationRead: vi.fn(),
}));

const mockedListConversations = vi.mocked(listConversations);
const mockedListMessages = vi.mocked(listConversationMessages);
const mockedUnreadCount = vi.mocked(getMessageUnreadCount);
const mockedMarkRead = vi.mocked(markConversationRead);
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
      plugins: [createPinia(), router],
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
  mockedMarkRead.mockReset();
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
  it("renders the conversation list without auto-opening any conversation", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    expect(wrapper.text()).toContain("私信");
    expect(
      wrapper.findAll(".messages-route__conversation").length,
    ).toBeGreaterThan(0);
    // 每条会话仍是跳转到详情路由的链接，点击后才进入具体会话。
    expect(wrapper.find('a[href="/messages/conv-antigravity"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find(".messages-route__contacts--mobile-list").exists(),
    ).toBe(true);

    // 默认不选中任何会话：右侧展示空态占位，不加载线程、不消费未读。
    expect(wrapper.find(".messages-route__no-selection").exists()).toBe(true);
    expect(wrapper.find(".messages-route__message").exists()).toBe(false);
    expect(wrapper.text()).toContain("选择一个会话");
    // 没有选中会话时不应触发线程加载。
    expect(mockedListMessages).not.toHaveBeenCalled();
  });

  it("shows an error state with retry when the conversation list fails", async () => {
    mockedListConversations.mockRejectedValueOnce(new Error("网络错误"));

    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    const errorBox = wrapper.get(".messages-route__list-error");
    expect(errorBox.attributes("role")).toBe("alert");
    expect(errorBox.text()).toContain("网络错误");
    expect(errorBox.find("button").text()).toBe("重试");
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

  it("does not send blank messages", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );
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

  it("keeps a failed message with a retry action when send fails", async () => {
    mockedSendMessage.mockRejectedValueOnce(new Error("发送失败"));

    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );
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
    mockedSendMessage.mockResolvedValueOnce(
      sentResp({ conversationId: "conv-lin", content: "这条会失败" }),
    );
    await failedMessage?.get(".messages-route__message-retry").trigger("click");
    await flushPromises();

    const retried = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("这条会失败"));
    expect(
      retried?.get(".messages-route__delivery-status").attributes("aria-label"),
    ).toBe("已发送");
  });

  it("opens the emoji picker and inserts an emoji into the draft", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );
    const input = wrapper.get('input[aria-label="消息输入"]');

    expect(wrapper.find('[aria-label="表情"]').exists()).toBe(false);

    await wrapper.get('button[aria-label="选择表情"]').trigger("click");

    const emojiPicker = wrapper.get('[aria-label="表情"]');
    expect(emojiPicker.text()).toContain("😊");

    await emojiPicker.get('button[aria-label="插入 😊"]').trigger("click");

    expect((input.element as HTMLInputElement).value).toBe("😊");
    expect(wrapper.find('[aria-label="表情"]').exists()).toBe(false);
  });

  it("opens conversation management actions from the detail chat header", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );

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

  // 线程加载可见后才标记已读：符合 message 设计文档「线程进入可见状态后调用标记已读」。
  // conv-antigravity 摘要有 2 条未读，线程历史加载成功后徽标应清零、并真正调用 markConversationRead。
  it("marks the conversation read only after its thread becomes visible", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-antigravity",
    );

    // 线程已加载可见（beforeEach 默认 listMessages 立即结算），既读被触发。
    expect(mockedMarkRead).toHaveBeenCalledWith({
      conversationId: "conv-antigravity",
    });
    // 既读后该会话行的未读徽标清零，列表里不再出现该会话的未读数。
    const activeRow = wrapper.get(
      'a[href="/messages/conv-antigravity"]',
    );
    expect(
      activeRow.find(".messages-route__conversation-badge").exists(),
    ).toBe(false);
  });

  // 线程仍在加载（未进入可见状态）时不得提前清零：徽标保留真实未读，既读不触发。
  // 这正是原 bug 的反例——选中即清零会让加载中/失败态也误消费未读。
  it("keeps the unread badge while the thread is still loading", async () => {
    // 让线程历史请求悬挂，模拟线程尚未进入可见状态。
    let resolveThread!: (value: ListMessagesResp) => void;
    mockedListMessages.mockReturnValueOnce(
      new Promise<ListMessagesResp>((resolve) => {
        resolveThread = resolve;
      }),
    );

    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-antigravity",
    );

    // 会话列表已 hydrate（unreadCount: 2），但线程仍在 loading，既读不应触发。
    expect(mockedMarkRead).not.toHaveBeenCalled();
    const activeRow = wrapper.get('a[href="/messages/conv-antigravity"]');
    expect(
      activeRow.get(".messages-route__conversation-badge").text(),
    ).toBe("2");

    // 线程结算进入可见态后，既读才补触发。
    resolveThread(messagesResp([messageResp()]));
    await flushPromises();
    expect(mockedMarkRead).toHaveBeenCalledWith({
      conversationId: "conv-antigravity",
    });
  });
});
