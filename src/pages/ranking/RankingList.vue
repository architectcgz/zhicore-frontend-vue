<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHotPostsQuery } from '@/queries/posts/useHotPostsQuery';
import { getErrorMessage } from '@/types/errors';
import type { Post } from '@/types';

const router = useRouter();

const {
  data,
  isLoading,
  error,
  refetch,
} = useHotPostsQuery({ page: 0, size: 20 });

const posts = computed(() => data.value?.items ?? []);
const errorMessage = computed(() => error.value ? getErrorMessage(error.value) : null);

const previewTags = (post: Post) => post.tags.slice(0, 3);

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatNumber = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
};

const openPost = (postId: string) => {
  void router.push({ name: 'PostDetail', params: { id: postId } });
};

const handleRetry = () => {
  void refetch();
};
</script>

<template>
  <div class="ranking-page">
    <header class="ranking-page__header">
      <div class="ranking-page__header-inner">
        <p class="ranking-page__eyebrow">
          Public Ranking
        </p>
        <h1 class="ranking-page__title">
          热门文章榜
        </h1>
        <p class="ranking-page__summary">
          当前仅展示 backend-confirmed 的热榜文章详情能力。创作者、话题和更多时间维度会在契约明确后再开放。
        </p>
      </div>
    </header>

    <main class="ranking-page__body">
      <div
        v-if="isLoading"
        class="ranking-page__state"
      >
        <div class="ranking-page__spinner" />
        <p>加载热榜中...</p>
      </div>

      <div
        v-else-if="errorMessage"
        class="ranking-page__state"
      >
        <p class="ranking-page__error">
          {{ errorMessage }}
        </p>
        <button
          type="button"
          class="ranking-page__retry"
          @click="handleRetry"
        >
          重试
        </button>
      </div>

      <section
        v-else-if="posts.length > 0"
        class="ranking-page__list"
      >
        <button
          v-for="(post, index) in posts"
          :key="post.id"
          type="button"
          class="ranking-page__card"
          @click="openPost(post.id)"
        >
          <div class="ranking-page__rank">
            {{ index + 1 }}
          </div>

          <div
            v-if="post.coverImage"
            class="ranking-page__cover"
          >
            <img
              :src="post.coverImage"
              :alt="post.title"
            >
          </div>

          <div class="ranking-page__content">
            <div class="ranking-page__meta">
              <span>{{ post.author.nickname || '匿名用户' }}</span>
              <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
            </div>

            <h2 class="ranking-page__card-title">
              {{ post.title }}
            </h2>

            <p class="ranking-page__excerpt">
              {{ post.excerpt || '暂无摘要' }}
            </p>

            <div
              v-if="previewTags(post).length > 0"
              class="ranking-page__tags"
            >
              <span
                v-for="tag in previewTags(post)"
                :key="tag.id"
                class="ranking-page__tag"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>

          <div class="ranking-page__stats">
            <span>阅 {{ formatNumber(post.viewCount) }}</span>
            <span>赞 {{ formatNumber(post.likeCount) }}</span>
            <span>评 {{ formatNumber(post.commentCount) }}</span>
          </div>
        </button>
      </section>

      <section
        v-else
        class="ranking-page__state"
      >
        <h2 class="ranking-page__empty-title">
          暂无热榜文章
        </h2>
        <p class="ranking-page__empty-text">
          后端暂未返回可展示的热榜文章详情。
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 116, 144, 0.12), transparent 24%),
    linear-gradient(180deg, #f5fbff 0%, #ffffff 42%, #f3f7f7 100%);
}

.ranking-page__header {
  border-bottom: 1px solid rgba(8, 47, 73, 0.12);
  background: rgba(245, 251, 255, 0.88);
  backdrop-filter: blur(10px);
}

.ranking-page__header-inner,
.ranking-page__body {
  width: min(1040px, calc(100% - 32px));
  margin: 0 auto;
}

.ranking-page__header-inner {
  padding: 48px 0 28px;
}

.ranking-page__eyebrow {
  margin: 0 0 8px;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0f766e;
}

.ranking-page__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 4vw, 3.2rem);
  color: #0f172a;
}

.ranking-page__summary {
  max-width: 720px;
  margin: 12px 0 0;
  line-height: 1.7;
  color: #475569;
}

.ranking-page__body {
  padding: 28px 0 56px;
}

.ranking-page__state {
  border: 1px solid rgba(8, 47, 73, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
  padding: 32px;
  text-align: center;
}

.ranking-page__spinner {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border: 3px solid rgba(15, 118, 110, 0.18);
  border-top-color: #0f766e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ranking-page__error {
  margin: 0 0 14px;
  color: #b91c1c;
}

.ranking-page__retry {
  border: none;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  padding: 10px 18px;
  cursor: pointer;
}

.ranking-page__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-page__card {
  display: grid;
  grid-template-columns: 72px minmax(0, 180px) minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  width: 100%;
  border: 1px solid rgba(8, 47, 73, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
  padding: 20px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.ranking-page__card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.24);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.12);
}

.ranking-page__rank {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
}

.ranking-page__cover {
  width: 180px;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 18px;
  background: #dbeafe;
}

.ranking-page__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ranking-page__content {
  min-width: 0;
}

.ranking-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #64748b;
}

.ranking-page__card-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.4;
}

.ranking-page__excerpt {
  margin: 12px 0 0;
  line-height: 1.7;
  color: #475569;
}

.ranking-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.ranking-page__tag {
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  padding: 6px 10px;
  font-size: 0.84rem;
}

.ranking-page__stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 90px;
  text-align: right;
  color: #475569;
  font-size: 0.875rem;
}

.ranking-page__empty-title {
  margin: 0 0 10px;
  color: #0f172a;
}

.ranking-page__empty-text {
  margin: 0;
  color: #64748b;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .ranking-page__card {
    grid-template-columns: 64px 1fr;
  }

  .ranking-page__cover {
    width: 100%;
    max-width: 220px;
  }

  .ranking-page__stats {
    grid-column: 2;
    flex-direction: row;
    justify-content: flex-start;
    min-width: 0;
    text-align: left;
  }
}

@media (max-width: 640px) {
  .ranking-page__header-inner {
    padding-top: 36px;
  }

  .ranking-page__card {
    grid-template-columns: 1fr;
  }

  .ranking-page__rank {
    width: 48px;
    height: 48px;
  }

  .ranking-page__cover {
    width: 100%;
    max-width: none;
  }

  .ranking-page__stats {
    grid-column: auto;
    flex-wrap: wrap;
  }
}
</style>
