<!--
  跳过导航链接组件
  允许键盘用户快速跳转到主内容区域
-->
<template>
  <a
    href="#main-content"
    class="skip-nav"
    @click="handleSkip"
  >
    跳转到主内容
  </a>
</template>

<script setup lang="ts">
/**
 * 处理跳转
 */
const handleSkip = (event: Event) => {
  event.preventDefault();
  
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    // 设置 tabindex 以便可以聚焦
    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1');
    }
    
    // 聚焦并滚动到主内容
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth' });
    
    // 移除 tabindex（避免影响正常的 tab 导航）
    setTimeout(() => {
      mainContent.removeAttribute('tabindex');
    }, 100);
  }
};
</script>

<style scoped>
/* 样式在 accessibility.css 中定义 */
</style>
