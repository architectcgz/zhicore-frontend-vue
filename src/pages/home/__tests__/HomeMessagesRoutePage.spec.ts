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
    expect(wrapper.find("input").exists()).toBe(true);
  });
});
