<template>
  <section class="explore-route" aria-labelledby="explore-route-title">
    <header class="explore-header">
      <div class="explore-header__inner">
        <div class="explore-header__titles">
          <p class="eyebrow">Explore</p>
          <h1 id="explore-route-title" class="title">发现内容</h1>
          <p class="subtitle">
            按主题浏览公开文章，沿着分类进入可阅读的内容列表。
          </p>
        </div>

        <dl class="explore-header__summary" aria-label="发现页状态">
          <div>
            <dt>公开内容</dt>
            <dd>{{ resultCountLabel }}</dd>
          </div>
          <div>
            <dt>当前分类</dt>
            <dd>{{ activeContentCategory }}</dd>
          </div>
          <div>
            <dt>排序</dt>
            <dd>最新发布</dd>
          </div>
        </dl>

        <nav class="explore-categories" aria-label="内容分类">
          <button
            v-for="category in discovery.contentCategories"
            :key="category"
            type="button"
            class="category-btn"
            :class="{ 'is-active': category === activeContentCategory }"
            :aria-selected="category === activeContentCategory"
            @click="selectContentCategory(category)"
          >
            {{ category }}
          </button>
        </nav>
      </div>
    </header>

    <div class="explore-main">
      <section class="explore-context" aria-label="当前浏览内容">
        <div>
          <p class="explore-context__label">正在浏览</p>
          <h2>{{ browsingTitle }}</h2>
        </div>
        <p>{{ browsingSummary }}</p>
      </section>

      <div v-if="engagementActionError" class="alert-notice" role="alert">
        {{ engagementActionError }}
      </div>

      <div
        v-if="feedState === 'loading'"
        class="feed-loading"
        aria-live="polite"
      >
        <div class="skeleton-post" v-for="i in 4" :key="i">
          <div class="skeleton-meta"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-summary"></div>
          <div class="skeleton-summary short"></div>
          <div class="skeleton-footer"></div>
        </div>
      </div>

      <div
        v-else-if="feedState === 'error'"
        class="feed-state error"
        role="alert"
      >
        <p class="state-message">
          {{ feedError || "公开内容加载失败，请检查网络后重试" }}
        </p>
        <button type="button" class="btn-primary" @click="retry">
          重试加载
        </button>
      </div>

      <div v-else-if="feedState === 'empty'" class="feed-state empty">
        <Inbox class="empty-icon" aria-hidden="true" />
        <p class="state-message">当前分类下暂无公开内容</p>
      </div>

      <div v-else class="feed-list" role="feed" aria-busy="false">
        <article
          v-for="post in discovery.posts"
          :key="post.id ?? post.href ?? post.title"
          class="post-card"
        >
          <div class="post-header">
            <div class="post-meta">
              <span class="meta-category">{{ post.category }}</span>
              <span class="meta-separator" aria-hidden="true">&middot;</span>
              <span class="meta-author">{{ post.author }}</span>
              <span class="meta-separator" aria-hidden="true">&middot;</span>
              <time class="meta-date">{{ post.publishedAt }}</time>
            </div>
            <span class="meta-reading-time">{{ post.readingTime }}</span>
          </div>

          <h2 class="post-title">
            <RouterLink v-if="post.href" :to="post.href" class="post-link">
              {{ post.title }}
            </RouterLink>
            <span v-else>{{ post.title }}</span>
          </h2>

          <p class="post-summary">{{ post.summary }}</p>

          <div class="post-tags" v-if="post.tags && post.tags.length > 0">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{
              tag
            }}</span>
          </div>

          <footer class="post-actions">
            <div class="actions-start">
              <button
                type="button"
                class="action-btn"
                :class="{ 'is-active': post.liked }"
                :disabled="!post.id || post.engagementUnavailable"
                :aria-pressed="post.liked === true"
                :aria-label="likeActionLabel(post)"
                @click="post.id && likePost(post.id)"
                title="喜欢"
              >
                <ThumbsUp class="icon" aria-hidden="true" />
                <span class="count">{{
                  post.likes > 0 ? post.likes : "喜欢"
                }}</span>
              </button>

              <RouterLink
                v-if="post.href"
                :to="`${post.href}#comments`"
                class="action-btn"
                :aria-label="commentActionLabel(post)"
                title="评论"
              >
                <MessageSquare class="icon" aria-hidden="true" />
                <span class="count">{{
                  post.comments > 0 ? post.comments : "评论"
                }}</span>
              </RouterLink>
            </div>

            <button
              type="button"
              class="action-btn favorite-btn"
              :class="{ 'is-active': post.favorited }"
              :disabled="!post.id || post.engagementUnavailable"
              :aria-pressed="post.favorited === true"
              @click="post.id && favoritePost(post.id)"
              title="收藏"
            >
              <Bookmark
                class="icon"
                :fill="post.favorited ? 'currentColor' : 'none'"
                aria-hidden="true"
              />
              <span class="sr-only">{{
                post.favorited ? "已收藏" : "收藏"
              }}</span>
            </button>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Bookmark, Inbox, MessageSquare, ThumbsUp } from "@lucide/vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useHomeDiscoveryPage } from "@/features/home-discovery";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const {
  discovery,
  feedState,
  feedError,
  engagementActionError,
  activeContentCategory,
  selectContentCategory,
  retry,
  likePost,
  favoritePost,
} = useHomeDiscoveryPage({
  isLoggedIn: () => authStore.isLoggedIn,
  restoreSession: () => authStore.restore(),
  redirectToLogin: async () => {
    await router.push({
      path: "/auth/login",
      query: {
        redirect: route.fullPath,
      },
    });
  },
});

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
  return String(discovery.posts.length);
});

const browsingTitle = computed(() =>
  activeContentCategory.value === "全部"
    ? "全部公开内容"
    : `${activeContentCategory.value}内容`,
);

const browsingSummary = computed(() => {
  if (feedState.value === "loading") {
    return "正在载入公开文章。";
  }
  if (feedState.value === "error") {
    return "公开文章列表暂时不可用。";
  }
  if (feedState.value === "empty") {
    return "这个分类还没有公开文章。";
  }
  return `共 ${discovery.posts.length} 篇内容，按最新发布展示。`;
});

function likeActionLabel(post: (typeof discovery.posts)[number]): string {
  return post.likes > 0 ? `喜欢，${post.likes} 次` : "喜欢";
}

function commentActionLabel(post: (typeof discovery.posts)[number]): string {
  return post.comments > 0 ? `查看评论，${post.comments} 条` : "查看评论";
}
</script>

<style scoped>
.explore-route {
  display: grid;
  gap: var(--space-8);
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) 120px;
}

.explore-header {
  padding: 0 0 var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.explore-header__inner {
  display: grid;
  gap: var(--space-5);
}

.explore-header__titles {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: var(--font-weight-h1);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.subtitle {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.explore-header__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.explore-header__summary div {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-right: 1px solid var(--color-border);
}

.explore-header__summary div:first-child {
  padding-left: 0;
}

.explore-header__summary div:last-child {
  border-right: 0;
}

.explore-header__summary dt {
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.explore-header__summary dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1rem;
  font-weight: 800;
}

.explore-categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.category-btn {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  color: var(--color-text-soft);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 6px 14px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.category-btn:hover {
  background: var(--color-panel-glass);
  color: var(--color-text);
}

.category-btn.is-active {
  background: var(--color-text-strong);
  color: var(--color-bg);
  font-weight: 600;
}

.category-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Main Content Area */
.explore-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.explore-context {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.explore-context__label {
  margin: 0 0 var(--space-1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.explore-context h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.explore-context p:last-child {
  max-width: 360px;
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.875rem;
  line-height: 1.5;
  text-align: right;
}

.alert-notice {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.875rem;
  padding: var(--space-3) var(--space-4);
}

.feed-state {
  align-items: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  justify-content: center;
  min-height: 200px;
  padding: var(--space-8);
  text-align: center;
}

.state-message {
  color: var(--color-text-soft);
  font-size: 0.9375rem;
  margin: 0;
}

.empty-icon {
  width: var(--space-8);
  height: var(--space-8);
  opacity: 0.8;
}

.btn-primary {
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-bg);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px 16px;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-strong);
}

/* Post Cards */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.post-card {
  background: transparent;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) 0 var(--space-6);
  transition: transform 0.2s ease;
}

.post-card:last-child {
  border-bottom: none;
}

.post-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.post-meta {
  align-items: center;
  color: var(--color-text-soft);
  display: flex;
  font-size: 0.8125rem;
  gap: var(--space-2);
}

.meta-category {
  color: var(--color-text);
  font-weight: 500;
}

.meta-separator {
  opacity: 0.4;
}

.meta-reading-time {
  color: var(--color-text-soft);
  font-size: 0.8125rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-h3);
  letter-spacing: -0.01em;
  line-height: 1.4;
  margin: 0;
}

.post-link {
  color: var(--color-text-strong);
  text-decoration: none;
}

.post-link:hover {
  color: var(--color-primary);
}

.post-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 2px;
}

.post-summary {
  color: var(--color-text-soft);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.tag {
  background: var(--color-panel-glass);
  border-radius: var(--radius-sm);
  color: var(--color-text-soft);
  font-size: 0.75rem;
  padding: 2px 8px;
}

.post-actions {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
}

.actions-start {
  display: flex;
  gap: var(--space-4);
}

.action-btn {
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-soft);
  cursor: pointer;
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  margin-left: -8px; /* Optical alignment */
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn:hover {
  background: var(--color-panel-glass);
  color: var(--color-text);
}

.action-btn.is-active {
  color: var(--color-primary);
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.action-btn .icon {
  height: 18px;
  width: 18px;
}

.action-btn .count {
  font-size: 0.8125rem;
  font-weight: 500;
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

/* Skeleton Loading */
.feed-loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.skeleton-post {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) 0 var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.skeleton-meta,
.skeleton-title,
.skeleton-summary,
.skeleton-footer {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.skeleton-meta {
  height: 16px;
  width: 40%;
}
.skeleton-title {
  height: 28px;
  width: 70%;
  margin-top: 4px;
}
.skeleton-summary {
  height: 16px;
  width: 100%;
}
.skeleton-summary.short {
  width: 85%;
}
.skeleton-footer {
  height: 24px;
  width: 30%;
  margin-top: 8px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 640px) {
  .explore-header {
    padding: var(--space-5) var(--space-4) var(--space-4);
  }

  .explore-route {
    padding: 0 0 var(--space-12);
    gap: var(--space-4);
  }

  .explore-main {
    padding: var(--space-4);
  }

  .explore-header__summary {
    grid-template-columns: 1fr;
  }

  .explore-header__summary div,
  .explore-header__summary div:first-child {
    padding: var(--space-3) 0;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .explore-header__summary div:last-child {
    border-bottom: 0;
  }

  .explore-context {
    align-items: start;
    flex-direction: column;
  }

  .explore-context p:last-child {
    max-width: none;
    text-align: left;
  }
}
</style>
