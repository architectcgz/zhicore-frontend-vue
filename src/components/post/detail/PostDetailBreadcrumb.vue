<template>
  <div class="breadcrumb">
    <router-link
      to="/"
      class="breadcrumb-link"
    >
      首页
    </router-link>
    <span class="breadcrumb-separator">/</span>
    <router-link
      to="/posts"
      class="breadcrumb-link"
    >
      内容
    </router-link>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-current">文章详情</span>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-lg);
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.breadcrumb-link {
  transition: color var(--transition-base);
}

.breadcrumb-link:hover {
  color: var(--color-text);
}

.breadcrumb-separator {
  color: var(--color-text-tertiary);
}

.breadcrumb-current {
  color: var(--color-text);
}

.breadcrumb-link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
</style>
