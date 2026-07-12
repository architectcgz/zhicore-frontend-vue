<template>
  <section class="explore-route" aria-labelledby="explore-route-title">
    <header class="explore-hero">
      <div class="explore-hero__copy">
        <h1 id="explore-route-title">探索内容</h1>
        <p>按主题发现高质量公开内容</p>
      </div>

      <dl class="explore-hero__stats" aria-label="探索概览">
        <div
          v-for="stat in overviewStats"
          :key="stat.label"
          class="explore-hero__stat"
        >
          <dt>
            <component
              :is="stat.icon"
              class="explore-icon"
              aria-hidden="true"
            />
            <span>{{ stat.value }}</span>
          </dt>
          <dd>{{ stat.label }}</dd>
        </div>
      </dl>
    </header>

    <nav class="explore-tabs" aria-label="内容分类">
      <button
        v-for="category in discovery.contentCategories"
        :key="category"
        type="button"
        class="explore-tabs__item"
        :class="{
          'explore-tabs__item--active': category === activeContentCategory,
        }"
        :aria-pressed="category === activeContentCategory"
        @click="emit('selectContentCategory', category)"
      >
        {{ categoryLabel(category) }}
      </button>
    </nav>

    <div class="explore-toolbar" aria-label="内容排序">
      <span>排序：最新发布</span>
      <ChevronDown class="explore-toolbar__icon" aria-hidden="true" />
    </div>

    <div class="explore-shell">
      <main class="explore-feed" aria-label="内容列表">
        <div v-if="engagementActionError" class="explore-notice" role="alert">
          {{ engagementActionError }}
        </div>

        <div
          v-if="feedState === 'loading'"
          class="explore-loading"
          aria-live="polite"
        >
          <div v-for="i in 4" :key="i" class="explore-skeleton">
            <div class="explore-skeleton__body">
              <span></span>
              <strong></strong>
              <p></p>
              <p></p>
            </div>
            <div class="explore-skeleton__media"></div>
          </div>
        </div>

        <div
          v-else-if="feedState === 'error'"
          class="explore-state"
          role="alert"
        >
          <p>{{ feedError || "公开内容加载失败，请检查网络后重试" }}</p>
          <button
            type="button"
            class="explore-state__action"
            @click="emit('retry')"
          >
            重试加载
          </button>
        </div>

        <div v-else-if="feedState === 'empty'" class="explore-state">
          <Inbox class="explore-state__icon" aria-hidden="true" />
          <p>当前分类下暂无公开内容</p>
        </div>

        <template v-else>
          <article
            v-for="post in postCards"
            :key="post.id ?? post.href ?? post.title"
            class="explore-post"
          >
            <div class="explore-post__content">
              <span class="explore-post__category">{{ post.category }}</span>

              <h2 class="explore-post__title">
                <RouterLink
                  v-if="post.href"
                  :to="post.href"
                  class="explore-post__link"
                >
                  {{ post.title }}
                </RouterLink>
                <span v-else>{{ post.title }}</span>
              </h2>

              <div class="explore-post__meta">
                <span class="explore-post__avatar" aria-hidden="true">
                  {{ post.authorInitial }}
                </span>
                <span>{{ post.author }}</span>
                <span aria-hidden="true">·</span>
                <time>{{ post.publishedAt }}</time>
                <span aria-hidden="true">·</span>
                <Eye class="explore-post__meta-icon" aria-hidden="true" />
                <span>{{ post.readingTime }}</span>
              </div>

              <p class="explore-post__summary">{{ post.summary }}</p>

              <div
                v-if="post.tags && post.tags.length > 0"
                class="explore-post__tags"
              >
                <span v-for="tag in post.tags" :key="tag" class="explore-chip">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="explore-post__aside">
              <div
                class="explore-post__thumb"
                :class="post.thumbnailClass"
                aria-hidden="true"
              >
                <span></span>
              </div>

              <footer class="explore-post__actions">
                <button
                  type="button"
                  class="explore-action"
                  :class="{ 'explore-action--active': post.liked }"
                  :disabled="!post.id || post.engagementUnavailable"
                  :aria-pressed="post.liked === true"
                  :aria-label="likeActionLabel(post)"
                  title="喜欢"
                  @click="post.id && emit('likePost', post.id)"
                >
                  <Heart class="explore-action__icon" aria-hidden="true" />
                  <span>{{ post.likes }}</span>
                </button>

                <RouterLink
                  v-if="post.href"
                  :to="`${post.href}#comments`"
                  class="explore-action"
                  :aria-label="commentActionLabel(post)"
                  title="评论"
                >
                  <MessageCircle
                    class="explore-action__icon"
                    aria-hidden="true"
                  />
                  <span>{{ post.comments }}</span>
                </RouterLink>

                <button
                  type="button"
                  class="explore-action"
                  :class="{ 'explore-action--active': post.favorited }"
                  :disabled="!post.id || post.engagementUnavailable"
                  :aria-pressed="post.favorited === true"
                  title="收藏"
                  @click="post.id && emit('favoritePost', post.id)"
                >
                  <Bookmark
                    class="explore-action__icon"
                    :fill="post.favorited ? 'currentColor' : 'none'"
                    aria-hidden="true"
                  />
                  <span class="sr-only">{{
                    post.favorited ? "已收藏" : "收藏"
                  }}</span>
                </button>
              </footer>
            </div>
          </article>

          <div class="explore-feed__footer">
            <button type="button" class="explore-more" disabled>
              加载更多
            </button>
            <span>已显示 {{ postCards.length }} 篇公开内容</span>
          </div>
        </template>
      </main>

      <aside class="explore-sidebar" aria-label="内容辅助信息">
        <section class="explore-panel" aria-labelledby="explore-filter-title">
          <h2 id="explore-filter-title">筛选</h2>
          <div class="explore-filter">
            <div
              v-for="filter in filterGroups"
              :key="filter.label"
              class="explore-filter__row"
            >
              <span class="explore-filter__label">{{ filter.label }}</span>
              <span class="explore-filter__select">
                {{ filter.value }}
                <ChevronDown class="explore-filter__icon" aria-hidden="true" />
              </span>
            </div>
          </div>
        </section>

        <section class="explore-panel" aria-labelledby="explore-tags-title">
          <div class="explore-panel__header">
            <h2 id="explore-tags-title">热门标签</h2>
            <span>查看全部</span>
          </div>

          <div v-if="popularTags.length > 0" class="explore-tag-cloud">
            <span
              v-for="tag in popularTags"
              :key="tag.label"
              class="explore-tag"
            >
              {{ tag.label }}
              <small>{{ tag.count }}</small>
            </span>
          </div>
          <p v-else class="explore-panel__empty">
            当前列表暂无标签
          </p>
        </section>

        <section class="explore-panel" aria-labelledby="explore-trending-title">
          <h2 id="explore-trending-title">当前热门</h2>
          <ol v-if="trendingPosts.length > 0" class="explore-trending">
            <li v-for="post in trendingPosts" :key="post.id ?? post.title">
              <ArrowUpRight class="explore-trending__icon" aria-hidden="true" />
              <span>{{ post.title }}</span>
              <small>{{ trendScoreLabel(post) }}</small>
            </li>
          </ol>
          <p v-else class="explore-panel__empty">
            内容加载后显示热门文章
          </p>
        </section>

        <section
          class="explore-panel"
          aria-labelledby="explore-community-title"
        >
          <div class="explore-panel__header">
            <h2 id="explore-community-title">推荐社区</h2>
            <span>查看全部</span>
          </div>
          <ul class="explore-communities">
            <li v-for="community in suggestedCommunities" :key="community.name">
              <span class="explore-communities__icon">
                <component :is="community.icon" aria-hidden="true" />
              </span>
              <span>
                <strong>{{ community.name }}</strong>
                <small>{{ community.description }}</small>
              </span>
              <RouterLink class="explore-join" to="/community">加入</RouterLink>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ArrowUpRight,
  Bookmark,
  Box,
  ChevronDown,
  Code2,
  Eye,
  FileText,
  GitBranch,
  Heart,
  Inbox,
  MessageCircle,
  Tags,
  Users,
} from "@lucide/vue";
import { computed, toRefs } from "vue";

import type { HomeDiscoveryData } from "@/features/home-discovery";

type DiscoveryPost = HomeDiscoveryData["posts"][number];
type FeedState = "loading" | "ready" | "empty" | "error";

const props = defineProps<{
  discovery: HomeDiscoveryData;
  feedState: FeedState;
  feedError: string;
  engagementActionError: string;
  activeContentCategory: string;
}>();

const emit = defineEmits<{
  selectContentCategory: [category: string];
  retry: [];
  likePost: [postId: string];
  favoritePost: [postId: string];
}>();

const {
  discovery,
  feedState,
  feedError,
  engagementActionError,
  activeContentCategory,
} = toRefs(props);

const categoryTranslations = new Map<string, string>([
  ["All", "全部"],
  ["Frontend", "前端"],
  ["Architecture", "架构"],
  ["Backend", "后端"],
  ["Writing", "写作"],
  ["Product Design", "产品设计"],
  ["System Design", "系统架构"],
  ["AI & ML", "AI 应用"],
]);

const thumbnailClasses = [
  "explore-post__thumb--architecture",
  "explore-post__thumb--design",
  "explore-post__thumb--code",
  "explore-post__thumb--data",
] as const;

const filterGroups = [
  { label: "内容类型", value: "全部类型" },
  { label: "时间", value: "全部时间" },
  { label: "难度", value: "全部级别" },
] as const;

const suggestedCommunities = [
  {
    name: "设计系统",
    description: "公共社区",
    icon: Box,
  },
  {
    name: "前端工程",
    description: "公共社区",
    icon: Code2,
  },
  {
    name: "DevOps 实践",
    description: "公共社区",
    icon: GitBranch,
  },
] as const;

const resultCountLabel = computed(() => {
  if (feedState.value === "loading") {
    return "加载中";
  }
  if (feedState.value === "error") {
    return "--";
  }
  if (feedState.value === "empty") {
    return "0";
  }
  return String(discovery.value.posts.length);
});

const overviewStats = computed(() => [
  {
    label: "文章",
    value: resultCountLabel.value,
    icon: FileText,
  },
  {
    label: "分类",
    value: String(discovery.value.contentCategories.length),
    icon: Tags,
  },
  {
    label: "作者",
    value: String(discovery.value.authors.length),
    icon: Users,
  },
]);

const postCards = computed(() =>
  discovery.value.posts.map((post, index) => ({
    ...post,
    authorInitial: post.author.slice(0, 1) || "知",
    thumbnailClass: thumbnailClasses[index % thumbnailClasses.length],
  })),
);

const popularTags = computed(() => {
  const counts = new Map<string, number>();

  discovery.value.posts.forEach((post) => {
    post.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    )
    .slice(0, 8);
});

const trendingPosts = computed(() =>
  [...postCards.value]
    .sort((left, right) => trendScore(right) - trendScore(left))
    .slice(0, 5),
);

function categoryLabel(category: string): string {
  return categoryTranslations.get(category) ?? category;
}

function trendScore(post: DiscoveryPost): number {
  return post.likes + post.comments;
}

function trendScoreLabel(post: DiscoveryPost): string {
  const score = trendScore(post);

  if (score <= 0) {
    return post.readingTime;
  }

  return `${score} 次互动`;
}

function likeActionLabel(post: DiscoveryPost): string {
  return post.likes > 0 ? `喜欢，${post.likes} 次` : "喜欢";
}

function commentActionLabel(post: DiscoveryPost): string {
  return post.comments > 0 ? `查看评论，${post.comments} 条` : "查看评论";
}
</script>

<style scoped>
.explore-route {
  width: min(100%, 90rem);
  margin: 0 auto;
  padding: var(--space-8) var(--space-10) var(--space-12);
  color: var(--color-text);
}

.explore-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-8);
  align-items: end;
  margin-bottom: var(--space-6);
}

.explore-hero__copy {
  display: grid;
  gap: var(--space-2);
}

.explore-hero h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.75rem;
  line-height: 1.15;
  letter-spacing: 0;
}

.explore-hero p {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.explore-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: var(--space-8);
  margin: 0;
}

.explore-hero__stat {
  display: grid;
  gap: var(--space-1);
}

.explore-hero__stat dt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-strong);
  font-size: 1rem;
  font-weight: 700;
}

.explore-hero__stat dd {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.explore-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-text);
}

.explore-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.explore-tabs__item {
  min-width: 4.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: var(--color-panel-glass);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.8125rem;
  padding: var(--space-2) var(--space-4);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.explore-tabs__item:hover {
  background: color-mix(
    in srgb,
    var(--color-panel-glass) 65%,
    var(--color-text-strong)
  );
  color: var(--color-text-strong);
}

.explore-tabs__item--active {
  background: color-mix(
    in srgb,
    var(--color-primary) 70%,
    var(--color-text-strong)
  );
  color: var(--color-bg);
  font-weight: 700;
}

.explore-tabs__item:focus-visible,
.explore-state__action:focus-visible,
.explore-action:focus-visible,
.explore-more:focus-visible,
.explore-join:focus-visible,
.explore-post__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: var(--space-1);
}

.explore-toolbar {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  color: var(--color-text);
  font-size: 0.8125rem;
}

.explore-toolbar__icon {
  width: 0.875rem;
  height: 0.875rem;
}

.explore-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22.5rem;
  gap: var(--space-6);
  align-items: start;
}

.explore-feed,
.explore-sidebar {
  display: grid;
  gap: var(--space-3);
}

.explore-notice,
.explore-state,
.explore-panel,
.explore-post,
.explore-skeleton {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-panel) 55%, transparent);
}

.explore-notice {
  border-color: color-mix(in srgb, var(--color-danger) 28%, transparent);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
}

.explore-post {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  gap: var(--space-5);
  min-height: 7.75rem;
  padding: var(--space-4) var(--space-5);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.explore-post:hover {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 55%,
    var(--color-border)
  );
  background: color-mix(in srgb, var(--color-panel) 72%, transparent);
  transform: translateY(-1px);
}

.explore-post__content {
  display: grid;
  gap: var(--space-2);
  align-content: start;
  min-width: 0;
}

.explore-post__category {
  color: var(--color-primary-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.explore-post__title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.125rem;
  line-height: 1.3;
  letter-spacing: 0;
}

.explore-post__link {
  color: inherit;
  text-decoration: none;
}

.explore-post__link:hover {
  color: var(--color-primary-soft);
}

.explore-post__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.explore-post__avatar {
  display: inline-grid;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-text-strong) 18%, transparent);
  color: var(--color-text-strong);
  font-size: 0.625rem;
  font-weight: 800;
}

.explore-post__meta-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.explore-post__summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.explore-post__tags,
.explore-tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.explore-chip,
.explore-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 1.5rem;
  border-radius: var(--radius-pill);
  background: var(--color-panel-glass);
  color: var(--color-text);
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-3);
}

.explore-tag small {
  color: var(--color-text-soft);
  font-size: 0.6875rem;
}

.explore-post__aside {
  display: grid;
  grid-template-columns: minmax(7.5rem, 8.5rem) max-content;
  gap: var(--space-4);
  align-items: end;
}

.explore-post__thumb {
  position: relative;
  min-height: 6rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-bg-elevated-2) 80%, transparent),
      transparent
    ),
    radial-gradient(
      circle at 70% 20%,
      color-mix(in srgb, var(--color-primary) 45%, transparent),
      transparent 35%
    );
}

.explore-post__thumb::before,
.explore-post__thumb::after,
.explore-post__thumb span {
  position: absolute;
  content: "";
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  background: color-mix(in srgb, var(--color-bg-elevated) 70%, transparent);
}

.explore-post__thumb::before {
  inset: 18% 52% 42% 16%;
}

.explore-post__thumb::after {
  inset: 48% 18% 18% 46%;
}

.explore-post__thumb span {
  inset: 30% 28% 34% 34%;
}

.explore-post__thumb--design {
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--color-warning) 38%, transparent),
      transparent 52%
    ),
    linear-gradient(
      320deg,
      color-mix(in srgb, var(--color-bg-elevated-2) 90%, transparent),
      transparent
    );
}

.explore-post__thumb--code {
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--color-primary-soft) 30%, transparent),
      transparent 48%
    ),
    linear-gradient(
      320deg,
      color-mix(in srgb, var(--color-bg-reading) 90%, transparent),
      transparent
    );
}

.explore-post__thumb--data {
  background:
    radial-gradient(
      circle at 50% 48%,
      color-mix(in srgb, var(--color-primary) 45%, transparent),
      transparent 28%
    ),
    linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg));
}

.explore-post__actions {
  display: grid;
  gap: var(--space-3);
}

.explore-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 3.25rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.8125rem;
  padding: var(--space-1) var(--space-2);
  text-decoration: none;
}

.explore-action:hover,
.explore-action--active {
  color: var(--color-primary-soft);
}

.explore-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.explore-action__icon {
  width: 1rem;
  height: 1rem;
}

.explore-feed__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-6);
  color: var(--color-text);
  font-size: 0.8125rem;
  padding: 0 0 var(--space-2);
}

.explore-more {
  min-width: 7.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-panel) 60%, transparent);
  color: var(--color-text-strong);
  cursor: not-allowed;
  font-size: 0.8125rem;
  padding: var(--space-2) var(--space-5);
}

.explore-panel {
  padding: var(--space-5);
}

.explore-panel h2 {
  margin: 0 0 var(--space-4);
  color: var(--color-text-strong);
  font-size: 1rem;
  line-height: 1.2;
}

.explore-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.explore-panel__header h2 {
  margin: 0;
}

.explore-panel__header span {
  color: var(--color-primary-soft);
  font-size: 0.8125rem;
}

.explore-panel__empty {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.8125rem;
}

.explore-filter {
  display: grid;
  gap: var(--space-3);
}

.explore-filter__row {
  display: grid;
  grid-template-columns: minmax(6.5rem, 1fr) minmax(9rem, 11.75rem);
  align-items: center;
  gap: var(--space-4);
}

.explore-filter__label {
  color: var(--color-text);
  font-size: 0.8125rem;
}

.explore-filter__select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-bg-elevated) 54%, transparent);
  color: var(--color-text);
  font-size: 0.8125rem;
  padding: var(--space-2) var(--space-3);
}

.explore-filter__icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-text-soft);
}

.explore-trending {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.explore-trending li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text);
  font-size: 0.8125rem;
}

.explore-trending span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.explore-trending small {
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.explore-trending__icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary-soft);
}

.explore-communities {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.explore-communities li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
}

.explore-communities__icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  background: var(--color-panel-glass);
  color: var(--color-primary-soft);
}

.explore-communities__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.explore-communities strong,
.explore-communities small {
  display: block;
}

.explore-communities strong {
  color: var(--color-text-strong);
  font-size: 0.875rem;
}

.explore-communities small {
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.explore-join {
  border: 1px solid
    color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  border-radius: var(--radius-sm);
  color: var(--color-primary-soft);
  font-size: 0.8125rem;
  padding: var(--space-1) var(--space-3);
  text-decoration: none;
}

.explore-state {
  display: grid;
  place-items: center;
  gap: var(--space-4);
  min-height: 14rem;
  padding: var(--space-8);
  color: var(--color-text-soft);
  text-align: center;
}

.explore-state p {
  margin: 0;
}

.explore-state__icon {
  width: 2.25rem;
  height: 2.25rem;
}

.explore-state__action {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-bg);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 700;
  padding: var(--space-2) var(--space-5);
}

.explore-loading {
  display: grid;
  gap: var(--space-3);
}

.explore-skeleton {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 8.5rem;
  gap: var(--space-5);
  min-height: 7.75rem;
  padding: var(--space-4) var(--space-5);
}

.explore-skeleton__body {
  display: grid;
  gap: var(--space-3);
  align-content: center;
}

.explore-skeleton span,
.explore-skeleton strong,
.explore-skeleton p,
.explore-skeleton__media {
  animation: explore-pulse 1.8s ease-in-out infinite;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-strong) 14%, transparent);
}

.explore-skeleton span {
  width: 7rem;
  height: 0.875rem;
}

.explore-skeleton strong {
  width: min(100%, 24rem);
  height: 1.5rem;
}

.explore-skeleton p {
  width: min(100%, 32rem);
  height: 0.875rem;
  margin: 0;
}

.explore-skeleton p:last-child {
  width: min(72%, 22rem);
}

.explore-skeleton__media {
  min-height: 6rem;
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
  border: 0;
}

@keyframes explore-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@media (max-width: 1180px) {
  .explore-route {
    padding-inline: var(--space-6);
  }

  .explore-shell {
    grid-template-columns: 1fr;
  }

  .explore-sidebar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .explore-route {
    padding: var(--space-6) var(--space-4) var(--space-12);
  }

  .explore-hero {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .explore-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .explore-post,
  .explore-skeleton {
    grid-template-columns: 1fr;
  }

  .explore-post__aside {
    grid-template-columns: 1fr;
  }

  .explore-post__actions {
    display: flex;
    justify-content: flex-end;
  }

  .explore-post__thumb,
  .explore-skeleton__media {
    min-height: 8rem;
  }

  .explore-sidebar {
    grid-template-columns: 1fr;
  }

  .explore-filter__row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .explore-feed__footer {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
