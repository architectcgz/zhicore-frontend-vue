import { storeToRefs } from "pinia";
import { computed, readonly } from "vue";

import { logout as requestLogout } from "@/api/auth";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";
import { useAuthStore } from "@/stores/auth";

/**
 * 桥接 Layout 壳与 auth feature：
 * 提供当前登录态和 logout 动作，保持 Layout 只渲染状态、不直接读取 auth store。
 */
export function useLayoutSessionActionsBridge(onLoggedOut: () => void) {
  const authStore = useAuthStore();
  const { isLoggedIn } = storeToRefs(authStore);
  const localDemoLoggedIn = computed(() => isLocalDemoModeEnabled());
  const effectiveIsLoggedIn = computed(
    () => localDemoLoggedIn.value || isLoggedIn.value,
  );

  async function logout() {
    if (localDemoLoggedIn.value) {
      onLoggedOut();
      return;
    }

    try {
      await requestLogout();
    } finally {
      authStore.logout();
    }
    onLoggedOut();
  }

  return { isLoggedIn: readonly(effectiveIsLoggedIn), logout };
}
