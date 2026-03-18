<!--
  首页侧边栏组件
  显示热门标签和热门文章
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Post, Tag } from '@/types';

interface Props {
  tags?: Tag[];
  trendingPosts?: Post[];
  isLoading?: boolean;
  tagsError?: Error | null;
  postsError?: Error | null;
}

interface Emits {
  (e: 'tag-click', tag: Tag): void;
  (e: 'post-click', post: Post): void;
}

const props = withDefaults(defineProps<Props>(), {
  tags: undefined,
  trendingPosts: undefined,
  isLoading: false,
  tagsError: null,
  postsError: null,
});

const emit = defineEmits<Emits>();
const router = useRouter();

const displayTags = computed(() => props.tags?.slice(0, 15) ?? []);
const displayPosts = computed(() => props.trendingPosts?.slice(0, 10) ?? []);

const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return '加载数据时发生错误';
};

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }

  return num.toString();
};

const getRankBadgeClass = (index: number): string => {
  if (index === 0) {
    return 'home-sidebar__rank-badge--first';
  }

  if (index === 1) {
    return 'home-sidebar__rank-badge--second';
  }

  if (index === 2) {
    return 'home-sidebar__rank-badge--third';
  }

  return 'home-sidebar__rank-badge--other';
};

const handleTagClick = (tag: Tag) => {
  emit('tag-click', tag);
  router.push(`/tags/${tag.slug}`);
};

const handlePostClick = (post: Post) => {
  emit('post-click', post);
  router.push(`/posts/${post.id}`);
};
</script>

<template>
  <aside
    class="home-sidebar"
    role="complementary"
    aria-label="侧边栏"
  >
    <section
      class="home-sidebar__section surface-panel"
      aria-labelledby="tags-heading"
    >
      <div
        v-if="isLoading || tagsError"
        class="home-sidebar__skeleton"
      >
        <div class="home-sidebar__skeleton-title" />
        <div class="home-sidebar__tags">
          <div
            v-for="i in 8"
            :key="i"
            class="home-sidebar__skeleton-tag"
          />
        </div>

        <div
          v-if="tagsError"
          class="home-sidebar__error-overlay"
        >
          <div class="home-sidebar__error-card">
            <svg
              class="home-sidebar__error-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 8.5v4.75M12 17.25h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
            </svg>
            <p class="home-sidebar__error-message">{{ getErrorMessage(tagsError) }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="displayTags.length > 0">
        <div class="home-sidebar__section-head">
          <div>
            <p class="home-sidebar__section-kicker">话题热度</p>
            <h2
              id="tags-heading"
              class="home-sidebar__section-title"
            >
              <svg
                class="home-sidebar__section-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 7h.01M7.75 3h5.1c.46 0 .9.18 1.22.5l6.43 6.43a1.73 1.73 0 0 1 0 2.45l-7.12 7.12a1.73 1.73 0 0 1-2.45 0L3.5 12.07A1.73 1.73 0 0 1 3 10.85v-4.1C3 4.68 4.68 3 6.75 3Z" />
              </svg>
              热门标签
            </h2>
          </div>
          <p class="home-sidebar__section-description">跟进社区话题热度和内容增长。</p>
        </div>

        <div class="home-sidebar__tags">
          <button
            v-for="tag in displayTags"
            :key="tag.id"
            class="home-sidebar__tag"
            type="button"
            :aria-label="`标签: ${tag.name}, ${tag.postCount} 篇文章`"
            @click="handleTagClick(tag)"
          >
            <span class="home-sidebar__tag-hash">#</span>
            <span class="home-sidebar__tag-name">{{ tag.name }}</span>
            <span class="home-sidebar__tag-count">{{ formatNumber(tag.postCount) }}</span>
          </button>
        </div>
      </div>

      <div
        v-else
        class="home-sidebar__empty"
      >
        <p class="home-sidebar__empty-text">暂无热门标签</p>
      </div>
    </section>

    <section
      class="home-sidebar__section surface-panel"
      aria-labelledby="posts-heading"
    >
      <div
        v-if="isLoading || postsError"
        class="home-sidebar__skeleton"
      >
        <div class="home-sidebar__skeleton-title" />
        <div class="home-sidebar__posts">
          <div
            v-for="i in 5"
            :key="i"
            class="home-sidebar__skeleton-post"
          >
            <div class="home-sidebar__skeleton-post-content">
              <div class="home-sidebar__skeleton-rank" />
              <div class="home-sidebar__skeleton-post-info">
                <div class="home-sidebar__skeleton-text" />
                <div class="home-sidebar__skeleton-text home-sidebar__skeleton-text--short" />
                <div class="home-sidebar__skeleton-meta" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="postsError"
          class="home-sidebar__error-overlay"
        >
          <div class="home-sidebar__error-card">
            <svg
              class="home-sidebar__error-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 8.5v4.75M12 17.25h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
            </svg>
            <p class="home-sidebar__error-message">{{ getErrorMessage(postsError) }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="displayPosts.length > 0">
        <div class="home-sidebar__section-head">
          <div>
            <p class="home-sidebar__section-kicker">阅读推荐</p>
            <h2
              id="posts-heading"
              class="home-sidebar__section-title"
            >
              <svg
                class="home-sidebar__section-icon home-sidebar__section-icon--red"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M13 3 4 14h6v7l9-11h-6z" />
              </svg>
              热门文章
            </h2>
          </div>
          <p class="home-sidebar__section-description">优先阅读当前最受关注的内容。</p>
        </div>

        <div class="home-sidebar__posts">
          <article
            v-for="(post, index) in displayPosts"
            :key="post.id"
            class="home-sidebar__post"
            :aria-label="`第 ${index + 1} 名: ${post.title}`"
            tabindex="0"
            @click="handlePostClick(post)"
            @keydown.enter="handlePostClick(post)"
          >
            <div class="home-sidebar__post-content">
              <div
                class="home-sidebar__rank-badge"
                :class="getRankBadgeClass(index)"
                :aria-label="`排名第 ${index + 1}`"
              >
                {{ index + 1 }}
              </div>

              <div class="home-sidebar__post-info">
                <h3 class="home-sidebar__post-title">{{ post.title }}</h3>

                <div class="home-sidebar__post-meta">
                  <span class="home-sidebar__post-meta-item">
                    <svg
                      class="home-sidebar__post-meta-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M2.75 12S6.15 6.75 12 6.75 21.25 12 21.25 12 17.85 17.25 12 17.25 2.75 12 2.75 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    <span class="sr-only">浏览量:</span>
                    {{ formatNumber(post.viewCount) }}
                  </span>

                  <span class="home-sidebar__post-meta-item">
                    <svg
                      class="home-sidebar__post-meta-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="m12 20.25-1.1-1C5.15 14.08 2.75 11.46 2.75 8.25A4.5 4.5 0 0 1 7.25 3.75c1.74 0 3.41.81 4.5 2.1 1.09-1.29 2.76-2.1 4.5-2.1a4.5 4.5 0 0 1 4.5 4.5c0 3.21-2.4 5.83-8.15 11l-1.1 1Z" />
                    </svg>
                    <span class="sr-only">点赞数:</span>
                    {{ formatNumber(post.likeCount) }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="index < displayPosts.length - 1"
              class="home-sidebar__post-divider"
            />
          </article>
        </div>
      </div>

      <div
        v-else
        class="home-sidebar__empty"
      >
        <p class="home-sidebar__empty-text">暂无热门文章</p>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.home-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.home-sidebar__section {
  position: relative;
  overflow: hidden;
  padding: var(--space-lg);
  border-radius: var(--radius-xl);
}

.home-sidebar__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: var(--space-lg);
}

.home-sidebar__section-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.home-sidebar__section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
}

.home-sidebar__section-description {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

.home-sidebar__section-icon,
.home-sidebar__post-meta-icon,
.home-sidebar__error-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.home-sidebar__section-icon {
  color: var(--color-cta);
}

.home-sidebar__section-icon--red {
  color: var(--color-accent);
}

.home-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.home-sidebar__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-text);
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);
}

.home-sidebar__tag:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-dark);
  background: var(--color-bg-secondary);
}

.home-sidebar__tag-hash {
  color: var(--color-cta);
  font-weight: var(--font-weight-bold);
}

.home-sidebar__tag-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.home-sidebar__tag-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.home-sidebar__posts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.home-sidebar__post {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0 0;
  border-radius: var(--radius-md);
  transition: transform var(--transition-base);
}

.home-sidebar__post:first-child {
  padding-top: 0;
}

.home-sidebar__post:hover {
  transform: translateY(-1px);
}

.home-sidebar__post-content {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
}

.home-sidebar__rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  background: var(--color-bg-tertiary);
}

.home-sidebar__rank-badge--first {
  background: linear-gradient(135deg, #f6c778 0%, #d4a14b 100%);
}

.home-sidebar__rank-badge--second {
  background: linear-gradient(135deg, #d7dee8 0%, #a8b7c7 100%);
}

.home-sidebar__rank-badge--third {
  background: linear-gradient(135deg, #e6bf9a 0%, #c78956 100%);
}

.home-sidebar__rank-badge--other {
  background: var(--color-bg-tertiary);
}

.home-sidebar__post-info {
  min-width: 0;
}

.home-sidebar__post-title {
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 0.98rem;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.home-sidebar__post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
}

.home-sidebar__post-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.home-sidebar__post-meta-icon {
  width: 14px;
  height: 14px;
}

.home-sidebar__post-divider {
  height: 1px;
  background: var(--color-border-light);
}

.home-sidebar__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.24);
}

.home-sidebar__empty-text {
  color: var(--color-text-secondary);
}

.home-sidebar__skeleton {
  position: relative;
}

.home-sidebar__skeleton-title,
.home-sidebar__skeleton-tag,
.home-sidebar__skeleton-rank,
.home-sidebar__skeleton-text,
.home-sidebar__skeleton-meta {
  background: linear-gradient(90deg, rgba(18, 49, 76, 0.06), rgba(18, 49, 76, 0.12), rgba(18, 49, 76, 0.06));
  background-size: 200% 100%;
  animation: home-sidebar-skeleton 1.4s ease-in-out infinite;
}

.home-sidebar__skeleton-title {
  width: 92px;
  height: 24px;
  border-radius: 999px;
  margin-bottom: var(--space-lg);
}

.home-sidebar__skeleton-tag {
  width: 84px;
  height: 38px;
  border-radius: 999px;
}

.home-sidebar__skeleton-post {
  padding: 12px 0;
}

.home-sidebar__skeleton-post-content {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
}

.home-sidebar__skeleton-rank {
  width: 36px;
  height: 36px;
  border-radius: 12px;
}

.home-sidebar__skeleton-post-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-sidebar__skeleton-text {
  height: 14px;
  border-radius: 999px;
}

.home-sidebar__skeleton-text--short {
  width: 68%;
}

.home-sidebar__skeleton-meta {
  width: 48%;
  height: 12px;
  border-radius: 999px;
}

.home-sidebar__error-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-md);
  background: rgba(255, 248, 242, 0.82);
  backdrop-filter: blur(6px);
}

[data-theme='dark'] .home-sidebar__error-overlay {
  background: rgba(8, 19, 31, 0.82);
}

.home-sidebar__error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.home-sidebar__error-icon {
  width: 24px;
  height: 24px;
  color: var(--color-danger);
}

.home-sidebar__error-message {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

@keyframes home-sidebar-skeleton {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1023px) {
  .home-sidebar {
    gap: var(--space-md);
  }

  .home-sidebar__section {
    padding: var(--space-md);
  }
}
</style>
