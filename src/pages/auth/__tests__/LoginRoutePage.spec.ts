import { mount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { login } from "@/api/auth";

import LoginRoutePage from "../LoginRoutePage.vue";

vi.mock("@/api/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/auth")>()),
  login: vi.fn(),
}));

async function mountLoginRoutePage(path = "/auth/login") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/auth/login", name: "Login", component: LoginRoutePage },
      { path: "/auth/register", name: "Register", component: LoginRoutePage },
    ],
  });
  await router.push(path);
  await router.isReady();

  return mount(LoginRoutePage, {
    global: {
      plugins: [createPinia(), router],
    },
  });
}

describe("LoginRoutePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the auth workspace and switches to register mode", async () => {
    const wrapper = await mountLoginRoutePage();

    expect(wrapper.get("h1").text()).toBe("欢迎回来");

    await wrapper.get(".auth-card__switch button").trigger("click");
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("创建账号");
  });

  it("shows a login email validation error before submitting credentials", async () => {
    const wrapper = await mountLoginRoutePage();

    await wrapper.get("#login-email").setValue("not-an-email");
    await wrapper.get("#login-password").setValue("Password123");
    await wrapper.get('form[aria-label="登录"]').trigger("submit");
    await flushPromises();

    expect(login).not.toHaveBeenCalled();
    expect(wrapper.get("#login-email-error").text()).toBe(
      "请输入有效的邮箱地址",
    );
    expect(wrapper.get("#login-email").attributes("aria-invalid")).toBe("true");
  });
});
