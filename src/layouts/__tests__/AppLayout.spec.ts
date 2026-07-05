import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { HOME_DISCOVERY_MOBILE_MENU_EVENT } from "@/features/home-discovery";
import AppLayout from "@/layouts/AppLayout.vue";

async function mountAppLayout(
  options: {
    isLoggedIn?: boolean;
    logout?: () => void;
    initialPath?: string;
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

  await router.push(options.initialPath ?? "/");
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

  it("keeps writing available from the overflow navigation menu", async () => {
    const wrapper = await mountAppLayout();

    expect(wrapper.find(".app-layout__more-summary").text()).toBe("...更多");
    expect(wrapper.find(".app-layout__more-menu").text()).toContain("热榜");
    expect(wrapper.find(".app-layout__more-menu").text()).toContain("写作");
    expect(
      wrapper.find('.app-layout__more-menu a[href="/ranking"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('.app-layout__more-menu a[href="/editor"]').exists(),
    ).toBe(true);
  });

  it("keeps the compact mobile navigation contract explicit", async () => {
    const wrapper = await mountAppLayout();
    const primaryLinks = wrapper.findAll(".app-layout__nav-link");
    const overflowDirectLinks = wrapper.findAll(
      ".app-layout__nav-link--overflow-direct",
    );

    expect(primaryLinks.map((link) => link.text())).toEqual([
      "发现",
      "文章",
      "热榜",
      "写作",
    ]);
    expect(overflowDirectLinks.map((link) => link.text())).toEqual([
      "热榜",
      "写作",
    ]);
    expect(wrapper.find(".app-layout__more-summary").text()).toBe("...更多");
  });

  it("shows a home support menu trigger only on the home route", async () => {
    const homeWrapper = await mountAppLayout();
    const articleWrapper = await mountAppLayout({ initialPath: "/posts/demo" });

    expect(
      homeWrapper.find('[data-testid="home-support-menu-toggle"]').exists(),
    ).toBe(true);
    expect(
      articleWrapper.find('[data-testid="home-support-menu-toggle"]').exists(),
    ).toBe(false);
  });

  it("dispatches the home mobile support menu event from the header trigger", async () => {
    const wrapper = await mountAppLayout();
    let dispatched = false;
    const markDispatched = () => {
      dispatched = true;
    };

    window.addEventListener(HOME_DISCOVERY_MOBILE_MENU_EVENT, markDispatched);
    await wrapper
      .get('[data-testid="home-support-menu-toggle"]')
      .trigger("click");
    window.removeEventListener(
      HOME_DISCOVERY_MOBILE_MENU_EVENT,
      markDispatched,
    );

    expect(dispatched).toBe(true);
  });
});
