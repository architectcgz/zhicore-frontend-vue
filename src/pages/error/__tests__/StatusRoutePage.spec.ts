import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import StatusRoutePage from "@/pages/error/StatusRoutePage.vue";

async function mountStatusPage(status: number) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div />" },
      },
      {
        path: "/auth/login",
        component: { template: "<div />" },
      },
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
  it("shows a session recovery path for 401 errors", async () => {
    const wrapper = await mountStatusPage(401);

    expect(wrapper.text()).toContain("登录状态已失效");
    expect(wrapper.text()).toContain("重新登录");
    expect(
      wrapper.find(".status-page__primary-action").attributes("href"),
    ).toBe("/auth/login");
  });

  it("shows a home recovery path for 404 errors", async () => {
    const wrapper = await mountStatusPage(404);

    expect(wrapper.text()).toContain("页面不存在");
    expect(wrapper.text()).toContain("返回发现页");
    expect(
      wrapper.find(".status-page__primary-action").attributes("href"),
    ).toBe("/");
  });

  it("falls back to 500 copy when status is not finite", async () => {
    const wrapper = await mountStatusPage(Number.NaN);

    expect(wrapper.text()).toContain("页面暂时不可用");
    expect(wrapper.text()).toContain("稍后重试");
  });
});
