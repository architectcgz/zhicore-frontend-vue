<template>
  <section class="search-route" aria-labelledby="search-route-title">
    <div class="search-route__panel">
      <p class="search-route__eyebrow">Search</p>
      <h1 id="search-route-title">搜索服务暂未接入</h1>
      <p v-if="query" class="search-route__query">当前搜索：{{ query }}</p>
      <p class="search-route__message">
        搜索 HTTP contract 仍停在 API 族识别阶段，当前页面只保留导航入口和降级状态，不展示假结果。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const query = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim() : "",
);
</script>

<style scoped>
.search-route {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: var(--space-8);
}

.search-route__panel {
  width: min(100%, 720px);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
}

.search-route__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-primary);
  font-size: var(--font-size-12);
  font-weight: 700;
  text-transform: uppercase;
}

.search-route h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-24);
  line-height: 1.2;
}

.search-route__query,
.search-route__message {
  margin: var(--space-4) 0 0;
  color: var(--color-text);
  line-height: 1.7;
}

.search-route__message {
  color: var(--color-text-soft);
}
</style>
