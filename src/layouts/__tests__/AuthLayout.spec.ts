import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AuthLayout from "@/layouts/AuthLayout.vue";

async function mountAuthLayout(path = "/auth/login") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div>home</div>" },
      },
      {
        path: "/auth/login",
        name: "Login",
        component: { template: '<section class="login-stub">login</section>' },
      },
      {
        path: "/auth/register",
        name: "Register",
        component: {
          template: '<section class="register-stub">register</section>',
        },
      },
    ],
  });

  await router.push(path);
  await router.isReady();

  return mount(AuthLayout, {
    global: {
      plugins: [router],
    },
  });
}

describe("AuthLayout", () => {
  it("keeps login focused without the registration top navigation", async () => {
    const wrapper = await mountAuthLayout();

    expect(wrapper.find(".auth-layout__header").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("写作");
  });

  it("keeps the auth page content in the layout main region", async () => {
    const wrapper = await mountAuthLayout();

    expect(wrapper.find(".auth-layout__main .login-stub").exists()).toBe(true);
  });

  it("renders the registration top navigation when the register route is active", async () => {
    const wrapper = await mountAuthLayout("/auth/register");

    expect(wrapper.find(".auth-layout__brand").text()).toContain("ZhiCore");
    expect(wrapper.find(".auth-layout__nav").text()).toContain("发现");
    expect(wrapper.find(".auth-layout__post-btn").text()).toContain("写作");
    expect(wrapper.find('[aria-label="消息"]').attributes("href")).toBe(
      "/messages",
    );
    expect(wrapper.find('[aria-label="通知"]').attributes("href")).toBe(
      "/notifications",
    );
    expect(wrapper.find(".auth-layout__main .register-stub").exists()).toBe(
      true,
    );
  });
});
