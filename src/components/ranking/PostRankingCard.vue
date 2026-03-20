<!--
  文章排行榜卡片组件
  功能：展示文章排行榜项的详细信息
-->
<template>
  <div
    class="post-ranking-card"
    @click="goToPost"
  >
    <div
      v-if="item.post.coverImage"
      class="post-cover"
    >
      <img
        :src="item.post.coverImage"
        :alt="item.post.title"
      >
    </div>

    <div class="post-info">
      <h3 class="post-title">
        {{ item.post.title }}
      </h3>
      <p class="post-excerpt">
        {{ item.post.excerpt }}
      </p>

      <div class="post-meta">
        <div class="author-info">
          <img
            :src="item.post.author.avatar || undefined"
            :alt="item.post.author.nickname"
            class="author-avatar"
          >
          <span class="author-name">{{ item.post.author.nickname }}</span>
        </div>

        <div class="post-stats">
          <div class="stat-item">
            <svg
              class="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ formatNumber(item.metrics.views) }}</span>
          </div>

          <div class="stat-item">
            <svg
              class="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ formatNumber(item.metrics.likes) }}</span>
          </div>

          <div class="stat-item">
            <svg
              class="stat-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ formatNumber(item.metrics.comments) }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="item.post.tags && item.post.tags.length > 0"
        class="post-tags"
      >
        <span
          v-for="tag in item.post.tags.slice(0, 3)"
          :key="tag.id"
          class="tag"
        >
          #{{ tag.name }}
        </span>
      </div>
    </div>

    <div class="post-score">
      <div class="score-label">
        热度
      </div>
      <div class="score-value">
        {{ formatNumber(item.score) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { PostRankingItem } from '@/api/ranking';

// Props
interface Props {
  item: PostRankingItem;
  rank: number;
  type: string;
}

const props = defineProps<Props>();

// Router
const router = useRouter();

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 跳转到文章详情
const goToPost = () => {
  router.push({ name: 'PostDetail', params: { id: String(props.item.post.id) } });
};
</script>

<style scoped>
.post-ranking-card {
  display: flex;
  gap: var(--space-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-ranking-card:hover {
  transform: translateY(-2px);
}

.post-cover {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-ranking-card:hover .post-cover img {
  transform: scale(1.1);
}

.post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.post-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.post-stats {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.post-tags {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.tag {
  padding: 2px var(--space-xs);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  border-radius: 4px;
}

.post-score {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: linear-gradient(135deg, var(--color-cta) 0%, var(--color-cta-hover) 100%);
  border-radius: 8px;
  color: white;
}

.score-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: var(--font-heading);
}

@media (max-width: 768px) {
  .post-ranking-card {
    flex-direction: column;
  }

  .post-cover {
    width: 100%;
    height: 180px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-score {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
