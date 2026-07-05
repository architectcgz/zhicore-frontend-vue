import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AuthLayout from "@/layouts/AuthLayout.vue";

async function mountAuthLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div>home</div>" },
      },
      {
        path: "/auth/login",
        component: { template: '<section class="login-stub">login</section>' },
      },
    ],
  });

  await router.push("/auth/login");
  await router.isReady();

  return mount(AuthLayout, {
    global: {
      plugins: [router],
    },
  });
}

describe("AuthLayout", () => {
  it("renders a lightweight auth header without the product navigation", async () => {
    const wrapper = await mountAuthLayout();

    expect(wrapper.find(".auth-layout__brand").text()).toContain("知构");
    expect(wrapper.find(".auth-layout__actions").text()).toContain("返回首页");
    expect(wrapper.text()).not.toContain("写作");
    expect(wrapper.text()).not.toContain("热榜");
  });

  it("keeps the auth page content in the layout main region", async () => {
    const wrapper = await mountAuthLayout();

    expect(wrapper.find(".auth-layout__main .login-stub").exists()).toBe(true);
  });
});
