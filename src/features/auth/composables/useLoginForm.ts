import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

import { sanitizeAuthRedirect } from "../lib/redirect";

/**
 * 登录表单状态管理。
 * 处理用户名/密码输入、提交、错误展示与登录成功跳转。
 */
export function useLoginForm() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const username = ref("");
  const password = ref("");
  const submitting = ref(false);
  const errorMessage = ref("");

  async function submit() {
    if (submitting.value) {
      return;
    }

    errorMessage.value = "";
    submitting.value = true;

    try {
      const session = await login({
        email: username.value,
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
    errorMessage,
    submit,
  };
}
