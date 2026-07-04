import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

import { useLoginForm } from "../composables/useLoginForm";

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: { redirect: "/editor" } }),
  useRouter: () => ({ push }),
}));

vi.mock("@/api/auth", () => ({
  login: vi.fn(),
}));

describe("useLoginForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("submits credentials, stores the mapped auth user and navigates in the feature workflow", async () => {
    const authSession = {
      accessToken: "access-token",
      tokenType: "Bearer" as const,
      expiresIn: 7200,
      csrfToken: "csrf-token",
      user: {
        id: "user-1",
        username: "demo@example.com",
        role: "user" as const,
        displayName: "demo@example.com",
      },
    };
    vi.mocked(login).mockResolvedValue(authSession);
    const form = useLoginForm();

    form.username.value = "demo@example.com";
    form.password.value = "Password123";

    await form.submit();

    expect(login).toHaveBeenCalledWith({
      email: "demo@example.com",
      password: "Password123",
    });
    expect(useAuthStore().user).toEqual(authSession.user);
    expect(useAuthStore().accessToken).toBe("access-token");
    expect(useAuthStore().csrfToken).toBe("csrf-token");
    expect(push).toHaveBeenCalledWith("/editor");
    expect(form.errorMessage.value).toBe("");
  });
});
