<!--
  草稿箱页面
  显示用户的草稿文章列表，支持编辑、删除、发布等操作
-->
<template>
  <div class="drafts-page">
    <div class="drafts-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            我的草稿
          </h1>
          <p class="page-description">
            管理您的草稿文章
          </p>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            @click="handleCreatePost"
          >
            <i class="el-icon-edit" />
            写文章
          </el-button>
        </div>
      </div>

      <!-- 草稿列表 -->
      <div class="drafts-content">
        <!-- 加载状态 -->
        <div
          v-if="loading"
          class="loading-container"
        >
          <LoadingSpinner size="large" />
          <p>正在加载草稿...</p>
        </div>

        <!-- 错误状态 -->
        <div
          v-else-if="error"
          class="error-container"
        >
          <SiteErrorState
            title="加载草稿失败"
            :message="error"
            mode="section"
            retry-text="重试加载"
            @retry="handleRetry"
          />
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="drafts.length === 0"
          class="empty-container"
        >
          <EmptyState 
            icon="el-icon-document"
            title="还没有草稿"
            description="开始创作您的第一篇文章吧"
          >
            <el-button
              type="primary"
              @click="handleCreatePost"
            >
              写文章
            </el-button>
          </EmptyState>
        </div>

        <!-- 草稿网格 -->
        <div
          v-else
          class="drafts-grid"
        >
          <div
            v-for="draft in drafts"
            :key="draft.id"
            class="draft-card"
            @click="handleEditDraft(draft.id)"
          >
            <!-- 封面图 -->
            <div class="draft-cover">
              <img
                v-if="draft.coverImage"
                :src="draft.coverImage"
                :alt="draft.title"
                class="cover-image"
              >
              <div
                v-else
                class="cover-placeholder"
              >
                <i class="el-icon-document" />
              </div>
            </div>

            <!-- 草稿信息 -->
            <div class="draft-info">
              <h3 class="draft-title">
                {{ draft.title || '无标题' }}
              </h3>
              <p class="draft-excerpt">
                {{ draft.excerpt || '暂无内容...' }}
              </p>
              
              <!-- 标签 -->
              <div
                v-if="draft.tags && draft.tags.length"
                class="draft-tags"
              >
                <el-tag
                  v-for="tag in draft.tags.slice(0, 3)"
                  :key="tag.name"
                  size="small"
                  class="draft-tag"
                >
                  {{ tag.name }}
                </el-tag>
                <span
                  v-if="draft.tags.length > 3"
                  class="more-tags"
                >
                  +{{ draft.tags.length - 3 }}
                </span>
              </div>

              <!-- 元信息 -->
              <div class="draft-meta">
                <div class="meta-left">
                  <span class="update-time">
                    <i class="el-icon-time" />
                    {{ formatTime(draft.updatedAt) }}
                  </span>
                  <span class="word-count">
                    <i class="el-icon-document" />
                    {{ calculateWordCount(draft.content) }} 字
                  </span>
                </div>
                <div class="meta-right">
                  <el-dropdown @command="(command) => handleDraftAction(command, draft)">
                    <el-button
                      size="small"
                      type="text"
                      @click.stop
                    >
                      <i class="el-icon-more" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                          <i class="el-icon-edit" />
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item command="publish">
                          <i class="el-icon-upload" />
                          发布
                        </el-dropdown-item>
                        <el-dropdown-item command="duplicate">
                          <i class="el-icon-copy-document" />
                          复制
                        </el-dropdown-item>
                        <el-dropdown-item
                          command="delete"
                          divided
                        >
                          <i class="el-icon-delete" />
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div
          v-if="hasMore"
          class="load-more"
        >
          <el-button 
            :loading="loadingMore" 
            @click="loadMoreDrafts"
          >
            加载更多
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePost } from '@/composables/usePost';
import type { Post } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SiteErrorState from '@/components/common/SiteErrorState.vue';

// 路由
const router = useRouter();

// 组合式函数
const { getUserDrafts, deleteDraft, publishDraft, duplicateDraft } = usePost();

// 响应式状态
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');
const drafts = ref<Post[]>([]);
const hasMore = ref(true);
const currentPage = ref(1);

// 生命周期
onMounted(() => {
  loadDrafts();
});

/**
 * 加载草稿列表
 */
const loadDrafts = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await getUserDrafts(1, 20);
    drafts.value = result.items;
    hasMore.value = result.hasMore;
    currentPage.value = 1;
  } catch (err) {
    error.value = '加载草稿失败';
    console.error('加载草稿失败:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * 加载更多草稿
 */
const loadMoreDrafts = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  
  try {
    const nextPage = currentPage.value + 1;
    const result = await getUserDrafts(nextPage, 20);
    drafts.value.push(...result.items);
    hasMore.value = result.hasMore;
    currentPage.value = nextPage;
  } catch (err) {
    ElMessage.error('加载更多草稿失败');
    console.error('加载更多草稿失败:', err);
  } finally {
    loadingMore.value = false;
  }
};

/**
 * 处理重试
 */
const handleRetry = () => {
  loadDrafts();
};

/**
 * 处理创建文章
 */
const handleCreatePost = () => {
  router.push('/posts/create');
};

/**
 * 处理编辑草稿
 */
const handleEditDraft = (draftId: string) => {
  router.push(`/posts/${draftId}/edit`);
};

/**
 * 处理草稿操作
 */
const handleDraftAction = async (command: string, draft: Post) => {
  switch (command) {
    case 'edit':
      handleEditDraft(draft.id);
      break;
    case 'publish':
      await handlePublishDraft(draft);
      break;
    case 'duplicate':
      await handleDuplicateDraft(draft);
      break;
    case 'delete':
      await handleDeleteDraft(draft);
      break;
  }
};

/**
 * 处理发布草稿
 */
const handlePublishDraft = async (draft: Post) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布草稿"${draft.title || '无标题'}"吗？`,
      '确认发布',
      {
        confirmButtonText: '发布',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    const result = await publishDraft(draft.id);
    if (result) {
      ElMessage.success('草稿发布成功');
      // 从草稿列表中移除
      drafts.value = drafts.value.filter(d => d.id !== draft.id);
      // 跳转到文章详情页
      router.push(`/posts/${result.id}`);
    }
  } catch {
    // 用户取消发布
  }
};

/**
 * 处理复制草稿
 */
const handleDuplicateDraft = async (draft: Post) => {
  try {
    const result = await duplicateDraft(draft.id);
    if (result) {
      ElMessage.success('草稿复制成功');
      // 重新加载草稿列表
      loadDrafts();
    }
  } catch (error) {
    console.error('复制草稿失败:', error);
    ElMessage.error('复制草稿失败');
  }
};

/**
 * 处理删除草稿
 */
const handleDeleteDraft = async (draft: Post) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除草稿"${draft.title || '无标题'}"吗？删除后无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const success = await deleteDraft(draft.id);
    if (success) {
      ElMessage.success('草稿删除成功');
      // 从草稿列表中移除
      drafts.value = drafts.value.filter(d => d.id !== draft.id);
    }
  } catch {
    // 用户取消删除
  }
};

/**
 * 格式化时间
 */
const formatTime = (time: string): string => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  
  // 超过7天显示具体日期
  return date.toLocaleDateString();
};

/**
 * 计算字数
 */
const calculateWordCount = (content: string): number => {
  if (!content) return 0;
  
  // 移除 Markdown 标记，计算字数
  const plainText = content
    .replace(/[#*`_~[\]()]/g, '') // 移除 Markdown 符号
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`.*?`/g, '') // 移除行内代码
    .replace(/\s+/g, '') // 移除空白字符
    .trim();
  
  return plainText.length;
};
</script>

<style scoped>
.drafts-page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  padding: var(--space-lg);
}

.drafts-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 var(--space-xs) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-description {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}

.loading-container p,
.error-container p {
  margin: var(--space-md) 0;
  font-size: 1rem;
}

.error-message {
  text-align: center;
}

.error-message i {
  font-size: 3rem;
  color: var(--color-danger);
  margin-bottom: var(--space-md);
}

.drafts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.draft-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.draft-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.draft-cover {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.draft-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

.cover-placeholder i {
  font-size: 3rem;
  opacity: 0.5;
}

.draft-info {
  padding: var(--space-lg);
}

.draft-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.draft-excerpt {
  margin: 0 0 var(--space-md) 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.draft-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.draft-tag {
  margin: 0;
}

.more-tags {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  align-self: center;
}

.draft-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.meta-left {
  display: flex;
  gap: var(--space-md);
}

.update-time,
.word-count {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.meta-right {
  display: flex;
  align-items: center;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drafts-page {
    padding: var(--space-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .drafts-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .draft-cover {
    height: 120px;
  }

  .draft-info {
    padding: var(--space-md);
  }

  .draft-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .meta-left {
    gap: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .drafts-grid {
    grid-template-columns: 1fr;
  }

  .draft-cover {
    height: 100px;
  }

  .draft-title {
    font-size: 1rem;
  }

  .draft-excerpt {
    font-size: 0.8rem;
  }
}
</style>
