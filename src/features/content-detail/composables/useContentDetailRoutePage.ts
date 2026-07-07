import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

import { useContentDetailPage } from "./useContentDetailPage";

export function useContentDetailRoutePage() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const postId = computed(() => String(route.params.postId ?? ""));

  return useContentDetailPage(postId, {
    isLoggedIn: () => authStore.isLoggedIn,
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
