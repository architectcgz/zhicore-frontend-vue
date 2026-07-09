import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { refreshSession } from "@/api/auth";
import { setupRouterGuards } from "@/router/guards";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/api/auth", () => ({
  getCsrfToken: vi.fn().mockResolvedValue({
    csrfToken: "local-demo-csrf-token",
  }),
  getProfile: vi.fn(),
  refreshSession: vi.fn().mockResolvedValue({
    state: "authenticated",
    session: {
      accessToken: "local-demo-access-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      csrfToken: "local-demo-csrf-token",
      user: {
        id: "api-local-demo-user",
        username: "local-demo@zhicore.dev",
        role: "user",
        displayName: "本地调试用户",
      },
    },
  }),
}));

describe("router guards", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("allows protected pages in local demo mode through auth API restore", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/auth/login",
          name: "Login",
          component: { template: "<div />" },
        },
        {
          path: "/messages",
          name: "Messages",
          component: { template: "<div />" },
          meta: { requiresAuth: true },
        },
      ],
    });
    setupRouterGuards(router);

    await router.push("/messages");

    expect(router.currentRoute.value.name).toBe("Messages");
    const authStore = useAuthStore();
    expect(authStore.isLoggedIn).toBe(true);
    expect(authStore.user?.id).toBe("api-local-demo-user");
    expect(authStore.accessToken).toBe("local-demo-access-token");
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it("registers guards on the app router so /user/profile restores auth before entering", async () => {
    setActivePinia(createPinia());
    const { default: router } = await import("@/router");

    await router.push("/user/profile");

    expect(router.currentRoute.value.name).toBe("UserProfile");
    const authStore = useAuthStore();
    expect(authStore.isLoggedIn).toBe(true);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });
});
