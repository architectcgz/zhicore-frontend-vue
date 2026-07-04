<template>
  <AppLayout :is-logged-in="isLoggedIn" :logout="logout" />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import { useLayoutSessionActionsBridge } from "@/features/layout";
import AppLayout from "@/layouts/AppLayout.vue";

const router = useRouter();
const { isLoggedIn, logout } = useLayoutSessionActionsBridge(() => {
  void router.push("/auth/login");
});
</script>
