<!-- 方案3：嵌入左侧阅读轨顶部，作为轨道首个卡片，与 TOC 融为一体 -->
<template>
  <Teleport to="#post-detail-reading-slot">
    <nav
      class="breadcrumb-v3"
      aria-label="面包屑导航"
    >
      <router-link
        to="/"
        class="breadcrumb-v3__link"
      >
        <svg
          viewBox="0 0 16 16"
          width="13"
          height="13"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2V6.5z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
        <span class="sr-only">首页</span>
      </router-link>
      <svg
        class="breadcrumb-v3__arrow"
        viewBox="0 0 16 16"
        width="10"
        height="10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <router-link
        to="/posts"
        class="breadcrumb-v3__link"
      >
        内容
      </router-link>
      <svg
        class="breadcrumb-v3__arrow"
        viewBox="0 0 16 16"
        width="10"
        height="10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="breadcrumb-v3__current">文章</span>
    </nav>
  </Teleport>
</template>

<style scoped>
.breadcrumb-v3 {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 88%, rgba(255, 255, 255, 0.24) 12%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow: var(--shadow-sm);
  color: var(--color-text-tertiary);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  width: 208px;
  box-sizing: border-box;
}

.breadcrumb-v3__link {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-tertiary);
  transition: color var(--transition-base);
  flex-shrink: 0;
}

.breadcrumb-v3__link:hover {
  color: var(--color-text);
}

.breadcrumb-v3__link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: 2px;
}

.breadcrumb-v3__arrow {
  color: var(--color-text-tertiary);
  opacity: 0.35;
  flex-shrink: 0;
}

.breadcrumb-v3__current {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>


<style scoped>
.breadcrumb-v3 {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-overlay) 70%, transparent);
  color: var(--color-text-tertiary);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
}

.breadcrumb-v3__link {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-tertiary);
  transition: color var(--transition-base);
  flex-shrink: 0;
}

.breadcrumb-v3__link:hover {
  color: var(--color-text-secondary);
}

.breadcrumb-v3__link:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-radius: 2px;
}

.breadcrumb-v3__home-icon {
  flex-shrink: 0;
}

.breadcrumb-v3__arrow {
  color: var(--color-text-tertiary);
  opacity: 0.35;
  flex-shrink: 0;
}

.breadcrumb-v3__current {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
