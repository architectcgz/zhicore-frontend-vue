<template>
  <div id="app">
    <component :is="layoutComponent">
      <router-view />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocket } from '@/composables/useWebSocket';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

// 初始化 WebSocket 连接
useWebSocket();

// 当前路由
const route = useRoute();

// 布局组件映射
const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  admin: AdminLayout,
};

// 根据路由元信息动态选择布局
const layoutComponent = computed(() => {
  const layoutName = route.meta?.layout as keyof typeof layouts;
  return layouts[layoutName] || DefaultLayout;
});
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
