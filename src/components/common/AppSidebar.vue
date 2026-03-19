<!--
  应用侧边栏组件
  显示热门标签、热门作者、最近文章等内容
  支持响应式设计和移动端抽屉模式
-->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import { useHotCreatorsQuery } from '@/queries/ranking/useHotCreatorsQuery';
import { usePostsQuery } from '@/queries/posts/usePostsQuery';
import { 
  House, 
  Document, 
  CollectionTag, 
  Trophy, 
  Edit, 
  DocumentCopy, 
  Star, 
  User, 
  ArrowRight,
  MoreFilled,
  Menu
} from '@element-plus/icons-vue';

// 定义事件
const emit = defineEmits<{
  close: [];
}>();

// 定义 props
const props = defineProps<{
  isOpen?: boolean;
}>();

// 路由
const router = useRouter();

// 主导航链接
const navLinks = [
  { name: '首页', path: '/', icon: House },
  { name: '文章', path: '/posts', icon: Document },
  { name: '分类', path: '/categories', icon: DocumentCopy },
  { name: '标签', path: '/tags', icon: CollectionTag },
  { name: '排行榜', path: '/ranking', icon: Trophy },
];

// TanStack Query - 热门标签
const hotTagsParams = ref({ limit: 8 });
const { data: hotTagsData } = useHotTagsQuery(hotTagsParams);
const hotTags = computed(() => hotTagsData.value || []);

// TanStack Query - 热门作者
const hotCreatorsParams = ref({ size: 4 });
const { data: hotCreatorsData } = useHotCreatorsQuery(hotCreatorsParams);
const hotAuthors = computed(() => {
  if (!hotCreatorsData.value?.items) {
    return [];
  }
  return hotCreatorsData.value.items.map(item => item.user);
});

// TanStack Query - 最新文章
const latestPostsParams = ref({
  sort: 'latest' as const,
  size: 5,
  status: 'PUBLISHED' as const,
});
const { data: latestPostsData } = usePostsQuery(latestPostsParams);
const recentPosts = computed(() => latestPostsData.value?.items || []);

/**
 * 导航到标签页面
 */
const goToTag = (slug: string) => {
  router.push(`/tags/${slug}`);
  emit('close');
};

/**
 * 导航到用户页面
 */
const goToUser = (userId: string) => {
  router.push(`/users/${userId}`);
  emit('close');
};

/**
 * 导航到文章页面
 */
const goToPost = (postId: string) => {
  router.push(`/posts/${postId}`);
  emit('close');
};

/**
 * 导航到标签列表页面
 */
const goToAllTags = () => {
  router.push('/tags');
  emit('close');
};

/**
 * 导航到排行榜页面
 */
const goToRanking = () => {
  router.push('/ranking');
  emit('close');
};

/**
 * 格式化数字显示
 */
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

/**
 * 格式化日期显示
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * 获取用户头像占位符
 */
const getAvatarPlaceholder = (nickname: string): string => {
  return nickname.charAt(0).toUpperCase();
};

</script>

<template>
  <aside 
    class="app-sidebar"
    role="navigation"
    aria-label="主导航和内容推荐"
    :aria-hidden="!props.isOpen"
  >
    <!-- 主导航（移动端显示） -->
    <section class="app-sidebar__section app-sidebar__nav-section">
      <div class="app-sidebar__section-header">
        <h3 class="app-sidebar__section-title">
          <el-icon><Menu /></el-icon> 导航
        </h3>
      </div>
      
      <div class="app-sidebar__nav-links">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="app-sidebar__nav-link"
          @click="emit('close')"
        >
          <el-icon class="app-sidebar__nav-link-icon">
            <component :is="link.icon" />
          </el-icon>
          <span class="app-sidebar__nav-link-text">{{ link.name }}</span>
        </router-link>
      </div>
    </section>
    
    <!-- 热门标签 -->
    <section class="app-sidebar__section">
      <div class="app-sidebar__section-header">
        <h3 class="app-sidebar__section-title">
          <el-icon><CollectionTag /></el-icon> 热门标签
        </h3>
        <button
          class="app-sidebar__section-action"
          tabindex="0"
          @click="goToAllTags"
        >
          查看全部 <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
      
      <div class="app-sidebar__tags">
        <button
          v-for="tag in hotTags.slice(0, 8)"
          :key="tag.id"
          class="app-sidebar__tag"
          tabindex="0"
          @click="goToTag(tag.slug)"
        >
          <span class="app-sidebar__tag-name">{{ tag.name }}</span>
          <span class="app-sidebar__tag-count">{{ tag.postCount || 0 }}</span>
        </button>
        
        <div
          v-if="hotTags.length === 0"
          class="app-sidebar__empty"
        >
          暂无热门标签
        </div>
      </div>
    </section>
    
    <!-- 热门作者 -->
    <section class="app-sidebar__section">
      <div class="app-sidebar__section-header">
        <h3 class="app-sidebar__section-title">
          <el-icon><User /></el-icon> 热门作者
        </h3>
        <button
          class="app-sidebar__section-action"
          tabindex="0"
          @click="goToRanking"
        >
          排行榜 <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
      
      <div class="app-sidebar__authors">
        <div
          v-for="author in hotAuthors.slice(0, 4)"
          :key="author.id"
          class="app-sidebar__author"
          role="button"
          tabindex="0"
          @click="goToUser(author.id)"
          @keydown.enter="goToUser(author.id)"
          @keydown.space.prevent="goToUser(author.id)"
        >
          <div class="app-sidebar__author-avatar">
            <img
              v-if="author.avatar"
              :src="author.avatar"
              :alt="author.nickname"
              class="app-sidebar__author-avatar-img"
            >
            <div
              v-else
              class="app-sidebar__author-avatar-placeholder"
            >
              {{ getAvatarPlaceholder(author.nickname) }}
            </div>
          </div>
          
          <div class="app-sidebar__author-info">
            <div class="app-sidebar__author-name">
              {{ author.nickname }}
            </div>
            <div class="app-sidebar__author-stats">
              {{ formatNumber(author.followersCount || 0) }} 关注者 · 
              {{ author.postsCount || 0 }} 文章
            </div>
          </div>
        </div>
        
        <div
          v-if="hotAuthors.length === 0"
          class="app-sidebar__empty"
        >
          暂无热门作者
        </div>
      </div>
    </section>
    
    <!-- 最近文章 -->
    <section class="app-sidebar__section">
      <div class="app-sidebar__section-header">
        <h3 class="app-sidebar__section-title">
          <el-icon><Document /></el-icon> 最近文章
        </h3>
      </div>
      
      <div class="app-sidebar__posts">
        <article
          v-for="post in recentPosts.slice(0, 5)"
          :key="post.id"
          class="app-sidebar__post"
          role="button"
          tabindex="0"
          @click="goToPost(post.id)"
          @keydown.enter="goToPost(post.id)"
          @keydown.space.prevent="goToPost(post.id)"
        >
          <h4 class="app-sidebar__post-title">
            {{ post.title }}
          </h4>
          <div class="app-sidebar__post-meta">
            <span class="app-sidebar__post-author">{{ post.author?.nickname || '未知作者' }}</span>
            <span class="app-sidebar__post-separator">·</span>
            <span class="app-sidebar__post-date">{{ formatDate(post.publishedAt || post.createdAt) }}</span>
            <span class="app-sidebar__post-separator">·</span>
            <span class="app-sidebar__post-views">{{ formatNumber(post.viewCount || 0) }} 阅读</span>
          </div>
        </article>
        
        <div
          v-if="recentPosts.length === 0"
          class="app-sidebar__empty"
        >
          暂无最新文章
        </div>
      </div>
    </section>
    
    <!-- 快捷链接 -->
    <section class="app-sidebar__section app-sidebar__section--actions">
      <div class="app-sidebar__section-header">
        <h3 class="app-sidebar__section-title">
          <el-icon><MoreFilled /></el-icon> 快捷链接
        </h3>
      </div>
      
      <div class="app-sidebar__links">
        <router-link
          to="/posts/create"
          class="app-sidebar__link app-sidebar__link--primary"
        >
          <el-icon class="app-sidebar__link-icon">
            <Edit />
          </el-icon>
          <span class="app-sidebar__link-text">写文章</span>
        </router-link>
        
        <router-link
          to="/drafts"
          class="app-sidebar__link"
        >
          <el-icon class="app-sidebar__link-icon">
            <DocumentCopy />
          </el-icon>
          <span class="app-sidebar__link-text">我的草稿</span>
        </router-link>
        
        <router-link
          to="/favorites"
          class="app-sidebar__link"
        >
          <el-icon class="app-sidebar__link-icon">
            <Star />
          </el-icon>
          <span class="app-sidebar__link-text">我的收藏</span>
        </router-link>
        
        <router-link
          to="/following"
          class="app-sidebar__link"
        >
          <el-icon class="app-sidebar__link-icon">
            <User />
          </el-icon>
          <span class="app-sidebar__link-text">我的关注</span>
        </router-link>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* ========== 区块样式 ========== */

.app-sidebar__section {
  background-color: var(--color-bg-secondary); /* Updated to match new var */
  /* Remove border to match card style */
  /* border: 1px solid var(--color-border-light); */
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md); /* Added shadow */
  transition: all 200ms ease; /* Added transition */
}

.app-sidebar__section:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.app-sidebar__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background-color: transparent; /* Remove header background */
  border-bottom: 1px solid var(--color-border-light);
}

.app-sidebar__section-title {
  margin: 0;
  font-family: var(--font-heading); /* Use Caveat font */
  font-size: var(--font-size-lg);  /* Increased size */
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.app-sidebar__section-action {
  background: none;
  border: none;
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-base);
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-sidebar__section-action:hover {
  color: var(--color-primary);
}

.app-sidebar__section-action:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.app-sidebar__section-action:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__section-action:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ========== 导航链接样式 ========== */

.app-sidebar__nav-section {
  display: none; /* 默认隐藏，仅在移动端显示 */
}

.app-sidebar__nav-links {
  /* 任务 4.3: 设置合适的内边距 */
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.app-sidebar__nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  /* 任务 4.1: 设置高度为 44px(确保易于点击) */
  height: 44px;
  /* 任务 4.1: 设置内边距为 12px 16px */
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  /* 任务 4.1: 设置字体大小为 14px */
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.app-sidebar__nav-link:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
  transform: translateX(4px); /* Motion effect */
}

.app-sidebar__nav-link:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__nav-link:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__nav-link:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__nav-link.router-link-active {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.app-sidebar__nav-link-icon {
  /* 任务 4.1: 设置图标大小为 20px */
  font-size: 20px;
  width: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-sidebar__nav-link-text {
  flex: 1;
}

/* ========== 标签样式 ========== */

.app-sidebar__tags {
  padding: var(--space-md);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.app-sidebar__tags .app-sidebar__empty {
  width: 100%;
  text-align: center;
}

.app-sidebar__tag {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-tertiary);
  border: 1px solid transparent; /* Remove default border */
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.app-sidebar__tag:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
  color: var(--color-text);
  transform: translateY(-1px); /* Motion effect */
}

.app-sidebar__tag:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__tag:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__tag:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__tag-name {
  font-weight: var(--font-weight-medium);
}

.app-sidebar__tag-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background-color: rgba(255, 255, 255, 0.5); /* Semi-transparent bg */
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  min-width: 20px;
  text-align: center;
}

/* ========== 作者样式 ========== */

.app-sidebar__authors {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.app-sidebar__author {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.app-sidebar__author:hover {
  background-color: var(--color-hover);
  transform: translateX(4px); /* Motion effect */
}

.app-sidebar__author:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__author:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__author:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__author-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm); /* Added shadow */
}

.app-sidebar__author-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-sidebar__author-avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.app-sidebar__author-info {
  flex: 1;
  min-width: 0;
}

.app-sidebar__author-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__author-stats {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.2;
}

/* ========== 文章样式 ========== */

.app-sidebar__posts {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.app-sidebar__post {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.app-sidebar__post:hover {
  background-color: var(--color-hover);
  transform: translateX(4px); /* Motion effect */
}

.app-sidebar__post:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__post:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__post:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__post-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: var(--line-height-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-sidebar__post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1;
}

.app-sidebar__post-author {
  font-weight: var(--font-weight-medium);
}

.app-sidebar__post-separator {
  color: var(--color-text-tertiary);
}

.app-sidebar__post-date,
.app-sidebar__post-views {
  white-space: nowrap;
}

/* ========== 链接样式 ========== */

.app-sidebar__empty {
  text-align: center;
  padding: var(--space-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.app-sidebar__links {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  /* 任务 6.1: 设置高度为 44px */
  height: 44px;
  /* 任务 6.1: 设置内边距为 12px 16px */
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  /* 任务 6.1: 设置字体大小为 14px */
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.app-sidebar__link:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
  transform: translateX(4px); /* Motion effect */
}

.app-sidebar__link:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__link:focus:not(:focus-visible) {
  outline: none;
}

.app-sidebar__link:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-sidebar__link.router-link-active {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.app-sidebar__link-icon {
  /* 任务 6.1: 设置图标大小为 20px */
  font-size: 20px;
  width: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-sidebar__link-text {
  flex: 1;
}

/* 任务 6.2: 突出显示"写文章"按钮 */
.app-sidebar__link--primary {
  /* 任务 6.2: 使用 var(--color-cta) 背景色 */
  background-color: var(--color-cta);
  /* 任务 6.2: 使用 var(--color-text-inverse) 文字颜色 */
  color: var(--color-text-inverse);
}

.app-sidebar__link--primary:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  /* 任务 6.2: 添加悬停效果 */
  transform: translateX(4px) scale(1.02);
}

.app-sidebar__link--primary .app-sidebar__link-icon {
  /* 任务 6.2: 使用更大的图标(22px) */
  font-size: 22px;
  width: 22px;
}

/* 任务 6.3: 调整快捷链接区域位置 */
.app-sidebar__section--actions {
  /* 任务 6.3: 添加顶部边框分隔 */
  border-top: 2px solid var(--color-border);
  /* 任务 6.3: 设置合适的内边距 */
  margin-top: auto; /* 在桌面端推到底部 */
}

/* ========== 性能优化 ========== */

/* 任务 8.1: 优化渲染性能 - 使用 will-change 提示浏览器优化 */
.app-sidebar__nav-link,
.app-sidebar__tag,
.app-sidebar__author,
.app-sidebar__post,
.app-sidebar__link {
  /* 使用 will-change 提示浏览器优化 transform 和 background-color */
  will-change: transform, background-color;
}

/* 任务 8.1: 避免不必要的重排和重绘 - 使用 transform 而非 margin/padding */
/* 所有动画效果已使用 transform: translateX() 和 translateY() */

/* 任务 8.1: 优化选择器性能 - 避免深层嵌套 */
/* 所有选择器已经使用 BEM 命名，避免了深层嵌套 */

/* 任务 8.1: 使用 CSS 变量减少计算 */
/* 所有颜色、间距、字体大小都使用 CSS 变量 */

/* 任务 8.2: 优化动画性能 - 确保动画保持 60fps */
/* 使用硬件加速 - 所有动画使用 transform */
.app-sidebar__nav-link,
.app-sidebar__tag,
.app-sidebar__author,
.app-sidebar__post,
.app-sidebar__link {
  /* 使用 GPU 加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 任务 8.2: 监控性能指标 - 使用 contain 属性优化渲染 */
.app-sidebar__section {
  contain: layout style paint;
}

.app-sidebar__nav-link,
.app-sidebar__tag,
.app-sidebar__author,
.app-sidebar__post,
.app-sidebar__link {
  contain: layout style;
}

/* ========== 响应式设计 ========== */

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .app-sidebar {
    gap: var(--space-lg);
  }
  
  .app-sidebar__section-header {
    padding: var(--space-sm) var(--space-md);
  }
  
  .app-sidebar__tags,
  .app-sidebar__authors,
  .app-sidebar__posts,
  .app-sidebar__links {
    padding: var(--space-sm);
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .app-sidebar {
    /* 任务 3.2: 调整侧边栏间距 - 将区块间距从 24px 改为 16px */
    gap: 16px;
  }
  
  .app-sidebar__nav-section {
    display: block; /* 在移动端显示导航 */
  }
  
  .app-sidebar__section {
    /* 任务 3.4: 移除不必要的视觉元素 - 在移动端移除区块阴影 */
    box-shadow: none;
    /* 任务 3.4: 简化区块边框 */
    border: 1px solid var(--color-border-light);
  }
  
  .app-sidebar__section-header {
    /* 任务 3.2: 调整区块内边距从 16px 改为 12px */
    padding: 12px;
  }
  
  .app-sidebar__section-title {
    /* 任务 3.3: 将字体大小从 16px 改为 14px */
    font-size: 14px;
    /* 任务 3.3: 使用字重 600 */
    font-weight: 600;
    /* 任务 3.2: 调整元素间距从 12px 改为 8px */
    gap: 8px;
  }
  
  .app-sidebar__section-title .el-icon {
    /* 任务 3.3: 将图标大小从 18px 改为 16px */
    font-size: 16px;
  }
  
  .app-sidebar__tags,
  .app-sidebar__authors,
  .app-sidebar__posts,
  .app-sidebar__links,
  .app-sidebar__nav-links {
    /* 任务 3.2: 调整区块内边距从 16px 改为 12px */
    padding: 12px;
    /* 任务 3.2: 调整元素间距从 12px 改为 8px */
    gap: 8px;
  }
  
  .app-sidebar__author-avatar {
    /* 任务 5.2: 优化作者卡片 - 将头像从 40px 改为 28px */
    width: 28px;
    height: 28px;
  }
  
  .app-sidebar__author {
    /* 任务 5.2: 将内边距从 12px 改为 8px */
    padding: 8px;
    /* 任务 3.2: 调整元素间距 */
    gap: 8px;
  }
  
  .app-sidebar__author-info {
    gap: 8px;
  }
  
  .app-sidebar__author-name {
    /* 任务 5.2: 优化作者卡片 - 将字体大小从 14px 改为 13px */
    font-size: 13px;
  }
  
  .app-sidebar__post {
    /* 任务 5.3: 优化文章列表 - 将内边距从 12px 改为 8px */
    padding: 8px;
  }
  
  .app-sidebar__post-title {
    /* 任务 5.3: 优化文章列表 - 将标题字体从 14px 改为 13px */
    font-size: 13px;
    /* 任务 5.3: 将标题行数从 2 行改为 1 行(使用省略号) */
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
  
  .app-sidebar__post-meta {
    /* 任务 5.3: 优化文章列表 - 将元数据字体从 12px 改为 11px */
    font-size: 11px;
  }
  
  .app-sidebar__tag {
    /* 任务 5.1: 优化标签按钮 - 将内边距从 6px 12px 改为 4px 8px */
    padding: 4px 8px;
    /* 任务 5.1: 将字体大小从 14px 改为 12px */
    font-size: 12px;
    /* 任务 5.1: 保持圆角样式 */
    border-radius: var(--radius-full);
  }
  
  .app-sidebar__tag-count {
    /* 任务 5.1: 将计数字体大小改为 11px */
    font-size: 11px;
  }
  
  /* 任务 6.3: 移动端快捷链接区域样式 */
  .app-sidebar__section--actions {
    /* 任务 6.3: 将快捷链接放在侧边栏底部 */
    margin-top: auto;
    /* 任务 6.3: 添加顶部边框分隔 */
    border-top: 2px solid var(--color-border);
    /* 任务 6.3: 设置合适的内边距 */
    padding-top: 12px;
  }
}

/* 小屏移动设备 (< 480px) */
@media (max-width: 479px) {
  .app-sidebar {
    /* 任务 9.1: 进一步减小间距 */
    gap: 12px;
  }
  
  .app-sidebar__section {
    /* 任务 9.1: 调整圆角 */
    border-radius: var(--radius-md);
  }
  
  .app-sidebar__section-header {
    /* 任务 9.1: 进一步减小内边距 */
    padding: 8px 10px;
  }
  
  .app-sidebar__section-title {
    /* 任务 9.1: 调整字体大小 */
    font-size: 13px;
    gap: 6px;
  }
  
  .app-sidebar__section-title .el-icon {
    /* 任务 9.1: 调整图标大小 */
    font-size: 14px;
  }
  
  .app-sidebar__section-action {
    /* 任务 9.1: 调整操作按钮字体 */
    font-size: 11px;
  }
  
  .app-sidebar__tags,
  .app-sidebar__authors,
  .app-sidebar__posts,
  .app-sidebar__links,
  .app-sidebar__nav-links {
    /* 任务 9.1: 进一步减小内边距 */
    padding: 8px;
    gap: 6px;
  }
  
  .app-sidebar__nav-link,
  .app-sidebar__link {
    /* 任务 9.1: 确保所有元素可见和可用 - 保持最小点击区域 44px */
    height: 44px;
    padding: 10px 12px;
    font-size: 13px;
    gap: 10px;
  }
  
  .app-sidebar__nav-link-icon,
  .app-sidebar__link-icon {
    /* 任务 9.1: 调整图标大小 */
    font-size: 18px;
    width: 18px;
  }
  
  .app-sidebar__link--primary .app-sidebar__link-icon {
    /* 任务 9.1: 主要链接图标稍大 */
    font-size: 20px;
    width: 20px;
  }
  
  .app-sidebar__tag {
    /* 任务 9.1: 调整标签样式 */
    font-size: 11px;
    padding: 3px 6px;
  }
  
  .app-sidebar__tag-count {
    /* 任务 9.1: 调整标签计数字体 */
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .app-sidebar__author {
    /* 任务 9.1: 减小作者卡片内边距 */
    padding: 6px;
    gap: 8px;
  }
  
  .app-sidebar__author-avatar {
    /* 任务 9.1: 调整头像大小 */
    width: 24px;
    height: 24px;
  }
  
  .app-sidebar__author-name {
    /* 任务 9.1: 调整作者名字体 */
    font-size: 12px;
  }
  
  .app-sidebar__author-stats {
    /* 任务 9.1: 调整统计信息字体 */
    font-size: 10px;
  }
  
  .app-sidebar__post {
    /* 任务 9.1: 减小文章项内边距 */
    padding: 6px;
  }
  
  .app-sidebar__post-title {
    /* 任务 9.1: 调整文章标题字体 */
    font-size: 12px;
    margin-bottom: 6px;
  }
  
  .app-sidebar__post-meta {
    /* 任务 9.1: 调整元数据字体 */
    font-size: 10px;
    gap: 4px;
  }
  
  .app-sidebar__empty {
    /* 任务 9.1: 调整空状态样式 */
    padding: 12px 8px;
    font-size: 12px;
  }
}

/* 暗色主题特殊处理 */
[data-theme='dark'] .app-sidebar__tag-count {
  background-color: var(--color-bg-tertiary);
}

[data-theme='dark'] .app-sidebar__author-avatar-placeholder {
  background-color: var(--color-secondary);
}

[data-theme='dark'] .app-sidebar__section {
  box-shadow: none; /* Reduce shadow in dark mode */
  border: 1px solid var(--color-border);
}

/* ========== 减少动画支持 ========== */

/* 任务 8.3: 添加减少动画支持 - 禁用所有动画和过渡 */
@media (prefers-reduced-motion: reduce) {
  /* 禁用所有过渡效果 */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* 任务 8.3: 保持功能正常 - 移除 transform 动画但保持交互 */
  .app-sidebar__nav-link:hover,
  .app-sidebar__tag:hover,
  .app-sidebar__author:hover,
  .app-sidebar__post:hover,
  .app-sidebar__link:hover {
    transform: none;
  }
  
  /* 移除 will-change 以节省资源 */
  .app-sidebar__nav-link,
  .app-sidebar__tag,
  .app-sidebar__author,
  .app-sidebar__post,
  .app-sidebar__link {
    will-change: auto;
  }
  
  /* 移除 GPU 加速 */
  .app-sidebar__nav-link,
  .app-sidebar__tag,
  .app-sidebar__author,
  .app-sidebar__post,
  .app-sidebar__link {
    transform: none;
    backface-visibility: visible;
  }
}

/* ========== 横屏模式优化 ========== */

/* 任务 9.2: 优化横屏模式 - 移动设备横屏 */
@media (max-width: 767px) and (orientation: landscape) {
  .app-sidebar {
    /* 任务 9.2: 减小区块间距以节省垂直空间 */
    gap: 12px;
  }
  
  .app-sidebar__section {
    /* 任务 9.2: 减小区块内边距 */
    padding: 0;
  }
  
  .app-sidebar__section-header {
    /* 任务 9.2: 减小标题区域内边距 */
    padding: 8px 12px;
  }
  
  .app-sidebar__section-title {
    /* 任务 9.2: 调整字体大小 */
    font-size: 13px;
  }
  
  .app-sidebar__tags,
  .app-sidebar__authors,
  .app-sidebar__posts,
  .app-sidebar__links,
  .app-sidebar__nav-links {
    /* 任务 9.2: 减小内容区域内边距 */
    padding: 8px;
    gap: 6px;
  }
  
  .app-sidebar__nav-link,
  .app-sidebar__link {
    /* 任务 9.2: 减小链接高度但保持可点击性 */
    height: 40px;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .app-sidebar__author {
    /* 任务 9.2: 减小作者卡片内边距 */
    padding: 6px;
  }
  
  .app-sidebar__author-avatar {
    /* 任务 9.2: 调整头像大小 */
    width: 24px;
    height: 24px;
  }
  
  .app-sidebar__post {
    /* 任务 9.2: 减小文章项内边距 */
    padding: 6px;
  }
  
  .app-sidebar__post-title {
    /* 任务 9.2: 调整标题字体和行数 */
    font-size: 12px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    margin-bottom: 4px;
  }
  
  .app-sidebar__post-meta {
    /* 任务 9.2: 调整元数据字体 */
    font-size: 10px;
  }
}

/* 任务 9.2: 小屏设备横屏模式 */
@media (max-width: 479px) and (orientation: landscape) {
  .app-sidebar {
    /* 任务 9.2: 进一步减小间距 */
    gap: 10px;
  }
  
  .app-sidebar__section-header {
    /* 任务 9.2: 更小的内边距 */
    padding: 6px 10px;
  }
  
  .app-sidebar__section-title {
    /* 任务 9.2: 更小的字体 */
    font-size: 12px;
  }
  
  .app-sidebar__tags,
  .app-sidebar__authors,
  .app-sidebar__posts,
  .app-sidebar__links,
  .app-sidebar__nav-links {
    /* 任务 9.2: 更小的内边距 */
    padding: 6px;
    gap: 4px;
  }
  
  .app-sidebar__nav-link,
  .app-sidebar__link {
    /* 任务 9.2: 减小高度 */
    height: 36px;
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .app-sidebar__author-avatar {
    /* 任务 9.2: 更小的头像 */
    width: 20px;
    height: 20px;
  }
  
  .app-sidebar__author-name {
    /* 任务 9.2: 调整字体 */
    font-size: 11px;
  }
  
  .app-sidebar__author-stats {
    /* 任务 9.2: 调整字体 */
    font-size: 9px;
  }
}
</style>
