import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout(options: { isLoggedIn?: boolean } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/editor", component: { template: "<div />" } },
      { path: "/explore", component: { template: "<div />" } },
      { path: "/structure", component: { template: "<div />" } },
      { path: "/resources", component: { template: "<div />" } },
      { path: "/about", component: { template: "<div />" } },
      { path: "/messages", component: { template: "<div />" } },
      { path: "/notifications", component: { template: "<div />" } },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(AppLayout, {
    props: {
      isLoggedIn: options.isLoggedIn ?? true,
      logout: () => undefined,
    },
    global: {
      plugins: [router],
    },
  });
}

describe("AppLayout", () => {
  it("mounts successfully with the new design", async () => {
    const wrapper = await mountAppLayout();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".app-layout__nav").text()).toContain("发现");
    expect(wrapper.find(".app-layout__post-btn").text()).toContain("写作");
  });

  it("does not expose private message or notification popovers to guests", async () => {
    const wrapper = await mountAppLayout({ isLoggedIn: false });

    expect(wrapper.find('button[aria-label="消息"]').exists()).toBe(false);
    expect(wrapper.find('button[aria-label="通知"]').exists()).toBe(false);
    expect(wrapper.find(".app-layout__badge").exists()).toBe(false);
  });

  it("links logged-in users to private inbox pages with local demo unread counts", async () => {
    const wrapper = await mountAppLayout();

    expect(wrapper.find('a[aria-label="消息"]').attributes("href")).toBe(
      "/messages",
    );
    expect(wrapper.find('a[aria-label="通知"]').attributes("href")).toBe(
      "/notifications",
    );
    expect(
      wrapper.findAll(".app-layout__badge").map((item) => item.text()),
    ).toEqual(["2", "3"]);
  });
});
