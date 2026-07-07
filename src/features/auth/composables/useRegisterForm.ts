import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { authSessionFromRegisterResp, register } from "@/api/auth";
import { ApiError } from "@/api/request";
import { useAuthStore } from "@/stores/auth";

import { sanitizeAuthRedirect } from "../lib/redirect";

type RegisterField =
  | "email"
  | "nickname"
  | "password"
  | "confirmPassword"
  | "emailVerificationToken";

type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 注册表单 workflow owner。
 * 负责字段校验、重复提交防线、Auth API 错误归属和注册后登录态处理。
 */
export function useRegisterForm() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const email = ref("");
  const nickname = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const emailVerificationToken = ref("");
  const submitting = ref(false);
  const fieldErrors = ref<RegisterFieldErrors>({});
  const formError = ref("");
  const successMessage = ref("");

  function validate(): boolean {
    const nextErrors: RegisterFieldErrors = {};
    const normalizedEmail = email.value.trim();

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      nextErrors.email = "请输入有效的邮箱地址";
    }
    if (!nickname.value.trim()) {
      nextErrors.nickname = "请输入昵称";
    }
    if (!password.value) {
      nextErrors.password = "请输入密码";
    }
    if (!confirmPassword.value) {
      nextErrors.confirmPassword = "请再次输入密码";
    } else if (password.value !== confirmPassword.value) {
      nextErrors.confirmPassword = "两次输入的密码不一致";
    }
    if (!emailVerificationToken.value.trim()) {
      nextErrors.emailVerificationToken = "请输入邮箱验证码 token";
    }

    fieldErrors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function applyApiError(error: unknown): void {
    if (!(error instanceof ApiError)) {
      formError.value = error instanceof Error ? error.message : "注册失败";
      return;
    }

    switch (error.code) {
      case 2009:
        fieldErrors.value = { email: "该邮箱已被占用" };
        return;
      case 2010:
        fieldErrors.value = { email: "请输入有效的邮箱地址" };
        return;
      case 2011:
        fieldErrors.value = { password: "密码不符合安全策略" };
        return;
      case 1001:
        fieldErrors.value = {
          emailVerificationToken: "邮箱验证码 token 无效或已过期",
        };
        return;
      case 2012:
        formError.value = "注册处理中，请稍后重试";
        return;
      case 2015:
        formError.value = "请求过于频繁，请稍后再试";
        return;
      case 1004:
        formError.value = "服务暂不可用，请稍后重试";
        return;
      default:
        formError.value = error.message || "注册失败";
    }
  }

  async function submit(): Promise<void> {
    if (submitting.value) {
      return;
    }

    formError.value = "";
    successMessage.value = "";
    fieldErrors.value = {};

    if (!validate()) {
      return;
    }

    submitting.value = true;
    try {
      const response = await register({
        email: email.value.trim(),
        nickname: nickname.value.trim(),
        password: password.value,
        emailVerificationToken: emailVerificationToken.value.trim(),
      });

      if (response.authenticated) {
        authStore.setAuth(authSessionFromRegisterResp(response));
        await router.push(sanitizeAuthRedirect(route.query.redirect));
        return;
      }

      // 账号已创建但 principal 投影暂不可用时不能伪造登录态，只回到登录入口。
      successMessage.value = "注册成功，可稍后登录";
      await router.push({ name: "Login" });
    } catch (error) {
      applyApiError(error);
    } finally {
      submitting.value = false;
    }
  }

  return {
    email,
    nickname,
    password,
    confirmPassword,
    emailVerificationToken,
    submitting,
    fieldErrors,
    formError,
    successMessage,
    submit,
  };
}
