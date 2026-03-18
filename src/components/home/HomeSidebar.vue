<!--
  首页侧边栏组件
  使用统一的编辑面板语言呈现热门标签和热门文章
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Post, Tag } from '@/types';

interface Props {
  /** 热门标签列表 */
  tags?: Tag[];
  /** 热门文章列表 */
  trendingPosts?: Post[];
  /** 标签是否正在加载 */
  isTagsLoading?: boolean;
  /** 热门文章是否正在加载 */
  isPostsLoading?: boolean;
  /** 标签加载错误 */
  tagsError?: Error | null;
  /** 文章加载错误 */
  postsError?: Error | null;
}

interface Emits {
  /** 点击标签 */
  (e: 'tag-click', tag: Tag): void;
  /** 点击文章 */
  (e: 'post-click', post: Post): void;
}

const props = withDefaults(defineProps<Props>(), {
  tags: undefined,
  trendingPosts: undefined,
  isTagsLoading: false,
  isPostsLoading: false,
  tagsError: null,
  postsError: null,
});

const emit = defineEmits<Emits>();
const router = useRouter();

const displayTags = computed(() => props.tags?.slice(0, 15) ?? []);
const displayPosts = computed(() => props.trendingPosts?.slice(0, 5) ?? []);

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

const formatRank = (index: number): string => {
  return String(index + 1).padStart(2, '0');
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
    aria-label="首页热门内容"
  >
    <header class="home-sidebar__hero">
      <p class="home-sidebar__eyebrow">
        Editor's Picks
      </p>
      <h2 class="home-sidebar__headline">
        站内热度
      </h2>
      <p class="home-sidebar__lead">
        用一块连续的编辑面板，收拢首页此刻最密集的讨论与持续被阅读的内容。
      </p>
    </header>

    <section
      class="home-sidebar__section"
      aria-labelledby="tags-heading"
    >
      <header class="home-sidebar__section-header">
        <div class="home-sidebar__section-heading">
          <span class="home-sidebar__section-icon-wrap">
            <svg
              class="home-sidebar__section-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </span>
          <div>
            <h3
              id="tags-heading"
              class="home-sidebar__section-title"
            >
              热门标签
            </h3>
            <p class="home-sidebar__section-description">
              最近被频繁提及的话题线索
            </p>
          </div>
        </div>
        <span class="home-sidebar__section-badge">
          {{ displayTags.length }}
        </span>
      </header>

      <div
        v-if="tagsError"
        class="home-sidebar__state home-sidebar__state--error"
        role="status"
      >
        <svg
          class="home-sidebar__state-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="home-sidebar__state-text">
          {{ getErrorMessage(tagsError) }}
        </p>
      </div>

      <div
        v-else-if="isTagsLoading"
        class="home-sidebar__tags home-sidebar__tags--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="i in 9"
          :key="i"
          class="home-sidebar__tag-skeleton"
        />
      </div>

      <div
        v-else-if="displayTags.length > 0"
        class="home-sidebar__tags"
      >
        <button
          v-for="tag in displayTags"
          :key="tag.id"
          type="button"
          class="home-sidebar__tag"
          :aria-label="`标签: ${tag.name}, ${tag.postCount ?? 0} 篇文章`"
          @click="handleTagClick(tag)"
        >
          <span class="home-sidebar__tag-hash">#</span>
          <span class="home-sidebar__tag-name">{{ tag.name }}</span>
          <span class="home-sidebar__tag-count">{{ formatNumber(tag.postCount ?? 0) }}</span>
        </button>
      </div>

      <div
        v-else
        class="home-sidebar__state"
      >
        <p class="home-sidebar__state-text">
          暂无热门标签
        </p>
      </div>
    </section>

    <section
      class="home-sidebar__section"
      aria-labelledby="posts-heading"
    >
      <header class="home-sidebar__section-header">
        <div class="home-sidebar__section-heading">
          <span class="home-sidebar__section-icon-wrap home-sidebar__section-icon-wrap--warm">
            <svg
              class="home-sidebar__section-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          <div>
            <h3
              id="posts-heading"
              class="home-sidebar__section-title"
            >
              热门文章
            </h3>
            <p class="home-sidebar__section-description">
              正在被读者持续停留的内容
            </p>
          </div>
        </div>
        <span class="home-sidebar__section-badge">
          Top {{ displayPosts.length }}
        </span>
      </header>

      <div
        v-if="postsError"
        class="home-sidebar__state home-sidebar__state--error"
        role="status"
      >
        <svg
          class="home-sidebar__state-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="home-sidebar__state-text">
          {{ getErrorMessage(postsError) }}
        </p>
      </div>

      <ol
        v-else-if="isPostsLoading"
        class="home-sidebar__post-list home-sidebar__post-list--skeleton"
        aria-hidden="true"
      >
        <li
          v-for="i in 5"
          :key="i"
          class="home-sidebar__post-skeleton"
        >
          <div class="home-sidebar__post-skeleton-rank" />
          <div class="home-sidebar__post-skeleton-copy">
            <div class="home-sidebar__post-skeleton-line" />
            <div class="home-sidebar__post-skeleton-line home-sidebar__post-skeleton-line--short" />
            <div class="home-sidebar__post-skeleton-meta" />
          </div>
        </li>
      </ol>

      <ol
        v-else-if="displayPosts.length > 0"
        class="home-sidebar__post-list"
      >
        <li
          v-for="(post, index) in displayPosts"
          :key="post.id"
          class="home-sidebar__post-item"
        >
          <button
            type="button"
            class="home-sidebar__post-button"
            :aria-label="`第 ${index + 1} 名: ${post.title}`"
            @click="handlePostClick(post)"
          >
            <span
              class="home-sidebar__rank-badge"
              :class="getRankBadgeClass(index)"
              :aria-label="`排名第 ${index + 1}`"
            >
              {{ formatRank(index) }}
            </span>

            <span class="home-sidebar__post-copy">
              <span class="home-sidebar__post-title">
                {{ post.title }}
              </span>
              <span class="home-sidebar__post-meta">
                <span class="home-sidebar__post-meta-item">
                  <svg
                    class="home-sidebar__post-meta-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {{ formatNumber(post.viewCount) }}
                </span>
                <span class="home-sidebar__post-meta-separator" aria-hidden="true">/</span>
                <span class="home-sidebar__post-meta-item">
                  <svg
                    class="home-sidebar__post-meta-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {{ formatNumber(post.likeCount) }}
                </span>
              </span>
            </span>
          </button>
        </li>
      </ol>

      <div
        v-else
        class="home-sidebar__state"
      >
        <p class="home-sidebar__state-text">
          暂无热门文章
        </p>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.home-sidebar {
  --sidebar-shell-bg:
    linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.015) 9rem, transparent 18rem),
    var(--color-bg-secondary);
  --sidebar-shell-border: rgba(9, 9, 11, 0.07);
  --sidebar-muted-surface: rgba(37, 99, 235, 0.035);
  --sidebar-muted-surface-strong: rgba(37, 99, 235, 0.08);
  --sidebar-warm-surface: rgba(217, 119, 6, 0.1);
  --sidebar-skeleton-base: var(--color-bg-tertiary);
  --sidebar-skeleton-highlight: var(--color-border-light);
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--color-text);
  background: var(--sidebar-shell-bg);
  border: 1px solid var(--sidebar-shell-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.home-sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(37, 99, 235, 0.04) calc(100% - 1px)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0) 6rem);
  pointer-events: none;
}

.home-sidebar__hero {
  position: relative;
  padding: var(--space-xl) var(--space-lg) var(--space-lg);
  border-bottom: 1px solid rgba(37, 99, 235, 0.12);
}

.home-sidebar__eyebrow {
  margin: 0 0 var(--space-xs);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-cta);
}

.home-sidebar__headline {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  line-height: 1.2;
  color: var(--color-primary);
}

.home-sidebar__lead {
  margin: var(--space-sm) 0 0;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.home-sidebar__section {
  position: relative;
  padding: var(--space-lg);
}

.home-sidebar__section + .home-sidebar__section {
  border-top: 1px solid var(--color-border);
}

.home-sidebar__section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.home-sidebar__section-heading {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  min-width: 0;
}

.home-sidebar__section-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--sidebar-muted-surface-strong);
  color: var(--color-cta);
}

.home-sidebar__section-icon-wrap--warm {
  background: var(--sidebar-warm-surface);
  color: var(--color-warning);
}

.home-sidebar__section-icon {
  width: 1rem;
  height: 1rem;
}

.home-sidebar__section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.home-sidebar__section-description {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.home-sidebar__section-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(9, 9, 11, 0.04);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
}

.home-sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.home-sidebar__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  background: var(--sidebar-muted-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1;
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base),
    box-shadow var(--transition-base),
    color var(--transition-base);
  cursor: pointer;
}

.home-sidebar__tag:hover {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.28);
  background: rgba(37, 99, 235, 0.08);
  box-shadow: 0 10px 18px -16px rgba(37, 99, 235, 0.75);
}

.home-sidebar__tag:focus-visible,
.home-sidebar__post-button:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.home-sidebar__tag-hash {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

.home-sidebar__tag-name {
  font-weight: var(--font-weight-medium);
}

.home-sidebar__tag-count {
  padding-left: 0.4rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.home-sidebar__post-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-sidebar__post-item {
  margin: 0;
}

.home-sidebar__post-button {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.875rem;
  width: 100%;
  padding: 0.9rem;
  border: 1px solid rgba(9, 9, 11, 0.06);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.55);
  color: inherit;
  text-align: left;
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base),
    box-shadow var(--transition-base);
  cursor: pointer;
}

.home-sidebar__post-button:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.05);
  box-shadow: 0 16px 24px -22px rgba(9, 9, 11, 0.5);
}

.home-sidebar__rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.home-sidebar__rank-badge--first {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
}

.home-sidebar__rank-badge--second {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: #fff;
}

.home-sidebar__rank-badge--third {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
  color: #fff;
}

.home-sidebar__rank-badge--other {
  background: rgba(9, 9, 11, 0.05);
  color: var(--color-text-secondary);
}

.home-sidebar__post-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.home-sidebar__post-title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.94rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1.55;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.home-sidebar__post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.55rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.home-sidebar__post-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.home-sidebar__post-meta-icon {
  width: 0.85rem;
  height: 0.85rem;
}

.home-sidebar__post-meta-separator {
  color: var(--color-text-tertiary);
}

.home-sidebar__state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.42);
}

.home-sidebar__state--error {
  border-style: solid;
  border-color: rgba(220, 38, 38, 0.16);
  background: rgba(220, 38, 38, 0.04);
  color: var(--color-danger);
}

.home-sidebar__state-icon {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.home-sidebar__state-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.home-sidebar__state--error .home-sidebar__state-text {
  color: inherit;
}

.home-sidebar__tags--skeleton,
.home-sidebar__post-list--skeleton {
  pointer-events: none;
}

.home-sidebar__tag-skeleton,
.home-sidebar__post-skeleton-rank,
.home-sidebar__post-skeleton-line,
.home-sidebar__post-skeleton-meta {
  background: linear-gradient(
    90deg,
    var(--sidebar-skeleton-base) 25%,
    var(--sidebar-skeleton-highlight) 50%,
    var(--sidebar-skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: sidebar-skeleton 1.4s ease-in-out infinite;
}

.home-sidebar__tag-skeleton {
  width: 4.8rem;
  height: 2.15rem;
  border-radius: 999px;
}

.home-sidebar__tag-skeleton:nth-child(3n) {
  width: 6.2rem;
}

.home-sidebar__tag-skeleton:nth-child(4n) {
  width: 3.8rem;
}

.home-sidebar__post-skeleton {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.875rem;
  padding: 0.9rem;
  border: 1px solid rgba(9, 9, 11, 0.04);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.45);
}

.home-sidebar__post-skeleton-rank {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
}

.home-sidebar__post-skeleton-copy {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.home-sidebar__post-skeleton-line {
  width: 100%;
  height: 0.85rem;
  border-radius: var(--radius-sm);
}

.home-sidebar__post-skeleton-line--short {
  width: 68%;
}

.home-sidebar__post-skeleton-meta {
  width: 7rem;
  height: 0.7rem;
  border-radius: var(--radius-sm);
}

@keyframes sidebar-skeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
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
  border-width: 0;
}

[data-theme='dark'] .home-sidebar {
  --sidebar-shell-bg:
    linear-gradient(180deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.025) 9rem, transparent 18rem),
    var(--color-bg-secondary);
  --sidebar-shell-border: rgba(255, 255, 255, 0.06);
  --sidebar-muted-surface: rgba(59, 130, 246, 0.12);
  --sidebar-muted-surface-strong: rgba(59, 130, 246, 0.18);
  --sidebar-warm-surface: rgba(251, 191, 36, 0.14);
  --sidebar-skeleton-base: #34343a;
  --sidebar-skeleton-highlight: #45454d;
}

[data-theme='dark'] .home-sidebar::before {
  background:
    linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(59, 130, 246, 0.05) calc(100% - 1px)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 6rem);
}

[data-theme='dark'] .home-sidebar__section + .home-sidebar__section {
  border-top-color: rgba(255, 255, 255, 0.08);
}

[data-theme='dark'] .home-sidebar__section-badge,
[data-theme='dark'] .home-sidebar__rank-badge--other {
  background: rgba(255, 255, 255, 0.06);
}

[data-theme='dark'] .home-sidebar__tag {
  border-color: rgba(59, 130, 246, 0.2);
}

[data-theme='dark'] .home-sidebar__tag:hover {
  border-color: rgba(96, 165, 250, 0.36);
  background: rgba(59, 130, 246, 0.16);
}

[data-theme='dark'] .home-sidebar__post-button,
[data-theme='dark'] .home-sidebar__post-skeleton,
[data-theme='dark'] .home-sidebar__state {
  background: rgba(24, 24, 27, 0.42);
  border-color: rgba(255, 255, 255, 0.06);
}

[data-theme='dark'] .home-sidebar__post-button:hover {
  border-color: rgba(96, 165, 250, 0.28);
  background: rgba(59, 130, 246, 0.12);
}

[data-theme='dark'] .home-sidebar__state--error {
  border-color: rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.08);
}

@media (max-width: 1024px) {
  .home-sidebar__hero,
  .home-sidebar__section {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }
}

@media (max-width: 768px) {
  .home-sidebar__hero {
    padding-top: var(--space-lg);
  }

  .home-sidebar__headline {
    font-size: 1.5rem;
  }

  .home-sidebar__section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .home-sidebar__section-badge {
    width: fit-content;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-sidebar__tag,
  .home-sidebar__post-button {
    transition: none;
  }

  .home-sidebar__tag:hover,
  .home-sidebar__post-button:hover {
    transform: none;
  }

  .home-sidebar__tag-skeleton,
  .home-sidebar__post-skeleton-rank,
  .home-sidebar__post-skeleton-line,
  .home-sidebar__post-skeleton-meta {
    animation: none;
  }
}
</style>
