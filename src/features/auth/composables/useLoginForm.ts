import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

import { sanitizeAuthRedirect } from "../lib/redirect";

type LoginField = "email";
type LoginFieldErrors = Partial<Record<LoginField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 登录表单状态管理。
 * 处理邮箱/密码输入、提交、错误展示与登录成功跳转。
 */
export function useLoginForm() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const username = ref("");
  const password = ref("");
  const submitting = ref(false);
  const fieldErrors = ref<LoginFieldErrors>({});
  const errorMessage = ref("");

  function validate(): boolean {
    const nextErrors: LoginFieldErrors = {};
    const normalizedEmail = username.value.trim();

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      nextErrors.email = "请输入有效的邮箱地址";
    }

    fieldErrors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(): Promise<void> {
    if (submitting.value) {
      return;
    }

    errorMessage.value = "";
    fieldErrors.value = {};

    // 邮箱格式错误属于用户可修正的字段问题，先在本地拦截，避免发起无效登录请求。
    if (!validate()) {
      return;
    }

    submitting.value = true;

    try {
      const session = await login({
        email: username.value.trim(),
        password: password.value,
      });
      authStore.setAuth(session);

      await router.push(sanitizeAuthRedirect(route.query.redirect));
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "登录失败";
    } finally {
      submitting.value = false;
    }
  }

  return {
    username,
    password,
    submitting,
    fieldErrors,
    errorMessage,
    submit,
  };
}
