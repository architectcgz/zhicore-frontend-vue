import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

import { useLoginForm } from "../composables/useLoginForm";

const push = vi.fn();
const routeState = vi.hoisted(() => ({
  query: { redirect: "/editor" } as Record<string, unknown>,
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: routeState.query }),
  useRouter: () => ({ push }),
}));

vi.mock("@/api/auth", () => ({
  login: vi.fn(),
}));

describe("useLoginForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routeState.query = { redirect: "/editor" };
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
    form.termsAccepted.value = true;

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

  it("rejects invalid email before submitting credentials", async () => {
    const form = useLoginForm();

    form.username.value = "not-an-email";
    form.password.value = "Password123";
    form.termsAccepted.value = true;

    await form.submit();

    expect(login).not.toHaveBeenCalled();
    expect(form.fieldErrors.value).toEqual({
      email: "请输入有效的邮箱地址",
    });
    expect(form.submitting.value).toBe(false);
  });

  it("rejects login before the user accepts the terms and privacy policy", async () => {
    const form = useLoginForm();

    form.username.value = "demo@example.com";
    form.password.value = "Password123";

    await form.submit();

    expect(login).not.toHaveBeenCalled();
    expect(form.fieldErrors.value).toEqual({
      terms: "请先阅读并同意用户协议和隐私政策",
    });
    expect(form.submitting.value).toBe(false);
  });

  it.each([
    ["external protocol URL", "https://evil.example/path"],
    ["protocol-relative URL", "//evil.example/path"],
    ["empty redirect", ""],
    ["non-string redirect", ["/editor"]],
  ])("falls back to home for unsafe %s", async (_caseName, redirect) => {
    routeState.query = { redirect };
    vi.mocked(login).mockResolvedValue({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      user: {
        id: "user-1",
        username: "demo@example.com",
        role: "user",
        displayName: "demo@example.com",
      },
    });
    const form = useLoginForm();

    form.username.value = "demo@example.com";
    form.password.value = "Password123";
    form.termsAccepted.value = true;

    await form.submit();

    expect(push).toHaveBeenCalledWith("/");
  });
});
