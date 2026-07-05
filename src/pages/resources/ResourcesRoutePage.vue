<template>
  <section class="resources-route" aria-labelledby="resources-route-title">
    <div class="resources-route__panel">
      <p class="resources-route__eyebrow">Resources</p>
      <h1 id="resources-route-title">资源中心暂未接入</h1>
      <p class="resources-route__message">
        资源入口会承载文件、资料和内容资产导航；当前资源 HTTP contract
        尚未固化，页面只保留独立入口和降级状态，不跳转到搜索，也不展示假资源。
      </p>
    </div>
  </section>
</template>

<style scoped>
.resources-route {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: var(--space-8);
}

.resources-route__panel {
  width: min(100%, 720px);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
}

.resources-route__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-primary);
  font-size: var(--font-size-12);
  font-weight: 700;
  text-transform: uppercase;
}

.resources-route h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-24);
  line-height: 1.2;
}

.resources-route__message {
  margin: var(--space-4) 0 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}
</style>
