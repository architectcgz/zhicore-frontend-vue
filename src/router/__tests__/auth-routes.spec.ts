import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import App from "@/App.vue";
import { routes } from "@/router";
import { authRoutes } from "@/router/routes/authRoutes";

vi.mock("@/api/auth", () => ({
  getCsrfToken: vi.fn().mockRejectedValue(new Error("No test session")),
  getProfile: vi.fn(),
  login: vi.fn(),
  refreshSession: vi.fn(),
}));

describe("auth routes", () => {
  it("renders login through the auth layout shell", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: authRoutes,
    });

    const resolved = router.resolve("/auth/login");

    expect(resolved.matched).toHaveLength(2);
    expect(resolved.matched.at(0)?.path).toBe("/auth");
    expect(resolved.matched.some((route) => route.name === "Login")).toBe(true);
  });

  it("mounts login inside AuthLayout in the real app router", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    });
    const pinia = createPinia();

    await router.push("/auth/login");
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    });

    expect(wrapper.find(".auth-layout").exists()).toBe(true);
    expect(wrapper.find(".auth-page").exists()).toBe(true);
    expect(wrapper.find(".app-layout__nav").exists()).toBe(false);
  });
});
