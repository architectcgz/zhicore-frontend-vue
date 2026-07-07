import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import StatusRoutePage from "@/pages/error/StatusRoutePage.vue";

async function mountStatusPage(status: number) {
  const EmptyRoute = { template: "<div />" };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: EmptyRoute,
      },
      { path: "/auth/login", component: EmptyRoute },
      { path: "/about", component: EmptyRoute },
      { path: "/community", component: EmptyRoute },
      { path: "/explore", component: EmptyRoute },
      { path: "/messages", component: EmptyRoute },
      { path: "/resources", component: EmptyRoute },
      { path: "/search", component: EmptyRoute },
    ],
  });

  await router.push("/");
  await router.isReady();

  return mount(StatusRoutePage, {
    props: { status },
    global: {
      plugins: [router],
    },
  });
}

describe("StatusRoutePage", () => {
  it("shows the designed bad request state for 400 errors", async () => {
    const wrapper = await mountStatusPage(400);

    expect(wrapper.text()).toContain("请求无效");
    expect(wrapper.text()).toContain("Bad Request");
    expect(
      wrapper.find(".status-page__primary-action").attributes("href"),
    ).toBe("/");
  });

  it("shows the designed unauthorized state for 401 errors", async () => {
    const wrapper = await mountStatusPage(401);

    expect(wrapper.text()).toContain("未授权访问");
    expect(wrapper.text()).toContain("Unauthorized");
    expect(
      wrapper.find(".status-page__primary-action").attributes("href"),
    ).toBe("/auth/login");
    expect(wrapper.text()).not.toContain("a8f3d9e2");
  });

  it("shows the designed not found state for 404 errors", async () => {
    const wrapper = await mountStatusPage(404);

    expect(wrapper.text()).toContain("页面未找到");
    expect(wrapper.text()).toContain("Not Found");
    expect(
      wrapper.find(".status-page__primary-action").attributes("href"),
    ).toBe("/");
  });

  it("falls back to 500 copy when status is not finite", async () => {
    const wrapper = await mountStatusPage(Number.NaN);

    expect(wrapper.text()).toContain("服务器错误");
    expect(wrapper.text()).toContain("稍后再试");
    expect(wrapper.text()).not.toContain("已记录此错误");
  });
});
