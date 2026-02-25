<!--
  签到组件
  显示签到按钮、签到状态、签到统计和签到日历
-->
<template>
  <div class="check-in-widget">
    <!-- 签到卡片 -->
    <div class="check-in-card">
      <div class="card-header">
        <h3 class="card-title">
          每日签到
        </h3>
        <el-tooltip
          content="连续签到可获得更多奖励"
          placement="top"
        >
          <i class="el-icon-question" />
        </el-tooltip>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="loading-state"
      >
        <LoadingSpinner size="small" />
        <p>加载中...</p>
      </div>

      <!-- 签到内容 -->
      <div
        v-else
        class="card-content"
      >
        <!-- 签到按钮区域 -->
        <div class="check-in-action">
          <el-button
            :type="checkInInfo?.isCheckedIn ? 'default' : 'primary'"
            :disabled="checkInInfo?.isCheckedIn || checkInLoading"
            :loading="checkInLoading"
            size="large"
            class="check-in-button"
            @click="handleCheckIn"
          >
            <span v-if="checkInInfo?.isCheckedIn">今日已签到</span>
            <span v-else>立即签到</span>
          </el-button>
          
          <!-- 签到奖励提示 -->
          <div
            v-if="!checkInInfo?.isCheckedIn"
            class="reward-hint"
          >
            <i class="el-icon-trophy" />
            <span>签到可获得 {{ checkInInfo?.todayReward || 10 }} 积分</span>
          </div>
        </div>

        <!-- 签到统计 -->
        <div
          v-if="stats"
          class="check-in-stats"
        >
          <div class="stat-item">
            <div class="stat-value">
              {{ stats.consecutiveDays }}
            </div>
            <div class="stat-label">
              连续签到
            </div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">
              {{ stats.totalDays }}
            </div>
            <div class="stat-label">
              累计签到
            </div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">
              {{ stats.longestStreak }}
            </div>
            <div class="stat-label">
              最长连续
            </div>
          </div>
        </div>

        <!-- 签到日历 -->
        <div class="check-in-calendar">
          <div class="calendar-header">
            <el-button
              size="small"
              :icon="'el-icon-arrow-left'"
              @click="handlePreviousMonth"
            />
            <span class="calendar-title">
              {{ currentYear }}年{{ currentMonth }}月
            </span>
            <el-button
              size="small"
              :icon="'el-icon-arrow-right'"
              :disabled="isCurrentMonth"
              @click="handleNextMonth"
            />
          </div>

          <div
            v-if="calendarLoading"
            class="calendar-loading"
          >
            <LoadingSpinner size="small" />
          </div>

          <div
            v-else
            class="calendar-grid"
          >
            <!-- 星期标题 -->
            <div
              v-for="day in weekDays"
              :key="day"
              class="calendar-weekday"
            >
              {{ day }}
            </div>

            <!-- 日期格子 -->
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="[
                'calendar-day',
                {
                  'is-empty': !day,
                  'is-checked': day && isCheckedDay(day),
                  'is-today': day && isToday(day),
                }
              ]"
            >
              <span v-if="day">{{ day }}</span>
            </div>
          </div>
        </div>

        <!-- 里程碑提示 -->
        <div
          v-if="showMilestone"
          class="milestone-banner"
        >
          <i class="el-icon-trophy" />
          <span>恭喜！连续签到 {{ stats?.consecutiveDays }} 天，获得额外奖励！</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { userApi } from '@/api/user';
import type { CheckInInfo, CheckInStats, MonthlyCheckIn } from '@/api/user';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// Props
interface Props {
  userId: string;
}

const props = defineProps<Props>();

// 响应式状态
const loading = ref(true);
const checkInLoading = ref(false);
const calendarLoading = ref(false);
const checkInInfo = ref<CheckInInfo | null>(null);
const stats = ref<CheckInStats | null>(null);
const monthlyCheckIn = ref<MonthlyCheckIn | null>(null);
const showMilestone = ref(false);

// 日历相关状态
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算属性
const isCurrentMonth = computed(() => {
  const now = new Date();
  return currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth() + 1;
});

/**
 * 计算日历天数数组
 */
const calendarDays = computed(() => {
  if (!monthlyCheckIn.value) return [];

  const year = currentYear.value;
  const month = currentMonth.value;
  
  // 获取当月第一天是星期几（0-6）
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  // 获取当月总天数
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 创建日历数组
  const days: (number | null)[] = [];
  
  // 填充前面的空白
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // 填充日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
});

// 生命周期
onMounted(() => {
  loadCheckInData();
});

// 监听用户 ID 变化
watch(() => props.userId, () => {
  loadCheckInData();
});

/**
 * 加载签到数据
 */
const loadCheckInData = async () => {
  loading.value = true;
  
  try {
    // 并行加载签到统计和月度签到记录
    const [statsData, monthlyData] = await Promise.all([
      userApi.getCheckInStats(props.userId),
      userApi.getMonthlyCheckIn(props.userId, currentYear.value, currentMonth.value),
    ]);
    
    stats.value = statsData;
    monthlyCheckIn.value = monthlyData;
    
    // 设置签到信息（从统计数据推断）
    checkInInfo.value = {
      isCheckedIn: isCheckedToday(),
      consecutiveDays: statsData.consecutiveDays,
      totalDays: statsData.totalDays,
      todayReward: calculateTodayReward(statsData.consecutiveDays),
      nextReward: calculateTodayReward(statsData.consecutiveDays + 1),
    };
  } catch (error) {
    console.error('加载签到数据失败:', error);
    ElMessage.error('加载签到数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理签到
 */
const handleCheckIn = async () => {
  if (checkInLoading.value || checkInInfo.value?.isCheckedIn) return;

  checkInLoading.value = true;

  try {
    const result = await userApi.checkIn(props.userId);
    
    // 更新签到信息
    checkInInfo.value = result;
    
    // 重新加载统计数据
    await loadCheckInData();
    
    // 显示成功消息
    ElMessage.success({
      message: `签到成功！获得 ${result.todayReward} 积分`,
      duration: 3000,
    });
    
    // 检查是否达到里程碑
    if (result.consecutiveDays % 7 === 0 || result.consecutiveDays % 30 === 0) {
      showMilestone.value = true;
      setTimeout(() => {
        showMilestone.value = false;
      }, 5000);
    }
  } catch (error: any) {
    console.error('签到失败:', error);
    ElMessage.error(error.message || '签到失败，请稍后重试');
  } finally {
    checkInLoading.value = false;
  }
};

/**
 * 处理上一个月
 */
const handlePreviousMonth = async () => {
  if (currentMonth.value === 1) {
    currentYear.value--;
    currentMonth.value = 12;
  } else {
    currentMonth.value--;
  }
  
  await loadMonthlyCheckIn();
};

/**
 * 处理下一个月
 */
const handleNextMonth = async () => {
  if (isCurrentMonth.value) return;
  
  if (currentMonth.value === 12) {
    currentYear.value++;
    currentMonth.value = 1;
  } else {
    currentMonth.value++;
  }
  
  await loadMonthlyCheckIn();
};

/**
 * 加载月度签到记录
 */
const loadMonthlyCheckIn = async () => {
  calendarLoading.value = true;
  
  try {
    monthlyCheckIn.value = await userApi.getMonthlyCheckIn(
      props.userId,
      currentYear.value,
      currentMonth.value
    );
  } catch (error) {
    console.error('加载月度签到记录失败:', error);
    ElMessage.error('加载签到日历失败');
  } finally {
    calendarLoading.value = false;
  }
};

/**
 * 判断是否为签到日
 */
const isCheckedDay = (day: number): boolean => {
  return monthlyCheckIn.value?.checkedDays.includes(day) || false;
};

/**
 * 判断是否为今天
 */
const isToday = (day: number): boolean => {
  const now = new Date();
  return (
    currentYear.value === now.getFullYear() &&
    currentMonth.value === now.getMonth() + 1 &&
    day === now.getDate()
  );
};

/**
 * 判断今天是否已签到
 */
const isCheckedToday = (): boolean => {
  const now = new Date();
  if (
    currentYear.value === now.getFullYear() &&
    currentMonth.value === now.getMonth() + 1
  ) {
    return isCheckedDay(now.getDate());
  }
  return false;
};

/**
 * 计算今日奖励
 */
const calculateTodayReward = (consecutiveDays: number): number => {
  // 基础奖励 10 积分
  let reward = 10;
  
  // 连续签到奖励
  if (consecutiveDays >= 7) {
    reward += 5; // 连续 7 天额外 5 积分
  }
  if (consecutiveDays >= 30) {
    reward += 10; // 连续 30 天额外 10 积分
  }
  
  return reward;
};
</script>

<style scoped>
.check-in-widget {
  width: 100%;
}

.check-in-card {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-header i {
  color: var(--color-text-secondary);
  cursor: help;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.loading-state p {
  margin-top: var(--space-sm);
  font-size: 0.875rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.check-in-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.check-in-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.reward-hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-cta);
  font-size: 0.875rem;
}

.reward-hint i {
  font-size: 1rem;
}

.check-in-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--space-md);
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-cta);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

.check-in-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.calendar-loading {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
}

.calendar-weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: var(--space-xs);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-sm);
  cursor: default;
  transition: all 0.2s ease;
}

.calendar-day.is-empty {
  background: transparent;
}

.calendar-day.is-checked {
  background: var(--color-cta);
  color: white;
  font-weight: 600;
}

.calendar-day.is-today {
  border: 2px solid var(--color-cta);
}

.calendar-day.is-checked.is-today {
  border-color: white;
}

.milestone-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: var(--border-radius-md);
  color: #333;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.milestone-banner i {
  font-size: 1.5rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .check-in-card {
    padding: var(--space-md);
  }

  .card-title {
    font-size: 1.125rem;
  }

  .check-in-stats {
    padding: var(--space-sm);
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .calendar-weekday,
  .calendar-day {
    font-size: 0.75rem;
  }
}
</style>
