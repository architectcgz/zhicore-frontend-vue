<!--
  话题排行榜卡片组件
  功能：展示话题排行榜项的详细信息
-->
<template>
  <div
    class="topic-ranking-card"
    @click="goToTopic"
  >
    <div class="topic-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="topic-info">
      <div class="topic-header">
        <h3 class="topic-name">
          #{{ item.tag.name }}
        </h3>
        <span
          v-if="item.tag.description"
          class="topic-description"
        >
          {{ item.tag.description }}
        </span>
      </div>

      <div class="topic-stats">
        <div class="stat-item">
          <svg
            class="stat-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="stat-label">文章</span>
          <span class="stat-value">{{ formatNumber(item.metrics.posts) }}</span>
        </div>

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
          <span class="stat-label">阅读</span>
          <span class="stat-value">{{ formatNumber(item.metrics.totalViews) }}</span>
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
          <span class="stat-label">点赞</span>
          <span class="stat-value">{{ formatNumber(item.metrics.totalLikes) }}</span>
        </div>

        <div class="stat-item">
          <svg
            class="stat-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="stat-label">关注</span>
          <span class="stat-value">{{ formatNumber(item.metrics.followers) }}</span>
        </div>
      </div>
    </div>

    <div class="topic-score">
      <div class="score-label">
        热度
      </div>
      <div class="score-value">
        {{ formatNumber(item.score) }}
      </div>
      <div
        class="growth-badge"
        :class="getGrowthClass(item.metrics.growth)"
      >
        <svg
          class="growth-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            v-if="item.metrics.growth > 0"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else-if="item.metrics.growth < 0"
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M5 12h14"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ formatGrowth(item.metrics.growth) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { TopicRankingItem } from '@/api/ranking';

// Props
interface Props {
  item: TopicRankingItem;
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

// 格式化增长率
const formatGrowth = (growth: number): string => {
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

// 获取增长率样式类
const getGrowthClass = (growth: number): string => {
  if (growth > 0) return 'positive';
  if (growth < 0) return 'negative';
  return 'neutral';
};

// 跳转到话题详情
const goToTopic = () => {
  router.push({ name: 'TagDetail', params: { slug: props.item.tag.slug } });
};
</script>

<style scoped>
.topic-ranking-card {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-ranking-card:hover {
  transform: translateY(-2px);
}

.topic-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-cta) 0%, var(--color-cta-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.topic-icon svg {
  width: 32px;
  height: 32px;
}

.topic-ranking-card:hover .topic-icon {
  transform: rotate(10deg) scale(1.1);
}

.topic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.topic-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.topic-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.topic-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-stats {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
}

.stat-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
}

.stat-label {
  color: var(--color-text-tertiary);
}

.stat-value {
  color: var(--color-text-primary);
  font-weight: 600;
}

.topic-score {
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
  min-width: 100px;
}

.score-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-heading);
}

.growth-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px var(--space-xs);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-badge.positive {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.growth-badge.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.growth-badge.neutral {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.growth-icon {
  width: 14px;
  height: 14px;
}

@media (max-width: 768px) {
  .topic-ranking-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .topic-icon {
    width: 56px;
    height: 56px;
  }

  .topic-icon svg {
    width: 28px;
    height: 28px;
  }

  .topic-stats {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .topic-score {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
