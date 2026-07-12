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

<style scoped src="./styles/community-workspace.css"></style>
