import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
  getCsrfToken,
  getProfile,
  refreshSession,
  type AuthSession,
} from "@/api/auth";
import { clearAuthRequestTokens, setAuthRequestTokens } from "@/api/request";
import type { AuthUser } from "@/entities/user/model/user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const csrfToken = ref<string | null>(null);
  const sessionRestored = ref(false);
  let restorePromise: Promise<void> | null = null;

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value);

  function syncRequestTokens(): void {
    setAuthRequestTokens({
      accessToken: accessToken.value,
      csrfToken: csrfToken.value,
    });
  }

  function setCsrfToken(nextCsrfToken: string): void {
    csrfToken.value = nextCsrfToken;
    syncRequestTokens();
  }

  function setAuth(nextSession: AuthSession): void {
    user.value = nextSession.user;
    accessToken.value = nextSession.accessToken;
    csrfToken.value = nextSession.csrfToken;
    syncRequestTokens();
    sessionRestored.value = true;
  }

  function setLocalDemoAuth(): void {
    // 本地 demo 身份只用于前端调试登录态；后端真实鉴权仍依赖网关注入的用户身份。
    setAuth({
      accessToken: "local-demo-access-token",
      tokenType: "Bearer",
      expiresIn: 3600,
      csrfToken: "local-demo-csrf-token",
      user: {
        id: "local-demo-user",
        username: "local-demo@zhicore.dev",
        role: "user",
        displayName: "本地调试用户",
      },
    });
  }

  function logout(): void {
    user.value = null;
    accessToken.value = null;
    csrfToken.value = null;
    clearAuthRequestTokens();
    sessionRestored.value = true;
  }

  /**
   * 从服务端恢复当前 session。
   * 支持并发去重 —— 多次并发调用只发一次请求。
   */
  async function restore(): Promise<void> {
    if (isLoggedIn.value || sessionRestored.value) {
      return;
    }
    if (restorePromise) {
      return restorePromise;
    }

    restorePromise = (async () => {
      try {
        if (accessToken.value) {
          user.value = await getProfile();
          syncRequestTokens();
          return;
        }

        // Browser reloads lose in-memory access tokens; refresh uses cookie + CSRF double-submit.
        const csrf = await getCsrfToken();
        setCsrfToken(csrf.csrfToken);
        const refreshResult = await refreshSession();
        if (refreshResult.state === "authenticated") {
          setAuth(refreshResult.session);
          return;
        }

        user.value = null;
        accessToken.value = null;
        syncRequestTokens();
      } catch {
        user.value = null;
        accessToken.value = null;
        csrfToken.value = null;
        clearAuthRequestTokens();
      } finally {
        sessionRestored.value = true;
        restorePromise = null;
      }
    })();

    return restorePromise;
  }

  return {
    user,
    accessToken,
    csrfToken,
    sessionRestored,
    isLoggedIn,
    setAuth,
    setLocalDemoAuth,
    logout,
    restore,
  };
});
