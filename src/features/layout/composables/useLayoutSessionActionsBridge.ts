import { storeToRefs } from "pinia";

import { logout as requestLogout } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

/**
 * 桥接 Layout 壳与 auth feature：
 * 提供当前登录态和 logout 动作，保持 Layout 只渲染状态、不直接读取 auth store。
 */
export function useLayoutSessionActionsBridge(onLoggedOut: () => void) {
  const authStore = useAuthStore();
  const { isLoggedIn } = storeToRefs(authStore);

  async function logout() {
    try {
      await requestLogout();
    } finally {
      authStore.logout();
    }
    onLoggedOut();
  }

  return { isLoggedIn, logout };
}
