<template>
  <section class="home-discovery" aria-labelledby="home-discovery-title">
    <section class="home-discovery__hero">
      <div class="home-discovery__hero-main">
        <p class="home-discovery__eyebrow">{{ discovery.eyebrow }}</p>
        <h1 id="home-discovery-title">{{ discovery.title }}</h1>
        <p class="home-discovery__lede">
          {{ discovery.lede }}
        </p>

        <form class="home-discovery__search" role="search" @submit.prevent>
          <Search class="home-discovery__search-icon" aria-hidden="true" />
          <input
            type="search"
            :value="searchQuery"
            aria-label="搜索内容"
            @input="handleSearchInput"
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <aside class="home-discovery__metrics" aria-label="平台概览">
        <div
          v-for="metric in discovery.metrics"
          :key="metric.label"
          class="home-discovery__metric"
        >
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>
        </div>
      </aside>
    </section>

    <section class="home-discovery__body">
      <main class="home-discovery__feed" aria-label="推荐阅读">
        <div class="home-discovery__section-head">
          <h2>推荐阅读</h2>
          <div
            class="home-discovery__tabs"
            role="tablist"
            aria-label="信息流筛选"
          >
            <button
              v-for="tab in discovery.feedTabs"
              :key="tab"
              type="button"
              :aria-selected="tab === activeFeedTab"
              @click="$emit('selectFeedTab', tab)"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <RouterLink
          v-for="post in discovery.posts"
          :key="post.title"
          :to="post.href"
          class="home-discovery__article"
          :aria-label="`阅读文章：${post.title}`"
        >
          <div class="home-discovery__article-content">
            <p class="home-discovery__label">{{ post.category }}</p>
            <h3>{{ post.title }}</h3>
            <p>{{ post.summary }}</p>
            <div class="home-discovery__chips">
              <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
            <footer class="home-discovery__article-footer">
              <span>{{ post.author }} · {{ post.publishedAt }}</span>
              <span>{{ post.likes }} 喜欢 · {{ post.comments }} 评论</span>
            </footer>
          </div>
          <div class="home-discovery__cover" aria-hidden="true" />
        </RouterLink>
      </main>

      <aside class="home-discovery__rail">
        <section class="home-discovery__rail-card">
          <h2>{{ discovery.knowledgeStructure.title }}</h2>
          <div class="home-discovery__graph" aria-hidden="true" />
          <p>{{ discovery.knowledgeStructure.description }}</p>
        </section>

        <section class="home-discovery__rail-card">
          <h2>{{ discovery.authorsTitle }}</h2>
          <div
            v-for="author in discovery.authors"
            :key="author.name"
            class="home-discovery__author"
          >
            <span class="home-discovery__avatar">{{ author.initial }}</span>
            <div>
              <strong>{{ author.name }}</strong>
              <span>{{ author.bio }}</span>
            </div>
            <button type="button">关注</button>
          </div>
        </section>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { Search } from "@lucide/vue";
import { RouterLink } from "vue-router";

import type { HomeDiscoveryData } from "@/features/home-discovery";

defineProps<{
  discovery: HomeDiscoveryData;
  activeFeedTab: string;
  searchQuery: string;
}>();

const emit = defineEmits<{
  selectFeedTab: [tab: string];
  "update:searchQuery": [query: string];
}>();

function handleSearchInput(event: Event): void {
  emit("update:searchQuery", (event.target as HTMLInputElement).value);
}
</script>

<style scoped>
.home-discovery {
  display: grid;
  gap: var(--space-5);
}

.home-discovery__hero,
.home-discovery__body {
  display: grid;
  gap: var(--space-5);
}

.home-discovery__hero {
  grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
}

.home-discovery__hero-main,
.home-discovery__metrics,
.home-discovery__feed,
.home-discovery__rail-card,
.home-discovery__article {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-panel);
}

.home-discovery__hero-main {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  padding: clamp(var(--space-6), 5vw, var(--space-12));
}

.home-discovery__hero-main::after {
  position: absolute;
  right: 0;
  bottom: 0;
  width: min(360px, 54%);
  height: 70%;
  background: repeating-linear-gradient(
    90deg,
    var(--color-text-strong) 0 2px,
    transparent 2px 16px
  );
  clip-path: polygon(38% 0, 100% 18%, 86% 100%, 0 80%);
  content: "";
  opacity: 0.1;
  pointer-events: none;
}

.home-discovery__eyebrow,
.home-discovery__label {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
}

.home-discovery h1,
.home-discovery h2,
.home-discovery h3 {
  margin: 0;
  color: var(--color-text-strong);
  letter-spacing: 0;
}

.home-discovery h1 {
  position: relative;
  z-index: 1;
  max-width: 780px;
  margin-top: var(--space-3);
  font-size: 56px;
  line-height: 1.05;
}

.home-discovery__lede {
  position: relative;
  z-index: 1;
  max-width: 660px;
  color: var(--color-text);
  font-size: 18px;
  line-height: 1.8;
}

.home-discovery__search {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: center;
  max-width: 560px;
  min-height: 48px;
  margin-top: var(--space-6);
  padding: var(--space-1) var(--space-1) var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
}

.home-discovery__search-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-soft);
}

.home-discovery__search input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
}

.home-discovery__search button,
.home-discovery__tabs button,
.home-discovery__author button {
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-weight: 750;
  cursor: pointer;
}

.home-discovery__search button {
  padding: 0 var(--space-3);
  background: var(--color-accent);
  color: #fff;
}

.home-discovery__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  align-content: start;
  padding: var(--space-4);
}

.home-discovery__metric {
  display: grid;
  gap: var(--space-2);
  min-height: 96px;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
}

.home-discovery__metric strong {
  color: var(--color-text-strong);
  font-size: 32px;
  line-height: 1;
}

.home-discovery__metric span,
.home-discovery__article-footer,
.home-discovery__rail-card p,
.home-discovery__author span {
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 700;
}

.home-discovery__body {
  grid-template-columns: minmax(0, 1fr) 330px;
}

.home-discovery__feed,
.home-discovery__rail-card {
  padding: var(--space-4);
}

.home-discovery__section-head {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.home-discovery__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.home-discovery__tabs button {
  padding: 0 var(--space-3);
  background: var(--color-bg-hover);
  color: var(--color-text-soft);
}

.home-discovery__tabs button[aria-selected="true"] {
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-bg-hover)
  );
  color: var(--color-text-strong);
}

.home-discovery__article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: var(--space-5);
  padding: var(--space-4);
  color: inherit;
  box-shadow: none;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease;
}

.home-discovery__article:hover,
.home-discovery__article:focus-visible {
  border-color: color-mix(
    in srgb,
    var(--color-accent) 42%,
    var(--color-border)
  );
  transform: translateY(-1px);
}

.home-discovery__article + .home-discovery__article {
  margin-top: var(--space-3);
}

.home-discovery__article h3 {
  margin-top: var(--space-2);
  font-size: 24px;
  line-height: 1.35;
}

.home-discovery__article p {
  color: var(--color-text);
  line-height: 1.75;
}

.home-discovery__chips,
.home-discovery__article-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.home-discovery__chips span {
  min-height: 28px;
  padding: 5px 9px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 750;
}

.home-discovery__article-footer {
  justify-content: space-between;
  margin-top: var(--space-4);
}

.home-discovery__cover,
.home-discovery__graph {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 18%, transparent),
      transparent 62%
    ),
    linear-gradient(
      45deg,
      transparent 0 44%,
      color-mix(in srgb, var(--color-accent) 30%, transparent) 45% 50%,
      transparent 51%
    ),
    var(--color-bg-hover);
}

.home-discovery__cover {
  min-height: 132px;
}

.home-discovery__rail {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.home-discovery__graph {
  min-height: 220px;
  margin: var(--space-3) 0;
}

.home-discovery__author {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  min-height: 58px;
}

.home-discovery__author + .home-discovery__author {
  margin-top: var(--space-3);
}

.home-discovery__avatar {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 850;
}

.home-discovery__author strong,
.home-discovery__author span {
  display: block;
}

.home-discovery__author button {
  padding: 0 var(--space-3);
  background: var(--color-bg-hover);
  color: var(--color-text);
}

@media (max-width: 1080px) {
  .home-discovery__hero,
  .home-discovery__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .home-discovery__metrics,
  .home-discovery__article {
    grid-template-columns: 1fr;
  }

  .home-discovery h1 {
    font-size: 42px;
  }
}
</style>
