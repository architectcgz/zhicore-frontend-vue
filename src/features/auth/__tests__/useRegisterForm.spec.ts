import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { register } from "@/api/auth";
import { ApiError } from "@/api/request";
import { useAuthStore } from "@/stores/auth";

import { useRegisterForm } from "../composables/useRegisterForm";

const push = vi.fn();
const routeState = vi.hoisted(() => ({
  query: { redirect: "/editor" } as Record<string, string>,
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ query: routeState.query }),
  useRouter: () => ({ push }),
}));

vi.mock("@/api/auth", async () => ({
  ...(await vi.importActual<typeof import("@/api/auth")>("@/api/auth")),
  register: vi.fn(),
}));

describe("useRegisterForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routeState.query = { redirect: "/editor" };
  });

  it("validates register fields before calling the Auth API", async () => {
    const form = useRegisterForm();

    await form.submit();

    expect(register).not.toHaveBeenCalled();
    expect(form.fieldErrors.value).toMatchObject({
      email: "请输入有效的邮箱地址",
      nickname: "请输入昵称",
      password: "请输入密码",
      confirmPassword: "请再次输入密码",
      emailVerificationToken: "请输入邮箱验证码 token",
    });
  });

  it("submits register input, stores authenticated sessions and follows redirect", async () => {
    vi.mocked(register).mockResolvedValue({
      registered: true,
      authenticated: true,
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      principal: {
        accountId: "account-1",
        userId: "user-1",
        email: "demo@example.com",
        roles: ["ROLE_AUTHOR"],
        accountStatus: "ACTIVE",
        sessionVersion: 1,
        principalVersion: 1,
      },
      loginDeferredReason: null,
    });
    const form = useRegisterForm();

    form.email.value = "demo@example.com";
    form.nickname.value = "演示用户";
    form.password.value = "Password123";
    form.confirmPassword.value = "Password123";
    form.emailVerificationToken.value = "verify-token";

    await form.submit();

    expect(register).toHaveBeenCalledWith({
      email: "demo@example.com",
      nickname: "演示用户",
      password: "Password123",
      emailVerificationToken: "verify-token",
    });
    expect(useAuthStore().user).toMatchObject({
      id: "user-1",
      username: "demo@example.com",
      role: "author",
    });
    expect(useAuthStore().accessToken).toBe("access-token");
    expect(useAuthStore().csrfToken).toBe("csrf-token");
    expect(push).toHaveBeenCalledWith("/editor");
    expect(form.successMessage.value).toBe("");
  });

  it("keeps logged-out state and returns to login when auto login is deferred", async () => {
    vi.mocked(register).mockResolvedValue({
      registered: true,
      authenticated: false,
      loginDeferredReason: "AUTH_PRINCIPAL_UNAVAILABLE",
    });
    const form = useRegisterForm();

    form.email.value = "demo@example.com";
    form.nickname.value = "演示用户";
    form.password.value = "Password123";
    form.confirmPassword.value = "Password123";
    form.emailVerificationToken.value = "verify-token";

    await form.submit();

    expect(useAuthStore().isLoggedIn).toBe(false);
    expect(form.successMessage.value).toBe("注册成功，可稍后登录");
    expect(push).toHaveBeenCalledWith({ name: "Login" });
  });

  it("falls back to home when register redirect is not a safe in-app path", async () => {
    routeState.query = { redirect: "//evil.example/path" };
    vi.mocked(register).mockResolvedValue({
      registered: true,
      authenticated: true,
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      csrfToken: "csrf-token",
      principal: {
        accountId: "account-1",
        userId: "user-1",
        email: "demo@example.com",
        roles: ["ROLE_USER"],
        accountStatus: "ACTIVE",
        sessionVersion: 1,
        principalVersion: 1,
      },
      loginDeferredReason: null,
    });
    const form = useRegisterForm();
    form.email.value = "demo@example.com";
    form.nickname.value = "演示用户";
    form.password.value = "Password123";
    form.confirmPassword.value = "Password123";
    form.emailVerificationToken.value = "verify-token";

    await form.submit();

    expect(useAuthStore().isLoggedIn).toBe(true);
    expect(push).toHaveBeenCalledWith("/");
    expect(form.formError.value).toBe("");
  });

  it("blocks repeated submits inside the submit handler while a request is in flight", async () => {
    let resolveRegister: ((value: Awaited<ReturnType<typeof register>>) => void) | undefined;
    vi.mocked(register).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        }),
    );
    const form = useRegisterForm();

    form.email.value = "demo@example.com";
    form.nickname.value = "演示用户";
    form.password.value = "Password123";
    form.confirmPassword.value = "Password123";
    form.emailVerificationToken.value = "verify-token";

    const firstSubmit = form.submit();
    const secondSubmit = form.submit();

    expect(register).toHaveBeenCalledTimes(1);
    resolveRegister?.({
      registered: true,
      authenticated: false,
      loginDeferredReason: "AUTH_PRINCIPAL_UNAVAILABLE",
    });
    await Promise.all([firstSubmit, secondSubmit]);
  });

  it("maps Auth API error codes to field and form errors", async () => {
    const cases = [
      {
        code: 2009,
        expectedFieldErrors: { email: "该邮箱已被占用" },
        expectedFormError: "",
      },
      {
        code: 2010,
        expectedFieldErrors: { email: "请输入有效的邮箱地址" },
        expectedFormError: "",
      },
      {
        code: 2011,
        expectedFieldErrors: { password: "密码不符合安全策略" },
        expectedFormError: "",
      },
      {
        code: 2012,
        expectedFieldErrors: {},
        expectedFormError: "注册处理中，请稍后重试",
      },
      {
        code: 2015,
        expectedFieldErrors: {},
        expectedFormError: "请求过于频繁，请稍后再试",
      },
      {
        code: 1004,
        expectedFieldErrors: {},
        expectedFormError: "服务暂不可用，请稍后重试",
      },
      {
        code: 1001,
        expectedFieldErrors: {
          emailVerificationToken: "邮箱验证码 token 无效或已过期",
        },
        expectedFormError: "",
      },
    ];

    for (const testCase of cases) {
      vi.mocked(register).mockRejectedValueOnce(
        new ApiError("register failed", { code: testCase.code }),
      );
      const form = useRegisterForm();
      form.email.value = "demo@example.com";
      form.nickname.value = "演示用户";
      form.password.value = "Password123";
      form.confirmPassword.value = "Password123";
      form.emailVerificationToken.value = "verify-token";

      await form.submit();

      expect(form.fieldErrors.value).toMatchObject(
        testCase.expectedFieldErrors,
      );
      expect(form.formError.value).toBe(testCase.expectedFormError);
    }
  });
});
