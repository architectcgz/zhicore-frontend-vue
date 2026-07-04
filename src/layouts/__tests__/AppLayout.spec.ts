import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout(
  options: {
    isLoggedIn?: boolean;
    logout?: () => void;
  } = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div />" },
      },
      {
        path: "/editor",
        component: { template: "<div />" },
      },
      {
        path: "/posts/demo",
        component: { template: "<div />" },
      },
      {
        path: "/ranking",
        component: { template: "<div />" },
      },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(AppLayout, {
    props: {
      isLoggedIn: options.isLoggedIn ?? true,
      logout: options.logout ?? (() => undefined),
    },
    global: {
      plugins: [router],
    },
  });
}

describe("AppLayout", () => {
  it("keeps writing in the main navigation without duplicating a write article action", async () => {
    const wrapper = await mountAppLayout();

    expect(wrapper.find(".app-layout__nav").text()).toContain("写作");
    expect(wrapper.find(".app-layout__actions").text()).not.toContain("写文章");
  });

  it("shows the login action instead of logout for anonymous users", async () => {
    const wrapper = await mountAppLayout({ isLoggedIn: false });

    expect(wrapper.find(".app-layout__actions").text()).toContain("登录");
    expect(wrapper.find(".app-layout__actions").text()).not.toContain("退出");
    expect(wrapper.find(".app-layout__actions a").attributes("href")).toBe(
      "/auth/login",
    );
  });
});
