import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";
import appLayoutSource from "@/layouts/AppLayout.vue?raw";

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
        path: "/structure",
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
      "分类",
      "热榜",
      "写作",
    ]);
    expect(overflowDirectLinks.map((link) => link.text())).toEqual([
      "热榜",
      "写作",
    ]);
    expect(wrapper.find(".app-layout__more-summary").text()).toBe("...更多");
  });

  it("links the category navigation item to structure instead of an article detail page", async () => {
    const wrapper = await mountAppLayout();
    const categoryLink = wrapper
      .findAll(".app-layout__nav-link")
      .find((link) => link.text() === "分类");

    expect(categoryLink).toBeDefined();
    expect(categoryLink!.attributes("href")).toBe("/structure");
    expect(
      wrapper
        .findAll(".app-layout__nav-link")
        .some((link) => link.attributes("href") === "/posts/demo"),
    ).toBe(false);
  });

  it("does not keep discovery visually active after navigating to categories", async () => {
    const wrapper = await mountAppLayout({ initialPath: "/structure" });

    expect(
      wrapper
        .findAll(".app-layout__nav-link.router-link-active")
        .map((link) => link.text()),
    ).toEqual(["分类"]);
  });

  it("styles only exact active header navigation links", () => {
    expect(appLayoutSource).not.toContain(
      ".app-layout__nav a.router-link-active",
    );
    expect(appLayoutSource).toContain(
      ".app-layout__nav a.router-link-exact-active",
    );
  });

  it("does not render a home side navigation trigger", async () => {
    const homeWrapper = await mountAppLayout();
    const articleWrapper = await mountAppLayout({ initialPath: "/posts/demo" });

    expect(
      homeWrapper.find('[data-testid="home-support-menu-toggle"]').exists(),
    ).toBe(false);
    expect(
      articleWrapper.find('[data-testid="home-support-menu-toggle"]').exists(),
    ).toBe(false);
  });
});
