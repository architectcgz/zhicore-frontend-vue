<template>
  <section class="home-overview">
    <div>
      <p class="home-overview__label">内容工作台</p>
      <h3>草稿、发布和阅读数据会在这里汇总。</h3>
    </div>
    <RouterLink class="home-overview__link" to="/editor">
      打开编辑器
    </RouterLink>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.home-overview {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
}

.home-overview__label {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-text-soft);
}

.home-overview h3 {
  margin: 0;
  font-size: clamp(20px, 3vw, 28px);
}

.home-overview__link {
  flex: 0 0 auto;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
}

@media (max-width: 640px) {
  .home-overview {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
