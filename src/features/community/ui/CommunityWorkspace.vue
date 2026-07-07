<template>
  <section class="community-route" aria-labelledby="community-route-title">
    <div class="community-route__layout">
      <aside class="community-route__sidebar" aria-label="主题社区">
        <h2 class="community-route__sidebar-title">主题社区</h2>

        <div v-if="topicState === 'loading'" class="community-route__state">
          正在加载主题
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
            @click="emit('retryTopics')"
          >
            重试
          </button>
        </div>
        <div v-else-if="topicState === 'empty'" class="community-route__state">
          暂无公开主题
        </div>
        <div v-else class="community-route__topic-list">
          <button
            type="button"
            class="community-route__topic-btn"
            :class="{
              'community-route__topic-btn--active': activeTopicSlug === '',
            }"
            :aria-pressed="activeTopicSlug === ''"
            @click="emit('selectTopic', '')"
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
            @click="emit('selectTopic', topic.slug)"
          >
            <component
              :is="getTopicIcon(topic.slug)"
              class="community-route__topic-icon"
            />
            <span>{{ topic.label }}</span>
          </button>
          <button
            type="button"
            class="community-route__topic-btn"
            disabled
            title="更多主题暂未接入"
          >
            <Rows3 class="community-route__topic-icon" />
            <span>更多主题</span>
          </button>
        </div>

        <button
          type="button"
          class="community-route__browse-btn"
          disabled
          title="完整社区浏览暂未接入"
        >
          <LayoutGrid class="community-route__browse-icon" aria-hidden="true" />
          <span>浏览社区</span>
        </button>
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
              title="关注功能暂未接入"
            >
              关注
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
          <span
            class="community-route__tab community-route__tab--active"
            role="listitem"
          >
            最新
          </span>
          <span
            class="community-route__tab community-route__tab--disabled"
            role="listitem"
            aria-disabled="true"
          >
            热门
          </span>
          <span
            class="community-route__tab community-route__tab--disabled"
            role="listitem"
            aria-disabled="true"
          >
            待回复
          </span>
        </div>
        <p class="community-route__data-note">互动统计暂未接入</p>

        <div v-if="feedState === 'loading'" class="community-route__state">
          正在加载近期讨论
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
            @click="emit('retryPosts')"
          >
            重试
          </button>
        </div>
        <div v-else-if="feedState === 'empty'" class="community-route__state">
          当前主题暂无讨论
        </div>
        <div v-else class="community-route__feed">
          <article
            v-for="post in posts"
            :key="post.id"
            class="community-route__post-card"
          >
            <CircleUserRound class="community-route__post-avatar" />
            <div class="community-route__post-body">
              <div class="community-route__post-header">
                <span class="community-route__post-author">{{
                  post.author
                }}</span>
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
                  <span v-else class="community-route__post-tag">
                    公开讨论
                  </span>
                </div>
                <div class="community-route__post-stats">
                  <button
                    type="button"
                    class="community-route__post-stat-btn"
                    disabled
                    title="喜欢数据暂未接入"
                  >
                    <Heart
                      class="community-route__post-stat-icon"
                      aria-hidden="true"
                    />
                    <span class="community-route__sr-only">
                      喜欢数据暂不可用
                    </span>
                  </button>
                  <RouterLink
                    :to="`${post.href}#comments`"
                    class="community-route__post-stat-btn"
                    :aria-label="`查看 ${post.title} 的评论`"
                  >
                    <MessageCircle
                      class="community-route__post-stat-icon"
                      aria-hidden="true"
                    />
                    <span>{{ post.commentCount }}</span>
                  </RouterLink>
                  <button
                    type="button"
                    class="community-route__post-stat-btn"
                    disabled
                    title="收藏功能暂未接入"
                  >
                    <Bookmark
                      class="community-route__post-stat-icon"
                      aria-hidden="true"
                    />
                    <span class="community-route__sr-only">
                      收藏暂不可用
                    </span>
                  </button>
                </div>
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
          <h3>主题导航</h3>
          <p class="community-route__extra-note">计数暂未接入</p>
          <div class="community-route__trending-list">
            <button
              v-for="topic in trendingTopics"
              :key="topic.id"
              type="button"
              class="community-route__trending-item"
              @click="emit('selectTopic', topic.slug)"
            >
              <div class="community-route__trending-item-name">
                <component
                  :is="getTopicIcon(topic.slug)"
                  class="community-route__trending-icon"
                />
                <span>{{ topic.label }}</span>
              </div>
              <span class="community-route__trending-unavailable"
                >暂无计数</span
              >
            </button>
          </div>
        </section>

        <section
          v-if="feedState === 'ready' && latestPosts.length > 0"
          class="community-route__extra-section"
        >
          <h3>近期讨论</h3>
          <p class="community-route__extra-note">回复流暂未接入</p>
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
  Bookmark,
  CircleUserRound,
  Code2,
  Cpu,
  Hash,
  Heart,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  PenTool,
  Rows3,
  Server,
  Settings,
  TrendingUp,
  Users,
} from "@lucide/vue";
import { computed, toRefs } from "vue";
import { RouterLink } from "vue-router";

import type {
  CommunityLoadState,
  CommunityPost,
  CommunityTopic,
} from "@/features/community";

const props = defineProps<{
  topics: readonly CommunityTopic[];
  posts: readonly CommunityPost[];
  topicState: CommunityLoadState;
  feedState: CommunityLoadState;
  topicError: string;
  feedError: string;
  activeTopicSlug: string;
}>();

const emit = defineEmits<{
  selectTopic: [slug: string];
  retryTopics: [];
  retryPosts: [];
}>();

const {
  topics,
  posts,
  topicState,
  feedState,
  topicError,
  feedError,
  activeTopicSlug,
} = toRefs(props);

const activeTopic = computed(() =>
  topics.value.find((topic) => topic.slug === activeTopicSlug.value),
);

const activeTopicTitle = computed(() =>
  activeTopic.value ? activeTopic.value.label : "全部社区",
);

const activeTopicSummary = computed(() =>
  activeTopic.value
    ? "当前主题下的近期公开讨论。"
    : "跨主题的近期公开讨论。",
);

// Community counts, likes, saves, and reply feeds are not exposed by the current
// data owner, so the UI marks those areas as degraded instead of fabricating activity.
const trendingTopics = computed(() => topics.value.slice(0, 5));
const latestPosts = computed(() => posts.value.slice(0, 5));

function getTopicIcon(slug: string): Component {
  const iconMap: Record<string, Component> = {
    "product-design": PenTool,
    "system-design": Settings,
    frontend: Code2,
    backend: Server,
    "ai-ml": Cpu,
    devops: PackageCheck,
    "career-growth": TrendingUp,
    community: Users,
  };
  return iconMap[slug] || Hash;
}
</script>

<style scoped>
.community-route {
  --community-shell: color-mix(
    in srgb,
    var(--color-bg-elevated) 48%,
    transparent
  );
  --community-shell-strong: color-mix(
    in srgb,
    var(--color-bg-elevated-2) 44%,
    transparent
  );
  --community-line: color-mix(
    in srgb,
    var(--color-border-strong) 82%,
    transparent
  );
  --community-muted-line: color-mix(
    in srgb,
    var(--color-border) 70%,
    transparent
  );

  max-width: 95rem;
  margin: 0 auto;
  padding: var(--space-5) var(--space-6) var(--space-6);
  color: var(--color-text);
  letter-spacing: 0;
}

.community-route__layout {
  display: grid;
  grid-template-columns: minmax(13.5rem, 16rem) minmax(0, 1fr) minmax(
      17rem,
      21rem
    );
  gap: var(--space-4);
  align-items: start;
  min-width: 0;
}

.community-route__sidebar,
.community-route__main,
.community-route__extra-section {
  border: 1px solid var(--community-line);
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--color-bg-elevated) 66%, transparent),
      color-mix(in srgb, var(--color-bg) 72%, transparent)
    ),
    var(--community-shell);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(1.5rem);
}

.community-route__sidebar,
.community-route__extra {
  position: sticky;
  top: calc(var(--space-6) + var(--space-5));
}

.community-route__sidebar {
  display: flex;
  flex-direction: column;
  min-height: min(48rem, calc(100vh - var(--space-12) * 2));
  padding: var(--space-6);
  border-radius: var(--radius-lg);
}

.community-route__sidebar-title {
  margin: 0;
  font-size: var(--font-size-18, 1.125rem);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-strong);
}

.community-route__topic-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.community-route__topic-btn,
.community-route__browse-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 2.75rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-soft);
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.community-route__topic-icon,
.community-route__browse-icon {
  flex: 0 0 auto;
  width: 1.125rem;
  height: 1.125rem;
}

.community-route__topic-btn:hover:not(:disabled),
.community-route__browse-btn:hover:not(:disabled) {
  color: var(--color-text-strong);
  background: color-mix(in srgb, var(--color-text-soft) 9%, transparent);
}

.community-route__topic-btn:focus-visible,
.community-route__btn:focus-visible,
.community-route__btn-icon:focus-visible,
.community-route__post-content a:focus-visible,
.community-route__post-stat-btn:focus-visible,
.community-route__trending-item:focus-visible,
.community-route__browse-btn:focus-visible,
.community-route__reply-title:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: var(--space-1);
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

.community-route__topic-btn--active:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.community-route__topic-btn:disabled,
.community-route__browse-btn:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.community-route__browse-btn {
  margin-top: auto;
  justify-content: center;
  border-color: var(--community-muted-line);
  background: var(--community-shell-strong);
  color: var(--color-text);
}

.community-route__main {
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.community-route__main-header,
.community-route__tabs,
.community-route__data-note,
.community-route__feed,
.community-route__state {
  margin-inline: var(--space-3);
}

.community-route__main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
  margin-top: var(--space-6);
}

.community-route__main-header-info h1 {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-32, 2rem);
  font-weight: var(--font-weight-h1);
  line-height: var(--line-height-label);
  color: var(--color-text-strong);
}

.community-route__main-header-info p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-15, 0.9375rem);
  line-height: 1.5;
}

.community-route__main-header-actions {
  display: flex;
  flex: 0 0 auto;
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
  font-size: var(--font-size-14, 0.875rem);
  cursor: pointer;
  transition: all 0.2s ease;
}

.community-route__btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.community-route__btn:disabled,
.community-route__btn-icon:disabled {
  cursor: not-allowed;
  opacity: 0.66;
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
  border-radius: var(--radius-pill);
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
  width: fit-content;
  display: flex;
  gap: 0;
  margin-top: var(--space-6);
  padding: var(--space-1);
  border: 1px solid var(--community-muted-line);
  border-radius: var(--radius-pill);
  background: var(--community-shell-strong);
}

.community-route__tab {
  min-width: 5.5rem;
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-soft);
  font-size: var(--font-size-14, 0.875rem);
  font-weight: var(--font-weight-h3);
  cursor: default;
  text-align: center;
}

.community-route__tab--active {
  background: color-mix(in srgb, var(--color-text-strong) 88%, transparent);
  color: var(--color-bg);
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--color-text-strong) 30%, transparent);
}

.community-route__data-note {
  margin-top: var(--space-3);
  margin-bottom: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
  line-height: 1.5;
}

.community-route__tab--disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.community-route__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-5);
  margin-bottom: var(--space-3);
}

.community-route__post-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-bg-reading) 62%, transparent);
  border: 1px solid var(--community-muted-line);
  border-radius: var(--radius-lg);
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.community-route__post-card:hover {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 30%,
    var(--color-border-strong)
  );
  background: color-mix(in srgb, var(--color-bg-reading) 82%, transparent);
}

.community-route__post-body {
  min-width: 0;
  flex: 1;
}

.community-route__post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-1);
}

.community-route__post-author {
  color: var(--color-text-strong);
  font-size: var(--font-size-13, 0.8125rem);
  font-weight: var(--font-weight-h3);
}

.community-route__post-avatar {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--color-text-soft);
}

.community-route__post-time {
  flex: 0 0 auto;
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
}

.community-route__post-content h3 {
  margin: 0 0 var(--space-1);
  font-size: var(--font-size-18, 1.125rem);
  font-weight: var(--font-weight-h1);
  line-height: 1.32;
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
  font-size: var(--font-size-13, 0.8125rem);
  line-height: 1.45;
}

.community-route__post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2);
  gap: var(--space-4);
}

.community-route__post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-width: 0;
}

.community-route__post-tag {
  max-width: 100%;
  padding: calc(var(--space-1) / 2) var(--space-2);
  background: var(--color-bg-elevated-2);
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
  border-radius: var(--radius-pill);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.community-route__post-stats {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-left: auto;
}

.community-route__post-stat-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  font-size: var(--font-size-13, 0.8125rem);
  padding: 0;
  text-decoration: none;
  transition: color 0.2s ease;
}

.community-route__post-stat-btn:not(:disabled) {
  cursor: pointer;
}

.community-route__post-stat-btn:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.community-route__post-stat-btn:not(:disabled):hover {
  color: var(--color-text-strong);
}

.community-route__post-stat-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.community-route__extra {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.community-route__extra-section {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
}

.community-route__extra-section h3 {
  margin: 0;
  font-size: var(--font-size-18, 1.125rem);
  font-weight: var(--font-weight-h3);
  color: var(--color-text-strong);
}

.community-route__extra-note {
  margin: var(--space-1) 0 var(--space-4);
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
  line-height: 1.5;
}

.community-route__trending-list {
  display: flex;
  flex-direction: column;
}

.community-route__trending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  background: transparent;
  border: none;
  border-top: 1px solid var(--community-muted-line);
  padding: var(--space-3) 0;
  cursor: pointer;
  color: var(--color-text-soft);
  transition: color 0.2s ease;
  text-align: left;
}

.community-route__trending-item:hover {
  color: var(--color-text-strong);
}

.community-route__trending-item-name {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  font-size: var(--font-size-14, 0.875rem);
}

.community-route__trending-item-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.community-route__trending-icon {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
}

.community-route__trending-unavailable {
  flex: 0 0 auto;
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
}

.community-route__reply-list {
  display: flex;
  flex-direction: column;
}

.community-route__reply-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  border-top: 1px solid var(--community-muted-line);
  padding: var(--space-3) 0;
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
  min-width: 0;
  flex: 1;
}

.community-route__reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.community-route__reply-author {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text);
  font-size: var(--font-size-13, 0.8125rem);
  font-weight: var(--font-weight-h3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.community-route__reply-time {
  flex: 0 0 auto;
  font-size: var(--font-size-12, 0.75rem);
  color: var(--color-text-soft);
}

.community-route__reply-title {
  font-size: var(--font-size-13, 0.8125rem);
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
  min-height: 11rem;
  padding: var(--space-8);
  margin-top: var(--space-5);
  margin-bottom: var(--space-5);
  color: var(--color-text-soft);
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.community-route__state--error {
  color: var(--color-danger);
  border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
}

.community-route__sr-only {
  position: absolute;
  width: 0.0625rem;
  height: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1180px) {
  .community-route__layout {
    grid-template-columns: minmax(12.5rem, 15rem) minmax(0, 1fr);
  }

  .community-route__extra {
    display: none;
  }
}

@media (max-width: 820px) {
  .community-route {
    padding: var(--space-4);
  }

  .community-route__layout {
    grid-template-columns: 1fr;
  }

  .community-route__sidebar {
    position: static;
    min-height: auto;
  }

  .community-route__main-header {
    flex-direction: column;
  }

  .community-route__tabs {
    width: auto;
  }

  .community-route__tab {
    min-width: 0;
    flex: 1;
  }
}

@media (max-width: 560px) {
  .community-route {
    padding: var(--space-3);
  }

  .community-route__sidebar,
  .community-route__extra-section {
    padding: var(--space-4);
  }

  .community-route__main-header,
  .community-route__tabs,
  .community-route__data-note,
  .community-route__feed,
  .community-route__state {
    margin-inline: var(--space-2);
  }

  .community-route__post-card {
    gap: var(--space-3);
    padding: var(--space-3);
  }

  .community-route__post-avatar {
    width: 1.75rem;
    height: 1.75rem;
  }

  .community-route__post-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .community-route__post-stats {
    margin-left: 0;
  }
}
</style>
