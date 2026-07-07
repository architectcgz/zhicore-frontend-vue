import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeMessagesRoutePage from "../HomeMessagesRoutePage.vue";
import HomeMessageDetailRoutePage from "../HomeMessageDetailRoutePage.vue";

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

  return mount(component, {
    global: {
      plugins: [router],
    },
  });
}

describe("HomeMessagesRoutePage", () => {
  it("renders the inbox as desktop master-detail and mobile list-only content", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");

    expect(wrapper.text()).toContain("私信");
    expect(wrapper.text()).not.toContain("本地演示");
    expect(
      wrapper.findAll(".messages-route__conversation").length,
    ).toBeGreaterThan(0);
    expect(wrapper.find(".messages-route__chat").exists()).toBe(true);
    expect(wrapper.find(".messages-route__chat--desktop").exists()).toBe(true);
    expect(wrapper.findAll(".messages-route__message").length).toBeGreaterThan(
      0,
    );
    expect(wrapper.find('a[href="/messages/conv-antigravity"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find(".messages-route__contacts--mobile-list").exists(),
    ).toBe(true);

    const input = wrapper.get('input[aria-label="消息输入"]');
    expect(input.attributes("disabled")).toBeUndefined();
    await input.setValue("可以继续聊这里");
    expect((input.element as HTMLInputElement).value).toBe("可以继续聊这里");

    const readMessage = wrapper
      .findAll(".messages-route__message--mine")
      .find((message) => message.text().includes("可以，我们把冲突提示"));
    expect(
      readMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已读");
  });

  it("sends a local message from the inbox composer", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');
    const sendButton = wrapper.get(".messages-route__send-button");

    expect(sendButton.attributes("disabled")).toBeDefined();

    await input.setValue("我这边已经收到");

    expect(sendButton.attributes("disabled")).toBeUndefined();

    await sendButton.trigger("click");

    const sentMessages = wrapper.findAll(".messages-route__message--mine");
    const newMessage = sentMessages.find((message) =>
      message.text().includes("我这边已经收到"),
    );
    expect(
      newMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已发送");
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("does not send blank local messages", async () => {
    const wrapper = await mountWithRouter(HomeMessagesRoutePage, "/messages");
    const input = wrapper.get('input[aria-label="消息输入"]');
    const sendButton = wrapper.get(".messages-route__send-button");
    const messageCountBeforeSend = wrapper.findAll(
      ".messages-route__message",
    ).length;

    await input.setValue("   ");

    expect(sendButton.attributes("disabled")).toBeDefined();

    await sendButton.trigger("click");

    expect(wrapper.findAll(".messages-route__message")).toHaveLength(
      messageCountBeforeSend,
    );
  });

  it("renders the detail route as desktop master-detail and mobile detail-only content", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );

    expect(wrapper.text()).toContain("Lin");
    expect(wrapper.text()).toContain("你的编辑器体验笔记我收藏了。");
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
    const input = wrapper.get('input[aria-label="消息输入"]');
    expect(input.attributes("disabled")).toBeUndefined();
    await input.setValue("收到，我看看");
    expect((input.element as HTMLInputElement).value).toBe("收到，我看看");
  });

  it("sends a local message from the detail composer", async () => {
    const wrapper = await mountWithRouter(
      HomeMessageDetailRoutePage,
      "/messages/conv-lin",
    );
    const input = wrapper.get('input[aria-label="消息输入"]');
    const sendButton = wrapper.get(".messages-route__send-button");

    await input.setValue("我稍后整理反馈");
    await sendButton.trigger("click");

    const sentMessages = wrapper.findAll(".messages-route__message--mine");
    const newMessage = sentMessages.find((message) =>
      message.text().includes("我稍后整理反馈"),
    );
    expect(
      newMessage
        ?.get(".messages-route__delivery-status")
        .attributes("aria-label"),
    ).toBe("已发送");
    expect((input.element as HTMLInputElement).value).toBe("");
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
  });
});
