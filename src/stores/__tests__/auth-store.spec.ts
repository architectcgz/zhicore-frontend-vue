import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useAuthStore } from "@/stores/auth";
import * as authApi from "@/api/auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("stores the authenticated session tokens with the mapped user", () => {
    const store = useAuthStore();

    store.setAuth({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      user: {
        id: "user-1",
        username: "demo@example.com",
        role: "user",
      },
    });

    expect(store.user).toEqual({
      id: "user-1",
      username: "demo@example.com",
      role: "user",
    });
    expect(store.accessToken).toBe("access-token");
    expect(store.csrfToken).toBe("csrf-token");
    expect(store.isLoggedIn).toBe(true);
    expect(store.sessionRestored).toBe(true);
  });

  it("creates a local demo identity with a fake access token", () => {
    const store = useAuthStore();

    store.setLocalDemoAuth();

    expect(store.user).toEqual({
      id: "local-demo-user",
      username: "local-demo@zhicore.dev",
      role: "user",
      displayName: "本地调试用户",
    });
    expect(store.accessToken).toBe("local-demo-access-token");
    expect(store.csrfToken).toBe("local-demo-csrf-token");
    expect(store.isLoggedIn).toBe(true);
    expect(store.sessionRestored).toBe(true);
  });

  it("restores session only once after a successful profile fetch", async () => {
    const getProfile = vi.spyOn(authApi, "getProfile").mockResolvedValue({
      id: "user-1",
      username: "demo",
      role: "user",
    });

    const store = useAuthStore();
    store.setAuth({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      user: {
        id: "stale-user",
        username: "stale",
        role: "user",
      },
    });
    store.user = null;
    store.sessionRestored = false;

    await store.restore();
    await store.restore();

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(store.isLoggedIn).toBe(true);
    expect(store.sessionRestored).toBe(true);
  });

  it("uses a fresh CSRF token to refresh a cookie-backed session when no access token is in memory", async () => {
    vi.spyOn(authApi, "getCsrfToken").mockResolvedValue({
      csrfToken: "csrf-from-cookie",
    });
    vi.spyOn(authApi, "refreshSession").mockResolvedValue({
      state: "authenticated",
      session: {
        accessToken: "refreshed-access-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        csrfToken: "refreshed-csrf-token",
        user: {
          id: "user-1",
          username: "demo@example.com",
          role: "author",
        },
      },
    });

    const store = useAuthStore();
    await store.restore();

    expect(authApi.getCsrfToken).toHaveBeenCalledTimes(1);
    expect(authApi.refreshSession).toHaveBeenCalledTimes(1);
    expect(store.user).toEqual({
      id: "user-1",
      username: "demo@example.com",
      role: "author",
    });
    expect(store.accessToken).toBe("refreshed-access-token");
    expect(store.csrfToken).toBe("refreshed-csrf-token");
    expect(store.isLoggedIn).toBe(true);
  });

  it("refreshes when only a user snapshot exists without an access token", async () => {
    vi.spyOn(authApi, "getCsrfToken").mockResolvedValue({
      csrfToken: "csrf-from-cookie",
    });
    vi.spyOn(authApi, "refreshSession").mockResolvedValue({
      state: "authenticated",
      session: {
        accessToken: "refreshed-access-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        csrfToken: "refreshed-csrf-token",
        user: {
          id: "user-1",
          username: "demo@example.com",
          role: "user",
        },
      },
    });

    const store = useAuthStore();
    store.user = {
      id: "stale-user",
      username: "stale@example.com",
      role: "user",
    };

    await store.restore();

    expect(authApi.refreshSession).toHaveBeenCalledTimes(1);
    expect(store.user?.id).toBe("user-1");
    expect(store.accessToken).toBe("refreshed-access-token");
    expect(store.isLoggedIn).toBe(true);
  });

  it("does not mark the user logged in while refresh is still processing", async () => {
    vi.spyOn(authApi, "getCsrfToken").mockResolvedValue({
      csrfToken: "csrf-from-cookie",
    });
    vi.spyOn(authApi, "refreshSession").mockResolvedValue({
      state: "processing",
      operationId: "security-op-1",
      status: "PROCESSING",
      retryAfterSeconds: 5,
      refreshAccepted: false,
    });

    const store = useAuthStore();
    await store.restore();

    expect(store.user).toBeNull();
    expect(store.accessToken).toBeNull();
    expect(store.csrfToken).toBe("csrf-from-cookie");
    expect(store.isLoggedIn).toBe(false);
    expect(store.sessionRestored).toBe(true);
  });
});
