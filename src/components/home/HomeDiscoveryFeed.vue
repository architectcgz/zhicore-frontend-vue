<template>
  <section class="home-discovery" aria-labelledby="home-discovery-title">
    <header class="home-discovery__intro">
      <div class="home-discovery__intro-main">
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
            :placeholder="discovery.searchInitialQuery"
            aria-label="搜索内容"
            @input="handleSearchInput"
          />
        </form>

        <div class="home-discovery__actions" aria-label="快捷入口">
          <RouterLink
            class="home-discovery__action home-discovery__action--primary"
            to="/editor"
          >
            <PenLine class="home-discovery__action-icon" aria-hidden="true" />
            <span>开始写作</span>
          </RouterLink>
          <RouterLink class="home-discovery__action" to="/structure">
            <Network class="home-discovery__action-icon" aria-hidden="true" />
            <span>整理结构</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <ul class="home-discovery__metrics" aria-label="平台概览">
      <li
        v-for="metric in discovery.metrics"
        :key="metric.label"
        class="home-discovery__metric"
      >
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </li>
    </ul>

    <section class="home-discovery__body">
      <aside
        id="home-discovery-support-panel"
        ref="supportPanelRef"
        class="home-discovery__support-panel"
        :class="{
          'home-discovery__support-panel--mobile-open': mobileSupportOpen,
        }"
        aria-label="首页辅助导航"
      >
        <div class="home-discovery__support-head">
          <h2>辅助导航</h2>
        </div>

        <section
          id="home-discovery-category-panel"
          class="home-discovery__category-nav"
          aria-label="内容分类"
        >
          <div class="home-discovery__section-head">
            <h2>内容分类</h2>
          </div>
          <div class="home-discovery__category-list">
            <button
              v-for="category in categorySummaries"
              :key="category.name"
              type="button"
              class="home-discovery__category-button"
              :aria-pressed="category.name === activeContentCategory"
              @click="handleContentCategorySelect(category.name)"
            >
              <span>{{ category.name }}</span>
              <small>{{ category.count }}</small>
            </button>
          </div>
        </section>

        <aside
          id="home-discovery-authors-panel"
          class="home-discovery__rail"
          aria-label="推荐作者"
        >
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
      </aside>

      <main class="home-discovery__feed" aria-label="文章列表">
        <div class="home-discovery__section-head">
          <h2>文章列表</h2>
          <span class="home-discovery__result-count">
            {{ visiblePosts.length }} 篇
          </span>
        </div>

        <div class="home-discovery__article-list">
          <RouterLink
            v-for="post in visiblePosts"
            :key="post.title"
            :to="post.href"
            class="home-discovery__article"
            :aria-label="`阅读文章：${post.title}`"
          >
            <div class="home-discovery__article-meta">
              <p class="home-discovery__label">
                {{ post.category }} / {{ post.readingTime }}
              </p>
              <span>{{ post.author }} · {{ post.publishedAt }}</span>
            </div>
            <h3>
              <span>{{ post.title }}</span>
              <ArrowRight
                class="home-discovery__article-icon"
                aria-hidden="true"
              />
            </h3>
            <p>{{ post.summary }}</p>
            <div class="home-discovery__chips">
              <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
            <footer class="home-discovery__article-footer">
              <span>{{ post.likes }} 喜欢 · {{ post.comments }} 评论</span>
            </footer>
          </RouterLink>
        </div>

        <p v-if="visiblePosts.length === 0" class="home-discovery__empty">
          没有匹配的文章
        </p>
      </main>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Network, PenLine, Search } from "@lucide/vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";

import {
  HOME_DISCOVERY_MOBILE_MENU_EVENT,
  type HomeDiscoveryData,
} from "@/features/home-discovery";

const ALL_CATEGORY = "全部";

const props = defineProps<{
  discovery: HomeDiscoveryData;
  activeContentCategory: string;
  searchQuery: string;
}>();

const emit = defineEmits<{
  selectContentCategory: [category: string];
  "update:searchQuery": [query: string];
}>();

const mobileSupportOpen = ref(false);
const supportPanelRef = ref<HTMLElement | null>(null);

const categorySummaries = computed(() =>
  props.discovery.contentCategories.map((category) => ({
    name: category,
    count:
      category === ALL_CATEGORY
        ? props.discovery.posts.length
        : props.discovery.posts.filter((post) => post.category === category)
            .length,
  })),
);

const visiblePosts = computed(() => {
  const query = props.searchQuery.trim().toLocaleLowerCase();

  return props.discovery.posts.filter((post) => {
    // 内容分类是读者的主筛选条件；搜索只在当前分类范围内继续收窄结果。
    const matchesCategory =
      props.activeContentCategory === ALL_CATEGORY ||
      post.category === props.activeContentCategory;

    if (!matchesCategory) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    const searchableText = [
      post.category,
      post.readingTime,
      post.title,
      post.summary,
      post.author,
      ...post.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(query);
  });
});

function handleSearchInput(event: Event): void {
  emit("update:searchQuery", (event.target as HTMLInputElement).value);
}

function toggleMobileSupportMenu(): void {
  mobileSupportOpen.value = !mobileSupportOpen.value;
}

function closeMobileSupportMenu(): void {
  mobileSupportOpen.value = false;
}

function handleContentCategorySelect(category: string): void {
  emit("selectContentCategory", category);
  closeMobileSupportMenu();
}

function handleDocumentPointerDown(event: Event): void {
  if (!mobileSupportOpen.value) {
    return;
  }

  const target = event.target;
  const supportPanel = supportPanelRef.value;

  if (!(target instanceof Node) || supportPanel?.contains(target)) {
    return;
  }

  closeMobileSupportMenu();
}

onMounted(() => {
  window.addEventListener(
    HOME_DISCOVERY_MOBILE_MENU_EVENT,
    toggleMobileSupportMenu,
  );
  document.addEventListener("pointerdown", handleDocumentPointerDown);
});

onUnmounted(() => {
  window.removeEventListener(
    HOME_DISCOVERY_MOBILE_MENU_EVENT,
    toggleMobileSupportMenu,
  );
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
});
</script>

<style scoped>
.home-discovery {
  display: grid;
  gap: var(--space-6);
  max-width: 1440px;
  margin: 0 auto;
}

.home-discovery__intro,
.home-discovery__body {
  display: grid;
  gap: var(--space-6);
}

.home-discovery__intro {
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
}

.home-discovery__intro-main,
.home-discovery__category-nav,
.home-discovery__feed,
.home-discovery__rail-card,
.home-discovery__article {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}

.home-discovery__intro-main {
  display: grid;
  align-content: center;
  min-height: 320px;
  padding: var(--space-10);
}

.home-discovery__eyebrow,
.home-discovery__label {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.8125rem;
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
  max-width: 780px;
  margin-top: var(--space-3);
  font-size: 3rem;
  line-height: 1.12;
  text-wrap: balance;
}

.home-discovery__lede {
  max-width: 660px;
  color: var(--color-text);
  font-size: 1.0625rem;
  line-height: 1.8;
  text-wrap: pretty;
}

.home-discovery__search {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-2);
  align-items: center;
  max-width: 560px;
  min-height: calc(var(--space-10) + var(--space-2));
  margin-top: var(--space-6);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-hover);
}

.home-discovery__search-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-text-soft);
}

.home-discovery__search input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
}

.home-discovery__search input::placeholder {
  color: var(--color-text-soft);
  opacity: 1;
}

.home-discovery__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.home-discovery__action,
.home-discovery__category-button,
.home-discovery__author button {
  min-height: calc(var(--space-10) + var(--space-1));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-weight: 750;
  cursor: pointer;
}

.home-discovery__action {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  color: var(--color-text);
  text-decoration: none;
}

.home-discovery__action--primary {
  border-color: var(--color-text-strong);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
}

.home-discovery__action-icon {
  width: 1rem;
  height: 1rem;
}

.home-discovery__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  list-style: none;
}

.home-discovery__metric {
  display: inline-flex;
  flex: 1 1 180px;
  gap: var(--space-2);
  align-items: baseline;
  justify-content: center;
  min-height: calc(var(--space-12) + var(--space-2));
  padding: var(--space-3) var(--space-4);
}

.home-discovery__metric + .home-discovery__metric {
  border-left: 1px solid var(--color-border);
}

.home-discovery__metric strong {
  color: var(--color-text-strong);
  font-size: 1.25rem;
  line-height: 1;
}

.home-discovery__metric span,
.home-discovery__result-count,
.home-discovery__article-footer,
.home-discovery__article-meta span,
.home-discovery__author span {
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.home-discovery__body {
  grid-template-columns: 240px minmax(0, 1fr) 320px;
  align-items: start;
}

.home-discovery__support-panel {
  display: contents;
}

.home-discovery__support-head {
  display: none;
}

.home-discovery__category-nav {
  grid-column: 1;
}

.home-discovery__feed {
  grid-column: 2;
}

.home-discovery__rail {
  grid-column: 3;
}

.home-discovery__category-nav,
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

.home-discovery__category-list,
.home-discovery__article-list {
  display: grid;
  gap: var(--space-3);
}

.home-discovery__category-button {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 var(--space-3);
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.home-discovery__category-button small {
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 750;
}

.home-discovery__category-button[aria-pressed="true"] {
  border-color: color-mix(
    in srgb,
    var(--color-accent) 42%,
    var(--color-border)
  );
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-bg-hover)
  );
  color: var(--color-text-strong);
}

.home-discovery__article {
  display: grid;
  padding: var(--space-4);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.home-discovery__article:hover,
.home-discovery__article:focus-visible {
  border-color: color-mix(
    in srgb,
    var(--color-accent) 42%,
    var(--color-border)
  );
  background: color-mix(
    in srgb,
    var(--color-accent) 5%,
    var(--color-bg-elevated)
  );
  transform: translateY(-1px);
}

.home-discovery__article h3 {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: 1.25rem;
  line-height: 1.35;
  text-wrap: pretty;
}

.home-discovery__article p {
  color: var(--color-text);
  line-height: 1.75;
}

.home-discovery__article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
}

.home-discovery__article-icon {
  flex: 0 0 auto;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.25rem;
  color: var(--color-text-soft);
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
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 750;
}

.home-discovery__article-footer {
  margin-top: var(--space-4);
}

.home-discovery__empty {
  margin: var(--space-4) 0 0;
  padding: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  text-align: center;
}

.home-discovery__rail {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.home-discovery__author {
  display: grid;
  grid-template-columns:
    calc(var(--space-10) + var(--space-1)) minmax(0, 1fr)
    auto;
  gap: var(--space-3);
  align-items: center;
  min-height: 58px;
}

.home-discovery__author + .home-discovery__author {
  margin-top: var(--space-3);
}

.home-discovery__avatar {
  display: grid;
  width: calc(var(--space-10) + var(--space-1));
  height: calc(var(--space-10) + var(--space-1));
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

.home-discovery__search:focus-within,
.home-discovery__action:focus-visible,
.home-discovery__category-button:focus-visible,
.home-discovery__author button:focus-visible,
.home-discovery__article:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 1080px) {
  .home-discovery__body {
    grid-template-columns: 1fr;
  }

  .home-discovery__support-panel {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    display: grid;
    align-content: start;
    gap: var(--space-3);
    width: min(84vw, 340px);
    padding: var(--space-4);
    overflow: auto;
    border: 1px solid var(--color-border);
    border-left: 0;
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-panel);
    opacity: 0;
    pointer-events: none;
    transform: translateX(-100%);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .home-discovery__support-panel--mobile-open {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }

  .home-discovery__support-head {
    display: block;
  }

  .home-discovery__feed {
    grid-column: 1;
    order: 1;
  }

  .home-discovery__category-nav,
  .home-discovery__rail {
    grid-column: 1;
  }
}

@media (max-width: 720px) {
  .home-discovery__intro-main {
    min-height: auto;
    padding: var(--space-6);
  }

  .home-discovery h1 {
    font-size: 2.25rem;
  }

  .home-discovery__section-head,
  .home-discovery__article h3,
  .home-discovery__article-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-discovery__category-list {
    grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  }

  .home-discovery__metric {
    justify-content: flex-start;
  }

  .home-discovery__metric + .home-discovery__metric {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-discovery__article,
  .home-discovery__support-panel {
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease;
  }

  .home-discovery__article:hover,
  .home-discovery__article:focus-visible {
    transform: none;
  }
}
</style>
