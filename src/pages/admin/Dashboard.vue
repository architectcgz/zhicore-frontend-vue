<!--
  管理员仪表板页面
  显示统计数据、图表和最近活动
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi, type AdminStats, type TrendDataPoint, type ContentGrowth, type RecentActivity } from '@/api/admin';
import {
  User,
  Document,
  ChatLineSquare,
  TrendCharts,
  Calendar,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

// 数据状态
const loading = ref(false);
const stats = ref<AdminStats | null>(null);
const trends = ref<TrendDataPoint[]>([]);
const contentGrowth = ref<ContentGrowth | null>(null);
const recentActivities = ref<RecentActivity[]>([]);

// 图表实例
const trendChartRef = ref<HTMLDivElement>();
const contentChartRef = ref<HTMLDivElement>();
let trendChart: echarts.ECharts | null = null;
let contentChart: echarts.ECharts | null = null;

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    stats.value = await adminApi.getStats();
  } catch (error) {
    console.error('加载统计数据失败:', error);
    ElMessage.error('加载统计数据失败');
  }
};

/**
 * 加载访问趋势数据
 */
const loadTrends = async () => {
  try {
    trends.value = await adminApi.getTrends(7);
    renderTrendChart();
  } catch (error) {
    console.error('加载访问趋势失败:', error);
    ElMessage.error('加载访问趋势失败');
  }
};

/**
 * 加载内容增长数据
 */
const loadContentGrowth = async () => {
  try {
    contentGrowth.value = await adminApi.getContentGrowth(30);
    renderContentChart();
  } catch (error) {
    console.error('加载内容增长数据失败:', error);
    ElMessage.error('加载内容增长数据失败');
  }
};

/**
 * 加载最近活动
 */
const loadRecentActivities = async () => {
  try {
    recentActivities.value = await adminApi.getRecentActivities(10);
  } catch (error) {
    console.error('加载最近活动失败:', error);
    ElMessage.error('加载最近活动失败');
  }
};

/**
 * 渲染访问趋势图表
 */
const renderTrendChart = () => {
  if (!trendChartRef.value || !trends.value.length) return;

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value);
  }

  const option: EChartsOption = {
    title: {
      text: '访问趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: trends.value.map(item => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: trends.value.map(item => item.value),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 99, 235, 0.3)' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.05)' },
          ]),
        },
        lineStyle: {
          color: '#2563EB',
        },
        itemStyle: {
          color: '#2563EB',
        },
      },
    ],
  };

  trendChart.setOption(option);
};

/**
 * 渲染内容增长图表
 */
const renderContentChart = () => {
  if (!contentChartRef.value || !contentGrowth.value) return;

  if (!contentChart) {
    contentChart = echarts.init(contentChartRef.value);
  }

  const option: EChartsOption = {
    title: {
      text: '内容增长',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['文章', '评论', '用户'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: contentGrowth.value.posts.map(item => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '文章',
        type: 'line',
        smooth: true,
        data: contentGrowth.value.posts.map(item => item.value),
        lineStyle: { color: '#2563EB' },
        itemStyle: { color: '#2563EB' },
      },
      {
        name: '评论',
        type: 'line',
        smooth: true,
        data: contentGrowth.value.comments.map(item => item.value),
        lineStyle: { color: '#10b981' },
        itemStyle: { color: '#10b981' },
      },
      {
        name: '用户',
        type: 'line',
        smooth: true,
        data: contentGrowth.value.users.map(item => item.value),
        lineStyle: { color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
      },
    ],
  };

  contentChart.setOption(option);
};

/**
 * 获取活动类型标签
 */
const getActivityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    user: '用户',
    post: '文章',
    comment: '评论',
    report: '举报',
  };
  return labels[type] || type;
};

/**
 * 获取活动类型颜色
 */
const getActivityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    user: 'success',
    post: 'primary',
    comment: 'info',
    report: 'warning',
  };
  return colors[type] || 'default';
};

/**
 * 格式化时间
 */
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

/**
 * 初始化
 */
const init = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadStats(),
      loadTrends(),
      loadContentGrowth(),
      loadRecentActivities(),
    ]);
  } finally {
    loading.value = false;
  }
};

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  trendChart?.resize();
  contentChart?.resize();
};

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
});

// 清理
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  contentChart?.dispose();
});
</script>

<template>
  <div
    v-loading="loading"
    class="admin-dashboard"
  >
    <!-- 统计卡片 -->
    <div class="admin-dashboard__stats">
      <!-- 用户统计 -->
      <el-card
        class="stat-card"
        shadow="hover"
      >
        <div class="stat-card__content">
          <div class="stat-card__icon stat-card__icon--user">
            <el-icon :size="32">
              <User />
            </el-icon>
          </div>
          <div class="stat-card__info">
            <div class="stat-card__label">
              总用户数
            </div>
            <div class="stat-card__value">
              {{ stats?.userCount || 0 }}
            </div>
            <div class="stat-card__trend">
              今日新增: {{ stats?.todayUserCount || 0 }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 文章统计 -->
      <el-card
        class="stat-card"
        shadow="hover"
      >
        <div class="stat-card__content">
          <div class="stat-card__icon stat-card__icon--post">
            <el-icon :size="32">
              <Document />
            </el-icon>
          </div>
          <div class="stat-card__info">
            <div class="stat-card__label">
              总文章数
            </div>
            <div class="stat-card__value">
              {{ stats?.postCount || 0 }}
            </div>
            <div class="stat-card__trend">
              今日新增: {{ stats?.todayPostCount || 0 }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 评论统计 -->
      <el-card
        class="stat-card"
        shadow="hover"
      >
        <div class="stat-card__content">
          <div class="stat-card__icon stat-card__icon--comment">
            <el-icon :size="32">
              <ChatLineSquare />
            </el-icon>
          </div>
          <div class="stat-card__info">
            <div class="stat-card__label">
              总评论数
            </div>
            <div class="stat-card__value">
              {{ stats?.commentCount || 0 }}
            </div>
            <div class="stat-card__trend">
              今日新增: {{ stats?.todayCommentCount || 0 }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="admin-dashboard__charts">
      <!-- 访问趋势图表 -->
      <el-card
        class="chart-card"
        shadow="hover"
      >
        <div
          ref="trendChartRef"
          class="chart-container"
        />
      </el-card>

      <!-- 内容增长图表 -->
      <el-card
        class="chart-card"
        shadow="hover"
      >
        <div
          ref="contentChartRef"
          class="chart-container"
        />
      </el-card>
    </div>

    <!-- 最近活动 -->
    <el-card
      class="admin-dashboard__activities"
      shadow="hover"
    >
      <template #header>
        <div class="card-header">
          <el-icon><Calendar /></el-icon>
          <span>最近活动</span>
        </div>
      </template>

      <el-timeline v-if="recentActivities.length > 0">
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="formatTime(activity.timestamp)"
          placement="top"
        >
          <div class="activity-item">
            <el-tag
              :type="getActivityTypeColor(activity.type)"
              size="small"
              class="activity-item__tag"
            >
              {{ getActivityTypeLabel(activity.type) }}
            </el-tag>
            <div class="activity-item__content">
              <div class="activity-item__title">
                {{ activity.title }}
              </div>
              <div class="activity-item__description">
                {{ activity.description }}
              </div>
              <div
                v-if="activity.user"
                class="activity-item__user"
              >
                <el-avatar
                  :src="activity.user.avatar"
                  :size="24"
                >
                  {{ activity.user.nickname.charAt(0) }}
                </el-avatar>
                <span>{{ activity.user.nickname }}</span>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>

      <el-empty
        v-else
        description="暂无活动记录"
      />
    </el-card>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* ========== 统计卡片 ========== */

.admin-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

.stat-card {
  cursor: pointer;
  transition: transform var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card__content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.stat-card__icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon--user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card__icon--post {
  background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%);
  color: white;
}

.stat-card__icon--comment {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-card__info {
  flex: 1;
}

.stat-card__label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.stat-card__value {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.stat-card__trend {
  font-size: 12px;
  color: var(--color-success);
}

/* ========== 图表区域 ========== */

.admin-dashboard__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.chart-card {
  min-height: 400px;
}

.chart-container {
  width: 100%;
  height: 350px;
}

/* ========== 最近活动 ========== */

.admin-dashboard__activities {
  margin-top: var(--space-lg);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 16px;
  font-weight: 600;
}

.activity-item {
  display: flex;
  gap: var(--space-md);
}

.activity-item__tag {
  flex-shrink: 0;
}

.activity-item__content {
  flex: 1;
}

.activity-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.activity-item__description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.activity-item__user {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ========== 响应式设计 ========== */

@media (max-width: 1023px) {
  .admin-dashboard__stats {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .admin-dashboard__charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .admin-dashboard__stats {
    grid-template-columns: 1fr;
  }

  .stat-card__value {
    font-size: 24px;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
