<template>
  <section class="community-route" aria-labelledby="community-route-title">
    <div class="community-route__layout">
      <aside class="community-route__sidebar" aria-label="主题社区">
        <h2 class="community-route__sidebar-title">All Topics</h2>

        <div v-if="topicState === 'loading'" class="community-route__state">
          正在加载主题...
        </div>
        <div
          v-else-if="topicState === 'error'"
          class="community-route__state community-route__state--error"
          role="alert"
        >
          <span>{{ topicError || "主题社区加载失败" }}</span>
          <button
            type="button"
            class="community-route__btn"
            @click="retryTopics"
          >
            重试
          </button>
        </div>
        <div v-else-if="topicState === 'empty'" class="community-route__state">
          暂无主题
        </div>
        <div v-else class="community-route__topic-list">
          <button
            type="button"
            class="community-route__topic-btn"
            :class="{
              'community-route__topic-btn--active': activeTopicSlug === '',
            }"
            :aria-pressed="activeTopicSlug === ''"
            @click="selectTopic('')"
          >
            <LayoutGrid class="community-route__topic-icon" />
            <span>全部主题</span>
          </button>
          <button
            v-for="topic in topics"
            :key="topic.id"
            type="button"
            class="community-route__topic-btn"
            :class="{
              'community-route__topic-btn--active':
                activeTopicSlug === topic.slug,
            }"
            :aria-pressed="activeTopicSlug === topic.slug"
            @click="selectTopic(topic.slug)"
          >
            <component
              :is="getTopicIcon(topic.slug)"
              class="community-route__topic-icon"
            />
            <span>{{ topic.label }}</span>
          </button>
        </div>
      </aside>

      <main class="community-route__main" aria-label="社区内容">
        <header class="community-route__main-header">
          <div class="community-route__main-header-info">
            <h1 id="community-route-title">{{ activeTopicTitle }}</h1>
            <p>{{ activeTopicSummary }}</p>
          </div>
          <div class="community-route__main-header-actions">
            <button
              type="button"
              class="community-route__btn community-route__btn--primary"
              disabled
              title="社区关注能力暂未接入"
            >
              Follow
            </button>
            <button
              type="button"
              class="community-route__btn-icon"
              disabled
              aria-label="更多社区操作暂未接入"
            >
              <MoreHorizontal aria-hidden="true" />
            </button>
          </div>
        </header>

        <div class="community-route__tabs" role="list" aria-label="内容排序">
          <span class="community-route__tab community-route__tab--active">
            Latest
          </span>
          <span class="community-route__tab community-route__tab--disabled">
            Top
          </span>
          <span class="community-route__tab community-route__tab--disabled">
            Unanswered
          </span>
        </div>

        <div v-if="feedState === 'loading'" class="community-route__state">
          正在加载社区内容...
        </div>
        <div
          v-else-if="feedState === 'error'"
          class="community-route__state community-route__state--error"
          role="alert"
        >
          <span>{{ feedError || "社区内容加载失败" }}</span>
          <button
            type="button"
            class="community-route__btn"
            @click="retryPosts"
          >
            重试
          </button>
        </div>
        <div v-else-if="feedState === 'empty'" class="community-route__state">
          当前主题下暂无公开内容
        </div>
        <div v-else class="community-route__feed">
          <article
            v-for="post in posts"
            :key="post.id"
            class="community-route__post-card"
          >
            <div class="community-route__post-header">
              <div class="community-route__post-author">
                <CircleUserRound class="community-route__post-avatar" />
                <span>{{ post.author }}</span>
              </div>
              <time class="community-route__post-time">{{
                post.publishedAt
              }}</time>
            </div>
            <div class="community-route__post-content">
              <h3>
                <RouterLink :to="post.href">{{ post.title }}</RouterLink>
              </h3>
              <p>{{ post.summary }}</p>
            </div>
            <div class="community-route__post-footer">
              <div class="community-route__post-tags">
                <span v-if="activeTopic" class="community-route__post-tag">
                  {{ activeTopic.label }}
                </span>
                <span
                  v-else-if="post.commentCount > 10"
                  class="community-route__post-tag"
                >
                  Hot
                </span>
              </div>
              <div class="community-route__post-stats">
                <RouterLink
                  :to="`${post.href}#comments`"
                  class="community-route__post-stat-btn"
                  :aria-label="`查看 ${post.title} 的评论`"
                >
                  <MessageSquare
                    class="community-route__post-stat-icon"
                    aria-hidden="true"
                  />
                  <span>{{ post.commentCount }}</span>
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </main>

      <aside class="community-route__extra" aria-label="附加信息">
        <section
          v-if="topicState === 'ready' && trendingTopics.length > 0"
          class="community-route__extra-section"
        >
          <h3>热门主题</h3>
          <div class="community-route__trending-list">
            <button
              v-for="topic in trendingTopics"
              :key="topic.id"
              class="community-route__trending-item"
              @click="selectTopic(topic.slug)"
            >
              <div class="community-route__trending-item-name">
                <component
                  :is="getTopicIcon(topic.slug)"
                  class="community-route__trending-icon"
                />
                <span>{{ topic.label }}</span>
              </div>
            </button>
          </div>
        </section>

        <section
          v-if="feedState === 'ready' && latestPosts.length > 0"
          class="community-route__extra-section"
        >
          <h3>最新内容</h3>
          <div class="community-route__reply-list">
            <div
              v-for="post in latestPosts"
              :key="post.id"
              class="community-route__reply-item"
            >
              <CircleUserRound
                class="community-route__reply-avatar"
                aria-hidden="true"
              />
              <div class="community-route__reply-content">
                <div class="community-route__reply-header">
                  <span class="community-route__reply-author">{{
                    post.author
                  }}</span>
                  <span class="community-route__reply-time">{{
                    post.publishedAt
                  }}</span>
                </div>
                <RouterLink
                  :to="post.href"
                  class="community-route__reply-title"
                >
                  {{ post.title }}
                </RouterLink>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from "vue";

import {
  Brain,
  CircleUserRound,
  Hash,
  LayoutGrid,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  PenTool,
  Server,
  Settings,
  TrendingUp,
} from "@lucide/vue";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { useCommunityPage } from "@/features/community";

const {
  topics,
  posts,
  topicState,
  feedState,
  topicError,
  feedError,
  activeTopicSlug,
  selectTopic,
  retryTopics,
  retryPosts,
} = useCommunityPage();

const activeTopic = computed(() =>
  topics.find((topic) => topic.slug === activeTopicSlug.value),
);

const activeTopicTitle = computed(() =>
  activeTopic.value ? `${activeTopic.value.label}社区` : "全部社区内容",
);

const activeTopicSummary = computed(() =>
  activeTopic.value
    ? "展示这个主题下的最新公开文章。"
    : "展示所有主题下的最新公开文章。",
);

const trendingTopics = computed(() => topics.slice(0, 5));
const latestPosts = computed(() => posts.slice(0, 4));

function getTopicIcon(slug: string): Component {
  const iconMap: Record<string, Component> = {
    "product-design": PenTool,
    "system-design": Settings,
    frontend: Monitor,
    backend: Server,
    "ai-ml": Brain,
    devops: Settings,
    "career-growth": TrendingUp,
  };
  return iconMap[slug] || Hash;
}
</script>

<style scoped>
.community-route {
  padding: var(--space-8) var(--space-4);
  max-width: 1280px;
  margin: 0 auto;
  color: var(--color-text);
}

.community-route__layout {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr) 17.5rem;
  gap: var(--space-10);
  align-items: start;
}

.community-route__sidebar {
  position: sticky;
  top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.community-route__sidebar-title {
  margin: 0;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-strong);
}

.community-route__topic-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.community-route__topic-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-soft);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.community-route__topic-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.community-route__topic-btn:hover {
  color: var(--color-text-strong);
  background: color-mix(in srgb, var(--color-text-soft) 10%, transparent);
}

.community-route__topic-btn:focus-visible,
.community-route__btn:focus-visible,
.community-route__btn-icon:focus-visible,
.community-route__tab:focus-visible,
.community-route__post-content a:focus-visible,
.community-route__post-stat-btn:focus-visible,
.community-route__trending-item:focus-visible,
.community-route__reply-title:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.community-route__topic-btn--active {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 40%,
    var(--color-border)
  );
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.community-route__topic-btn--active:hover {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.community-route__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.community-route__main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6);
  background: color-mix(in srgb, var(--color-bg-elevated) 50%, transparent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.community-route__main-header-info h1 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-h1);
  color: var(--color-text-strong);
}

.community-route__main-header-info p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
}

.community-route__main-header-actions {
  display: flex;
  gap: var(--space-2);
}

.community-route__btn {
  min-height: 2.25rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-strong);
  font-weight: var(--font-weight-h3);
  font-size: var(--font-size-14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.community-route__btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.community-route__btn:disabled,
.community-route__btn-icon:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.community-route__btn--primary {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.community-route__btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.community-route__btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-soft);
  cursor: pointer;
  transition: all 0.2s ease;
}

.community-route__btn-icon:hover:not(:disabled) {
  color: var(--color-text-strong);
  background: var(--color-bg-hover);
}

.community-route__tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-4);
}

.community-route__tab {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-h3);
  cursor: default;
}

.community-route__tab--active {
  background: var(--color-bg-elevated);
  color: var(--color-text-strong);
}

.community-route__tab--disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.community-route__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.community-route__post-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s ease;
}

.community-route__post-card:hover {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 30%,
    var(--color-border-strong)
  );
}

.community-route__post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.community-route__post-author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-strong);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-h3);
}

.community-route__post-avatar {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-soft);
}

.community-route__post-time {
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
}

.community-route__post-content h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-h1);
  line-height: 1.4;
}

.community-route__post-content h3 a {
  color: var(--color-text-strong);
  text-decoration: none;
}

.community-route__post-content h3 a:hover {
  color: var(--color-primary);
}

.community-route__post-content p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
  line-height: 1.6;
}

.community-route__post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2);
}

.community-route__post-tags {
  display: flex;
  gap: var(--space-2);
}

.community-route__post-tag {
  padding: calc(var(--space-1) / 2) var(--space-2);
  background: var(--color-bg-elevated-2);
  color: var(--color-text-soft);
  font-size: var(--font-size-12);
  border-radius: var(--radius-sm);
}

.community-route__post-stats {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.community-route__post-stat-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
  padding: 0;
  text-decoration: none;
  transition: color 0.2s ease;
}

.community-route__post-stat-btn[href]:hover {
  color: var(--color-text-strong);
}

.community-route__post-stat-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.community-route__extra {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  position: sticky;
  top: var(--space-6);
}

.community-route__extra-section h3 {
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-strong);
}

.community-route__trending-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.community-route__trending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-soft);
  transition: color 0.2s ease;
}

.community-route__trending-item:hover {
  color: var(--color-text-strong);
}

.community-route__trending-item-name {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-14);
}

.community-route__trending-icon {
  width: 1rem;
  height: 1rem;
}

.community-route__reply-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.community-route__reply-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.community-route__reply-avatar {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-text-soft);
  flex-shrink: 0;
}

.community-route__reply-content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-1) / 2);
}

.community-route__reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.community-route__reply-author {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-strong);
}

.community-route__reply-time {
  font-size: var(--font-size-12);
  color: var(--color-text-soft);
}

.community-route__reply-title {
  font-size: var(--font-size-14);
  color: var(--color-text-soft);
  text-decoration: none;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.community-route__reply-title:hover {
  color: var(--color-text-strong);
}

.community-route__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  color: var(--color-text-soft);
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.community-route__state--error {
  color: var(--color-danger);
  border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
}

@media (max-width: 1024px) {
  .community-route__layout {
    grid-template-columns: 13.75rem minmax(0, 1fr);
  }

  .community-route__extra {
    display: none;
  }
}

@media (max-width: 768px) {
  .community-route__layout {
    grid-template-columns: 1fr;
  }
  .community-route__sidebar {
    position: static;
  }
}
</style>
