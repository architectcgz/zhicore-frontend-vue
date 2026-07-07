import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

import { useHomeDiscoveryPage } from "./useHomeDiscoveryPage";

export function useHomeDiscoveryRoutePage() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  return useHomeDiscoveryPage({
    isLoggedIn: () => authStore.isLoggedIn,
    restoreSession: () => authStore.restore(),
    redirectToLogin: async () => {
      await router.push({
        path: "/auth/login",
        query: {
          redirect: route.fullPath,
        },
      });
    },
  });
}
