<!--
  排行榜页面
  功能：展示文章、创作者、话题的排行榜
  包含：标签页切换、时间筛选、排行榜列表、前三名特殊展示、排名变化趋势
-->
<template>
  <div class="ranking-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        排行榜
      </h1>
      <p class="page-subtitle">
        发现优质内容和创作者
      </p>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          <component
            :is="tab.icon"
            class="tab-icon"
          />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 时间筛选 -->
      <div class="period-filter">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-button', { active: activePeriod === period.value }]"
          @click="activePeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <SiteErrorState
        title="加载排行榜失败"
        :message="error"
        mode="section"
        retry-text="重试加载"
        @retry="fetchRankingData"
      />
    </div>

    <!-- 排行榜内容 -->
    <div
      v-else
      class="ranking-content"
    >
      <!-- 前三名领奖台 -->
      <div
        v-if="topThree.length > 0"
        class="podium-container"
      >
        <div class="podium">
          <!-- 第二名 -->
          <div
            v-if="topThree[1]"
            class="podium-item second"
          >
            <div class="podium-rank">
              <div class="medal silver">
                <svg
                  class="medal-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke-width="2"
                  />
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    font-size="10"
                    fill="currentColor"
                  >2</text>
                </svg>
              </div>
            </div>
            <div class="podium-content">
              <component
                :is="getRankingItemComponent()"
                :item="topThree[1] as any"
                :rank="2"
                :type="activeTab"
              />
            </div>
            <div class="podium-base second-base">
              <span class="podium-number">2</span>
            </div>
          </div>

          <!-- 第一名 -->
          <div
            v-if="topThree[0]"
            class="podium-item first"
          >
            <div class="podium-rank">
              <div class="medal gold">
                <svg
                  class="medal-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke-width="2"
                  />
                  <path
                    d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div class="podium-content">
              <component
                :is="getRankingItemComponent()"
                :item="topThree[0] as any"
                :rank="1"
                :type="activeTab"
              />
            </div>
            <div class="podium-base first-base">
              <span class="podium-number">1</span>
            </div>
          </div>

          <!-- 第三名 -->
          <div
            v-if="topThree[2]"
            class="podium-item third"
          >
            <div class="podium-rank">
              <div class="medal bronze">
                <svg
                  class="medal-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke-width="2"
                  />
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    font-size="10"
                    fill="currentColor"
                  >3</text>
                </svg>
              </div>
            </div>
            <div class="podium-content">
              <component
                :is="getRankingItemComponent()"
                :item="topThree[2] as any"
                :rank="3"
                :type="activeTab"
              />
            </div>
            <div class="podium-base third-base">
              <span class="podium-number">3</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div class="ranking-list">
        <div
          v-for="(item, index) in remainingItems"
          :key="item.id"
          class="ranking-item"
        >
          <div class="ranking-number">
            <span class="rank">{{ index + 4 }}</span>
            <div
              v-if="item.change !== 0"
              class="rank-change"
            >
              <svg
                v-if="item.change > 0"
                class="change-icon up"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 19V5M5 12l7-7 7 7"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                class="change-icon down"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 5v14M19 12l-7 7-7-7"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span :class="['change-value', item.change > 0 ? 'up' : 'down']">
                {{ Math.abs(item.change) }}
              </span>
            </div>
            <div
              v-else
              class="rank-change"
            >
              <span class="change-value neutral">-</span>
            </div>
          </div>

          <div class="ranking-item-content">
            <component
              :is="getRankingItemComponent()"
              :item="item as any"
              :rank="index + 4"
              :type="activeTab"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="rankingData.length === 0"
        class="empty-state"
      >
        <svg
          class="empty-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="empty-text">
          暂无排行榜数据
        </p>
      </div>

      <!-- 分页 -->
      <div
        v-if="totalPages > 1"
        class="pagination"
      >
        <button
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="pagination-info">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue';
import { rankingApi } from '@/api/ranking';
import type {
  PostRankingItem,
  CreatorRankingItem,
  TopicRankingItem,
} from '@/api/ranking';
import { getErrorMessage } from '@/types/errors';
import PostRankingCard from '@/components/ranking/PostRankingCard.vue';
import CreatorRankingCard from '@/components/ranking/CreatorRankingCard.vue';
import TopicRankingCard from '@/components/ranking/TopicRankingCard.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';

// 标签页类型
type TabType = 'posts' | 'creators' | 'topics';
type PeriodType = 'daily' | 'weekly' | 'monthly';

// 标签页配置
const tabs = [
  {
    value: 'posts' as TabType,
    label: '文章',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    }, [
      h('path', {
        d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ]),
  },
  {
    value: 'creators' as TabType,
    label: '创作者',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    }, [
      h('path', {
        d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ]),
  },
  {
    value: 'topics' as TabType,
    label: '话题',
    icon: () => h('svg', {
      class: 'w-5 h-5',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    }, [
      h('path', {
        d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ]),
  },
];

// 时间周期配置
const periods = [
  { value: 'daily' as PeriodType, label: '日榜' },
  { value: 'weekly' as PeriodType, label: '周榜' },
  { value: 'monthly' as PeriodType, label: '月榜' },
];

// 状态
const activeTab = ref<TabType>('posts');
const activePeriod = ref<PeriodType>('daily');
const loading = ref(false);
const error = ref<string | null>(null);
const rankingData = ref<Array<PostRankingItem | CreatorRankingItem | TopicRankingItem>>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 20;

// 计算属性:前三名
const topThree = computed(() => {
  return (rankingData.value || []).slice(0, 3);
});

// 计算属性：剩余排名
const remainingItems = computed(() => {
  return (rankingData.value || []).slice(3);
});

// 获取排行榜数据
const fetchRankingData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      page: currentPage.value,
      size: pageSize,
    };

    let response;

    // 根据标签页和时间周期调用不同的 API
    if (activeTab.value === 'posts') {
      if (activePeriod.value === 'daily') {
        response = await rankingApi.getDailyPosts(params);
      } else if (activePeriod.value === 'weekly') {
        response = await rankingApi.getWeeklyPosts(params);
      } else {
        response = await rankingApi.getMonthlyPosts(params);
      }
    } else if (activeTab.value === 'creators') {
      if (activePeriod.value === 'daily') {
        response = await rankingApi.getDailyCreators(params);
      } else if (activePeriod.value === 'weekly') {
        response = await rankingApi.getWeeklyCreators(params);
      } else {
        response = await rankingApi.getMonthlyCreators(params);
      }
    } else {
      if (activePeriod.value === 'daily') {
        response = await rankingApi.getDailyTopics(params);
      } else if (activePeriod.value === 'weekly') {
        response = await rankingApi.getWeeklyTopics(params);
      } else {
        response = await rankingApi.getMonthlyTopics(params);
      }
    }

    // 确保 items 始终是数组，防止 undefined 导致的错误
    rankingData.value = response?.items || [];
    // 计算总页数
    totalPages.value = response ? Math.ceil(response.total / response.size) : 1;
  } catch (err: unknown) {
    error.value = getErrorMessage(err);
    console.error('Failed to fetch ranking data:', err);
    // 发生错误时重置为空数组
    rankingData.value = [];
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
};

// 切换页码
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 获取排行榜项组件
const getRankingItemComponent = () => {
  if (activeTab.value === 'posts') {
    return PostRankingCard;
  } else if (activeTab.value === 'creators') {
    return CreatorRankingCard;
  } else {
    return TopicRankingCard;
  }
};

// 监听标签页和时间周期变化
watch([activeTab, activePeriod], () => {
  currentPage.value = 1;
  fetchRankingData();
});

// 监听页码变化
watch(currentPage, () => {
  fetchRankingData();
});

// 初始化
onMounted(() => {
  fetchRankingData();
});
</script>

<style scoped>
/* 页面容器 */
.ranking-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
}

/* 标签页容器 */
.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  gap: var(--space-lg);
  flex-wrap: wrap;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: var(--space-sm);
  background: var(--color-bg-secondary);
  padding: var(--space-xs);
  border-radius: 12px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tab-button.active {
  background: var(--color-cta);
  color: white;
}

.tab-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 时间筛选 */
.period-filter {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-bg-secondary);
  padding: var(--space-xs);
  border-radius: 12px;
}

.period-button {
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-button:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.period-button.active {
  background: var(--color-cta);
  color: white;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
}

.error-message {
  color: var(--color-error);
  font-size: 1rem;
}

.retry-button {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-cta);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: var(--color-cta-hover);
  transform: translateY(-2px);
}

/* 排行榜内容 */
.ranking-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* 领奖台容器 */
.podium-container {
  margin-bottom: var(--space-xl);
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: var(--space-lg);
  padding: var(--space-xl) 0;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  max-width: 300px;
}

.podium-rank {
  margin-bottom: var(--space-sm);
}

.medal {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.medal.gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

.medal.silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  box-shadow: 0 8px 24px rgba(192, 192, 192, 0.4);
}

.medal.bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  box-shadow: 0 8px 24px rgba(205, 127, 50, 0.4);
}

.medal-icon {
  width: 40px;
  height: 40px;
  color: white;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.podium-content {
  width: 100%;
}

.podium-base {
  width: 100%;
  padding: var(--space-lg) var(--space-md);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.first-base {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  height: 120px;
}

.second-base {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  height: 100px;
}

.third-base {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  height: 80px;
}

.podium-number {
  font-family: var(--font-heading);
}

/* 排行榜列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background: var(--color-bg-hover);
  transform: translateX(4px);
}

.ranking-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  min-width: 60px;
}

.rank {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.rank-change {
  display: flex;
  align-items: center;
  gap: 2px;
}

.change-icon {
  width: 16px;
  height: 16px;
}

.change-icon.up {
  color: var(--color-success);
}

.change-icon.down {
  color: var(--color-error);
}

.change-value {
  font-size: 0.75rem;
  font-weight: 600;
}

.change-value.up {
  color: var(--color-success);
}

.change-value.down {
  color: var(--color-error);
}

.change-value.neutral {
  color: var(--color-text-tertiary);
}

.ranking-item-content {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
}

.empty-text {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-xl) 0;
}

.pagination-button {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: var(--color-cta);
  color: white;
  transform: translateY(-2px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ranking-page {
    padding: var(--space-lg) var(--space-md);
  }

  .page-title {
    font-size: 2rem;
  }

  .tabs-container {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs,
  .period-filter {
    width: 100%;
    justify-content: center;
  }

  .podium {
    flex-direction: column;
    align-items: center;
  }

  .podium-item {
    max-width: 100%;
    width: 100%;
  }

  .podium-item.first {
    order: 1;
  }

  .podium-item.second {
    order: 2;
  }

  .podium-item.third {
    order: 3;
  }

  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .ranking-number {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
