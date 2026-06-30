import { logout as requestLogout } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

/**
 * 桥接 Layout 壳与 auth feature：
 * 提供 logout 动作，登出后回调 onLoggedOut 跳转到登录页。
 */
export function useLayoutSessionActionsBridge(onLoggedOut: () => void) {
  const authStore = useAuthStore()

  async function logout() {
    try {
      await requestLogout()
    } finally {
      authStore.logout()
    }
    onLoggedOut()
  }

  return { logout }
}
