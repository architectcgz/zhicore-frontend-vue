<!--
  创作者排行榜卡片组件
  功能：展示创作者排行榜项的详细信息
-->
<template>
  <div
    class="creator-ranking-card"
    @click="goToProfile"
  >
    <div class="creator-avatar-container">
      <img
        :src="item.user.avatar || undefined"
        :alt="item.user.nickname"
        class="creator-avatar"
      >
      <div
        v-if="rank <= 3"
        class="rank-badge"
        :class="`rank-${rank}`"
      >
        {{ rank }}
      </div>
    </div>

    <div class="creator-info">
      <div class="creator-header">
        <h3 class="creator-name">
          {{ item.user.nickname }}
        </h3>
        <span
          v-if="item.user.bio"
          class="creator-bio"
        >{{ item.user.bio }}</span>
      </div>

      <div class="creator-stats">
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
          <span class="stat-label">粉丝</span>
          <span class="stat-value">{{ formatNumber(item.metrics.followers) }}</span>
        </div>
      </div>
    </div>

    <div class="creator-score">
      <div class="score-label">
        影响力
      </div>
      <div class="score-value">
        {{ formatNumber(item.score) }}
      </div>
      <div class="engagement-badge">
        <svg
          class="engagement-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ formatEngagement(item.metrics.engagement) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { CreatorRankingItem } from '@/api/ranking';

// Props
interface Props {
  item: CreatorRankingItem;
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

// 格式化互动率
const formatEngagement = (engagement: number): string => {
  return engagement.toFixed(1);
};

// 跳转到用户主页
const goToProfile = () => {
  router.push({ name: 'UserProfile', params: { id: props.item.user.id } });
};
</script>

<style scoped>
.creator-ranking-card {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.creator-ranking-card:hover {
  transform: translateY(-2px);
}

.creator-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.creator-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
  transition: all 0.3s ease;
}

.creator-ranking-card:hover .creator-avatar {
  border-color: var(--color-cta);
  transform: scale(1.05);
}

.rank-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  border: 2px solid var(--color-bg-primary);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
}

.creator-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.creator-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.creator-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.creator-bio {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.creator-stats {
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

.creator-score {
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

.engagement-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px var(--space-xs);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.engagement-icon {
  width: 14px;
  height: 14px;
}

@media (max-width: 768px) {
  .creator-ranking-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .creator-avatar {
    width: 64px;
    height: 64px;
  }

  .creator-stats {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .creator-score {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
