<template>
  <section class="home-overview" aria-labelledby="home-overview-title">
    <header class="home-overview__hero">
      <p class="home-overview__eyebrow">ZhiCore</p>
      <h1 id="home-overview-title">结构化知识工作台</h1>
      <p class="home-overview__lede">
        写作、发现、社区和资源沉淀各司其职，让内容从草稿进入可复用的知识路径。
      </p>
      <div class="home-overview__actions">
        <RouterLink class="home-overview__primary" to="/editor">
          开始写作
        </RouterLink>
        <RouterLink class="home-overview__secondary" to="/explore">
          浏览内容
        </RouterLink>
      </div>
    </header>

    <section class="home-overview__entry-grid" aria-label="核心入口">
      <RouterLink
        v-for="entry in primaryEntries"
        :key="entry.to"
        class="home-overview__entry"
        :to="entry.to"
      >
        <span class="home-overview__entry-icon">
          <component :is="entry.icon" aria-hidden="true" />
        </span>
        <span class="home-overview__entry-copy">
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.summary }}</span>
        </span>
      </RouterLink>
    </section>

    <section class="home-overview__status" aria-label="当前能力状态">
      <div
        v-for="item in statusItems"
        :key="item.label"
        class="home-overview__status-item"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  Compass,
  FileStack,
  PenLine,
  UsersRound,
} from "@lucide/vue";
import { RouterLink } from "vue-router";

const primaryEntries = [
  {
    title: "写作",
    summary: "编辑器、草稿和发布入口",
    to: "/editor",
    icon: PenLine,
  },
  {
    title: "发现",
    summary: "公开文章、标签和筛选",
    to: "/explore",
    icon: Compass,
  },
  {
    title: "社区",
    summary: "主题聚合与近期讨论",
    to: "/community",
    icon: UsersRound,
  },
  {
    title: "资源",
    summary: "资料、模板和工具入口",
    to: "/resources",
    icon: FileStack,
  },
] as const;

const statusItems = [
  { label: "内容浏览", value: "发现页" },
  { label: "主题聚合", value: "社区页" },
  { label: "知识产出", value: "编辑器" },
  { label: "阅读入口", value: "文章详情" },
] as const;
</script>

<style scoped>
.home-overview {
  display: grid;
  width: min(100%, 76rem);
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
  gap: var(--space-8);
  color: var(--color-text);
}

.home-overview__hero {
  display: grid;
  max-width: 50rem;
  gap: var(--space-5);
}

.home-overview__eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-ui-caption);
  font-weight: var(--font-weight-ui-strong);
  letter-spacing: 0;
}

.home-overview h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 3rem;
  font-weight: var(--font-weight-ui-title);
  line-height: 1.12;
  letter-spacing: 0;
}

.home-overview__lede {
  max-width: 43rem;
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-ui-section-title);
  line-height: var(--line-height-ui-body);
}

.home-overview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.home-overview__primary,
.home-overview__secondary,
.home-overview__entry {
  text-decoration: none;
}

.home-overview__primary,
.home-overview__secondary {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-5);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-ui-body);
  font-weight: var(--font-weight-ui-control);
}

.home-overview__primary {
  background: var(--color-primary);
  color: var(--color-bg);
}

.home-overview__secondary {
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text-strong);
}

.home-overview__entry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.home-overview__entry {
  display: grid;
  min-height: 12rem;
  align-content: space-between;
  gap: var(--space-5);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-bg-elevated) 62%, transparent);
  color: var(--color-text);
  box-shadow: var(--shadow-panel);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.home-overview__entry:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-0.125rem);
}

.home-overview__entry-icon {
  display: inline-grid;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
  place-items: center;
}

.home-overview__entry-icon svg {
  width: var(--space-5);
  height: var(--space-5);
}

.home-overview__entry-copy {
  display: grid;
  gap: var(--space-2);
}

.home-overview__entry-copy strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-ui-section-title);
}

.home-overview__entry-copy span {
  color: var(--color-text-soft);
  font-size: var(--font-size-ui-body);
  line-height: var(--line-height-ui-body);
}

.home-overview__status {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid var(--color-border);
}

.home-overview__status-item {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-4);
}

.home-overview__status-item + .home-overview__status-item {
  border-left: 1px solid var(--color-border);
}

.home-overview__status-item span {
  color: var(--color-text-soft);
  font-size: var(--font-size-ui-meta);
}

.home-overview__status-item strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-ui-row-title);
}

.home-overview__primary:focus-visible,
.home-overview__secondary:focus-visible,
.home-overview__entry:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: var(--space-1);
}

@media (max-width: 900px) {
  .home-overview__entry-grid,
  .home-overview__status {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-overview__status-item:nth-child(3) {
    border-left: 0;
  }
}

@media (max-width: 640px) {
  .home-overview {
    padding: var(--space-10) var(--space-4)
      calc(var(--space-12) + 4rem + env(safe-area-inset-bottom, 0rem));
  }

  .home-overview h1 {
    font-size: 2.375rem;
  }

  .home-overview__entry-grid,
  .home-overview__status {
    grid-template-columns: 1fr;
  }

  .home-overview__status-item + .home-overview__status-item {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}
</style>
