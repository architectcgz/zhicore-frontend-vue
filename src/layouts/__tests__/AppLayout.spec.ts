import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout(
  options: {
    isLoggedIn?: boolean;
    initialPath?: string;
    logout?: () => void | Promise<void>;
  } = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      {
        path: "/editor",
        component: { template: "<div />" },
        meta: { appShellFlush: true },
      },
      { path: "/explore", component: { template: "<div />" } },
      { path: "/structure", component: { template: "<div />" } },
      { path: "/resources", component: { template: "<div />" } },
      { path: "/about", component: { template: "<div />" } },
      { path: "/messages", component: { template: "<div />" } },
      { path: "/notifications", component: { template: "<div />" } },
      { path: "/auth/login", component: { template: "<div />" } },
    ],
  });

  await router.push(options.initialPath ?? "/");
  await router.isReady();

  const wrapper = mount(AppLayout, {
    props: {
      isLoggedIn: options.isLoggedIn ?? true,
      logout: options.logout ?? (() => undefined),
    },
    global: {
      plugins: [router],
    },
  });

  return { router, wrapper };
}

describe("AppLayout", () => {
  it("mounts successfully with the new design", async () => {
    const { wrapper } = await mountAppLayout();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".app-layout__nav").text()).toContain("发现");
    expect(wrapper.find(".app-layout__post-btn").text()).toContain("写作");
  });

  it("does not expose private message or notification popovers to guests", async () => {
    const { wrapper } = await mountAppLayout({ isLoggedIn: false });

    expect(wrapper.find('button[aria-label="消息"]').exists()).toBe(false);
    expect(wrapper.find('button[aria-label="通知"]').exists()).toBe(false);
    expect(wrapper.find('a[aria-label="消息"]').exists()).toBe(false);
    expect(wrapper.find(".app-layout__badge").exists()).toBe(false);
    expect(wrapper.find('a[aria-label="登录"]').attributes("href")).toBe(
      "/auth/login",
    );
  });

  it("links logged-in users to private inbox pages with local demo unread counts", async () => {
    const { wrapper } = await mountAppLayout();

    expect(wrapper.find('a[aria-label="消息"]').attributes("href")).toBe(
      "/messages",
    );
    expect(wrapper.find('a[aria-label="通知"]').attributes("href")).toBe(
      "/notifications",
    );
    expect(
      wrapper
        .find(".app-layout__actions")
        .findAll(".app-layout__badge")
        .map((item) => item.text()),
    ).toEqual(["2", "3"]);
    expect(
      wrapper
        .find(".app-layout__mobile-nav")
        .findAll(".app-layout__badge")
        .map((item) => item.text()),
    ).toEqual(["2"]);
  });

  it("runs the logout action from mirrored account controls", async () => {
    const logout = vi.fn();
    const { wrapper } = await mountAppLayout({ logout });

    await wrapper.find('button[aria-label="退出登录"]').trigger("click");
    await wrapper
      .findAll('button[aria-label="退出登录"]')
      .at(1)
      ?.trigger("click");

    expect(logout).toHaveBeenCalledTimes(2);
  });

  it("does not render mobile bottom navigation on flush shell pages", async () => {
    const { wrapper } = await mountAppLayout({ initialPath: "/editor" });

    expect(wrapper.find(".app-layout__main--flush").exists()).toBe(true);
    expect(wrapper.find(".app-layout__mobile-nav").exists()).toBe(false);
  });
});
