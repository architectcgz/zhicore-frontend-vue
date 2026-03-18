<!--
  标签云组件
  功能：以云的形式展示标签，根据热度调整字体大小
-->
<template>
  <div class="tag-cloud">
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner" />
      <p class="loading-text">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <p class="error-message">
        {{ error }}
      </p>
      <button
        class="retry-button"
        @click="loadTags"
      >
        重试
      </button>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="tags.length === 0"
      class="empty-container"
    >
      <p class="empty-message">
        暂无标签
      </p>
    </div>

    <!-- 标签云 -->
    <div
      v-else
      class="cloud-container"
    >
      <a
        v-for="tag in tags"
        :key="tag.id"
        :href="`/tags/${tag.slug}`"
        class="tag-item"
        :style="getTagStyle(tag)"
        :title="tag.postCount !== undefined ? `${tag.name} - ${tag.postCount} 篇文章` : tag.name"
        @click.prevent="handleTagClick(tag)"
      >
        {{ tag.name }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { tagApi } from '@/api';
import type { Tag } from '@/types';

// Props
interface Props {
  // 标签数量限制
  limit?: number;
  // 时间周期（用于热门标签）
  period?: 'day' | 'week' | 'month';
  // 最小字体大小（px）
  minFontSize?: number;
  // 最大字体大小（px）
  maxFontSize?: number;
  // 是否使用热门标签
  useHotTags?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 30,
  period: 'week',
  minFontSize: 14,
  maxFontSize: 32,
  useHotTags: true,
});

// Emits
const emit = defineEmits<{
  tagClick: [tag: Tag];
}>();

// 路由
const router = useRouter();

// 状态
const tags = ref<Tag[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * 加载标签
 */
const loadTags = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (props.useHotTags) {
      // 获取热门标签
      tags.value = await tagApi.getHotTags({
        limit: props.limit,
        period: props.period,
      });
    } else {
      // 获取普通标签列表
      const response = await tagApi.getTags({
        page: 0,
        size: props.limit,
      });
      tags.value = response.items;
    }
  } catch (err: any) {
    error.value = err.message || '加载标签失败';
    console.error('加载标签失败:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * 计算标签样式
 * 根据文章数量调整字体大小和颜色
 */
const getTagStyle = (tag: Tag) => {
  if (tags.value.length === 0) return {};

  const tagsWithCount = tags.value.filter(item => item.postCount !== undefined);
  if (tagsWithCount.length === 0 || tag.postCount === undefined) {
    return {
      fontSize: `${props.minFontSize}px`,
      opacity: '1.00',
      fontWeight: '500',
    };
  }

  // 计算文章数量范围
  const postCounts = tagsWithCount.map(t => t.postCount ?? 0);
  const maxPostCount = Math.max(...postCounts);
  const minPostCount = Math.min(...postCounts);
  const range = maxPostCount - minPostCount || 1;

  // 计算字体大小（线性映射）
  const fontSizeRange = props.maxFontSize - props.minFontSize;
  const fontSize = props.minFontSize +
    (((tag.postCount ?? minPostCount) - minPostCount) / range) * fontSizeRange;

  // 计算颜色深度（文章越多颜色越深）
  const colorIntensity = ((tag.postCount ?? minPostCount) - minPostCount) / range;
  const opacity = 0.6 + (colorIntensity * 0.4); // 0.6 - 1.0

  return {
    fontSize: `${fontSize}px`,
    opacity: opacity.toFixed(2),
    fontWeight: colorIntensity > 0.7 ? '600' : '500',
  };
};

/**
 * 处理标签点击
 */
const handleTagClick = (tag: Tag) => {
  emit('tagClick', tag);
  router.push(`/tags/${tag.slug}`);
};

// 生命周期
onMounted(() => {
  loadTags();
});

// 暴露方法供父组件调用
defineExpose({
  loadTags,
});
</script>

<style scoped>
/* 标签云容器 */
.tag-cloud {
  width: 100%;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 200px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: var(--space-md);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 200px;
}

.error-message {
  font-size: 0.875rem;
  color: var(--color-error);
  margin-bottom: var(--space-md);
}

.retry-button {
  padding: var(--space-xs) var(--space-md);
  border: none;
  border-radius: 6px;
  background: var(--color-cta);
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: var(--color-cta-hover);
  transform: translateY(-1px);
}

/* 空状态 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 200px;
}

.empty-message {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* 云容器 */
.cloud-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  justify-content: center;
  align-items: center;
  padding: var(--space-lg);
  min-height: 200px;
}

/* 标签项 */
.tag-item {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
}

/* 悬停效果 */
.tag-item:hover {
  color: var(--color-cta);
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.15) translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  z-index: 1;
}

/* 活动状态 */
.tag-item:active {
  transform: scale(1.1) translateY(0);
}

/* 焦点状态（键盘导航） */
.tag-item:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tag-item {
  animation: fadeIn 0.3s ease-out;
}

/* 为不同位置的标签添加延迟动画 */
.tag-item:nth-child(1) { animation-delay: 0.05s; }
.tag-item:nth-child(2) { animation-delay: 0.1s; }
.tag-item:nth-child(3) { animation-delay: 0.15s; }
.tag-item:nth-child(4) { animation-delay: 0.2s; }
.tag-item:nth-child(5) { animation-delay: 0.25s; }
.tag-item:nth-child(6) { animation-delay: 0.3s; }
.tag-item:nth-child(7) { animation-delay: 0.35s; }
.tag-item:nth-child(8) { animation-delay: 0.4s; }
.tag-item:nth-child(9) { animation-delay: 0.45s; }
.tag-item:nth-child(10) { animation-delay: 0.5s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .cloud-container {
    padding: var(--space-md);
    gap: var(--space-sm);
  }

  .tag-item {
    padding: 6px var(--space-sm);
  }
}

/* 暗色模式优化 */
@media (prefers-color-scheme: dark) {
  .tag-item:hover {
    background: rgba(37, 99, 235, 0.2);
  }
}

/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .tag-item {
    animation: none;
    transition: none;
  }

  .tag-item:hover {
    transform: none;
  }
}
</style>
