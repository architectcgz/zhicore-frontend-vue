<template>
  <section class="community-route" aria-labelledby="community-route-title">
    <header class="community-route__header">
      <p class="community-route__eyebrow">Community</p>
      <h1 id="community-route-title">社区</h1>
      <p>
        从真实内容主题进入社区，查看对应方向的最新公开文章。成员关系、活跃度和治理能力会在后续服务接入后显示。
      </p>
    </header>

    <div class="community-route__layout">
      <aside class="community-route__topics" aria-label="主题社区">
        <div class="community-route__section-heading">
          <h2>主题社区</h2>
          <span>按主题浏览</span>
        </div>

        <button
          type="button"
          class="community-route__topic"
          :class="{ 'community-route__topic--active': activeTopicSlug === '' }"
          :aria-pressed="activeTopicSlug === ''"
          @click="selectTopic('')"
        >
          全部主题
        </button>

        <div v-if="topicState === 'loading'" class="community-route__state">
          正在加载主题
        </div>
        <div
          v-else-if="topicState === 'error'"
          class="community-route__state community-route__state--error"
          role="alert"
        >
          <span>{{ topicError || "主题社区加载失败" }}</span>
          <button type="button" @click="retryTopics">重试</button>
        </div>
        <div v-else-if="topicState === 'empty'" class="community-route__state">
          暂无主题
        </div>

        <div v-else class="community-route__topic-list">
          <button
            v-for="topic in topics"
            :key="topic.id"
            type="button"
            class="community-route__topic"
            :class="{
              'community-route__topic--active': activeTopicSlug === topic.slug,
            }"
            :aria-pressed="activeTopicSlug === topic.slug"
            @click="selectTopic(topic.slug)"
          >
            {{ topic.label }}
          </button>
        </div>
      </aside>

      <main class="community-route__feed" aria-label="社区内容">
        <div class="community-route__section-heading">
          <div>
            <h2>{{ activeTopicTitle }}</h2>
            <p>{{ activeTopicSummary }}</p>
          </div>
        </div>

        <div v-if="feedState === 'loading'" class="community-route__state">
          正在加载社区内容
        </div>
        <div
          v-else-if="feedState === 'error'"
          class="community-route__state community-route__state--error"
          role="alert"
        >
          <span>{{ feedError || "社区内容加载失败" }}</span>
          <button type="button" @click="retryPosts">重试</button>
        </div>
        <div v-else-if="feedState === 'empty'" class="community-route__state">
          当前主题下暂无公开内容
        </div>

        <div v-else class="community-route__post-list">
          <article
            v-for="post in posts"
            :key="post.id"
            class="community-route__post"
          >
            <div class="community-route__post-meta">
              <span>{{ post.author }}</span>
              <span aria-hidden="true">&middot;</span>
              <time>{{ post.publishedAt }}</time>
            </div>
            <h3>
              <RouterLink :to="post.href">{{ post.title }}</RouterLink>
            </h3>
            <p>{{ post.summary }}</p>
            <RouterLink
              class="community-route__post-comments"
              :to="`${post.href}#comments`"
              :aria-label="`查看 ${post.title} 的评论`"
            >
              {{
                post.commentCount > 0
                  ? `${post.commentCount} 条评论`
                  : "查看评论"
              }}
            </RouterLink>
          </article>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.community-route {
  display: grid;
  gap: var(--space-8);
  max-width: 1120px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
}

.community-route__header {
  max-width: 760px;
}

.community-route__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-primary);
  font-size: var(--font-size-12);
  font-weight: 800;
  text-transform: uppercase;
}

.community-route h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-32);
  line-height: 1.16;
}

.community-route__header p {
  margin: var(--space-4) 0 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.community-route__layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}

.community-route__topics,
.community-route__feed {
  display: grid;
  gap: var(--space-4);
}

.community-route__topics {
  position: sticky;
  top: var(--space-6);
}

.community-route__section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.community-route__section-heading h2,
.community-route__post h3 {
  margin: 0;
  color: var(--color-text-strong);
}

.community-route__section-heading h2 {
  font-size: var(--font-size-20);
}

.community-route__section-heading span,
.community-route__section-heading p,
.community-route__post-meta,
.community-route__post p {
  margin: 0;
  color: var(--color-text-soft);
}

.community-route__section-heading span,
.community-route__section-heading p,
.community-route__post-meta {
  font-size: var(--font-size-14);
}

.community-route__topic-list {
  display: grid;
  gap: var(--space-2);
}

.community-route__topic {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font: inherit;
  align-items: center;
}

.community-route__topic:hover,
.community-route__topic--active {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 40%,
    var(--color-border)
  );
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-text-strong);
}

.community-route__topic:focus-visible,
.community-route__state button:focus-visible,
.community-route__post a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.community-route__state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 64px;
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-soft);
}

.community-route__state--error {
  color: var(--color-danger);
}

.community-route__state button {
  min-height: 32px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-bg);
  cursor: pointer;
  font-weight: 700;
}

.community-route__post-list {
  display: grid;
  gap: var(--space-4);
}

.community-route__post {
  display: grid;
  gap: var(--space-3);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.community-route__post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.community-route__post h3 {
  font-size: var(--font-size-20);
  line-height: 1.35;
}

.community-route__post a {
  color: inherit;
  text-decoration: none;
}

.community-route__post h3 a:hover,
.community-route__post-comments:hover {
  color: var(--color-primary);
}

.community-route__post p {
  line-height: 1.65;
}

.community-route__post-comments {
  justify-self: start;
  color: var(--color-text-soft);
  font-size: var(--font-size-14);
}

@media (max-width: 820px) {
  .community-route {
    padding: var(--space-6) var(--space-4) var(--space-12);
  }

  .community-route__layout {
    grid-template-columns: 1fr;
  }

  .community-route__topics {
    position: static;
  }
}
</style>
