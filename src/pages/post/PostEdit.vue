<!--
  文章编辑页面
  提供文章编辑器界面，支持 Markdown 编辑、标签选择、分类选择等功能
-->
<template>
  <div class="post-edit-page">
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <LoadingSpinner size="large" />
      <p>正在加载文章...</p>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="error"
      class="error-container"
    >
      <div class="error-message">
        <i class="el-icon-warning" />
        <p>{{ error }}</p>
        <el-button @click="handleRetry">
          重试
        </el-button>
      </div>
    </div>

    <!-- 编辑器界面 -->
    <div
      v-else-if="post"
      class="editor-interface"
    >
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            编辑文章
          </h1>
          <div class="post-status">
            <el-tag :type="post.status === 'PUBLISHED' ? 'success' : 'info'">
              {{ post.status === 'PUBLISHED' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
          <div
            v-if="autoSave.lastSaveTime.value"
            class="auto-save-info"
          >
            <span class="save-status">
              <i class="el-icon-check" />
              上次保存: {{ formatSaveTime(autoSave.lastSaveTime.value) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            :loading="saving" 
            @click="handleSaveDraft"
          >
            保存草稿
          </el-button>
          <el-button 
            v-if="post.status === 'DRAFT'"
            type="primary" 
            :loading="saving" 
            @click="handlePublish"
          >
            发布文章
          </el-button>
          <el-button 
            v-else
            type="primary" 
            :loading="saving" 
            @click="handleUpdate"
          >
            更新文章
          </el-button>
          <el-dropdown @command="handleMenuCommand">
            <el-button>
              更多操作
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="preview">
                  <i class="el-icon-view" />
                  预览文章
                </el-dropdown-item>
                <el-dropdown-item
                  command="delete"
                  divided
                >
                  <i class="el-icon-delete" />
                  删除文章
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 编辑器主体 -->
      <div class="editor-container">
        <!-- 左侧编辑区 -->
        <div class="editor-panel">
          <!-- 文章标题 -->
          <div class="title-section">
            <el-input
              v-model="editorState.title"
              placeholder="请输入文章标题..."
              size="large"
              class="title-input"
              maxlength="100"
              show-word-limit
              @input="handleContentChange"
            />
          </div>

          <!-- 文章元信息 -->
          <div class="meta-section">
            <div class="meta-row">
              <!-- 标签选择器 -->
              <div class="meta-item">
                <label class="meta-label">标签</label>
                <el-select
                  v-model="editorState.tags"
                  multiple
                  filterable
                  remote
                  reserve-keyword
                  placeholder="搜索或选择标签"
                  :remote-method="handleTagSearch"
                  :loading="tagSearch.loading.value"
                  class="tag-selector"
                  @change="handleContentChange"
                >
                  <el-option
                    v-for="tag in tagSearch.suggestions.value"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </div>

              <!-- 分类选择器 -->
              <div class="meta-item">
                <label class="meta-label">分类</label>
                <el-select
                  v-model="editorState.categoryId"
                  placeholder="选择分类"
                  clearable
                  class="category-selector"
                  @change="handleContentChange"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </div>
            </div>

            <!-- 封面图上传 -->
            <div class="meta-row">
              <div class="meta-item cover-upload">
                <label class="meta-label">封面图</label>
                <div class="cover-upload-area">
                  <el-upload
                    v-if="!editorState.coverImage"
                    class="cover-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="handleCoverUpload"
                    accept="image/*"
                  >
                    <div class="upload-placeholder">
                      <i class="el-icon-plus" />
                      <div class="upload-text">
                        上传封面图
                      </div>
                    </div>
                  </el-upload>
                  <div
                    v-else
                    class="cover-preview"
                  >
                    <img
                      :src="editorState.coverImage"
                      alt="封面图"
                    >
                    <div class="cover-actions">
                      <el-button
                        size="small"
                        @click="handleCoverChange"
                      >
                        更换
                      </el-button>
                      <el-button
                        size="small"
                        type="danger"
                        @click="handleCoverRemove"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Markdown 编辑器 -->
          <div class="editor-section">
            <PostEditor
              v-model:content="editorState.content"
              :upload-image="handleImageUpload"
              @change="handleContentChange"
            />
          </div>
        </div>

        <!-- 右侧预览区 -->
        <div class="preview-panel">
          <div class="preview-header">
            <h3>预览</h3>
            <el-button
              size="small"
              @click="togglePreview"
            >
              {{ showPreview ? '隐藏预览' : '显示预览' }}
            </el-button>
          </div>
          <div
            v-if="showPreview"
            class="preview-content"
          >
            <div class="preview-title">
              {{ editorState.title || '无标题' }}
            </div>
            <div class="preview-meta">
              <div
                v-if="editorState.tags.length"
                class="preview-tags"
              >
                <el-tag
                  v-for="tag in editorState.tags"
                  :key="tag"
                  size="small"
                  class="preview-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="preview-body">
              <MarkdownPreview :content="editorState.content" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePost, useTagSearch, useAutoSave, type PostEditorState } from '@/composables/usePost';
import type { Category } from '@/types';
import PostEditor from '@/components/post/PostEditor.vue';
import MarkdownPreview from '@/components/post/MarkdownPreview.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// 路由
const router = useRouter();
const route = useRoute();

// 获取文章 ID
const postId = ref(route.params.id as string);

// 组合式函数
const postComposable = usePost(postId);
const { 
  post, 
  isLoading: loading, 
  error, 
  isSaving: saving, 
  updatePost, 
  deletePost, 
  updateDraft,
  publishDraft, 
  uploadImage,
  refetch
} = postComposable;
const tagSearch = useTagSearch();

// 响应式状态
const editorState = reactive<PostEditorState>({
  title: '',
  content: '',
  excerpt: '',
  tags: [],
  categoryId: undefined,
  status: 'DRAFT',
});

const showPreview = ref(true);
const categories = ref<Category[]>([]);
const uploadingCover = ref(false);
const hasUnsavedChanges = ref(false);

// 自动保存功能
const autoSave = useAutoSave(async () => {
  if (!hasUnsavedChanges.value) {
    return; // 没有未保存的更改
  }
  
  if (post.value) {
    await updateDraft.mutateAsync({
      draftId: post.value.id,
      postData: {
        title: editorState.title,
        content: editorState.content,
        excerpt: generateExcerpt(editorState.content),
        coverImageId: editorState.coverImageId, // 传递 fileId 给后端
        tags: editorState.tags,
        categoryId: editorState.categoryId,
      }
    });
    hasUnsavedChanges.value = false;
  }
}, {
  interval: 30000, // 30秒自动保存
  debounceDelay: 2000, // 2秒防抖
  showSuccessMessage: false, // 不显示成功提示，避免打扰用户
  showErrorMessage: true, // 显示错误提示
});

// 生命周期
onMounted(async () => {
  // TanStack Query 会自动获取文章详情
  
  // 获取热门标签
  tagSearch.fetchHotTags();
  
  // 开始自动保存
  autoSave.startAutoSave();
  
  // 页面离开前提醒
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  // 停止自动保存
  autoSave.stopAutoSave();
  
  // 移除事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// 监听文章数据变化，初始化编辑器状态
watch(post, (newPost) => {
  if (newPost) {
    editorState.title = newPost.title;
    editorState.content = newPost.content;
    editorState.excerpt = newPost.excerpt;
    editorState.coverImage = newPost.coverImage;
    editorState.tags = newPost.tags.map(tag => tag.name);
    editorState.categoryId = newPost.categoryId;
    editorState.status = newPost.status;
    hasUnsavedChanges.value = false;
  }
}, { immediate: true });

/**
 * 处理重试
 */
const handleRetry = () => {
  refetch();
};

/**
 * 处理内容变化
 */
const handleContentChange = () => {
  hasUnsavedChanges.value = true;
  // 触发防抖保存
  autoSave.triggerDebouncedSave();
};

/**
 * 处理标签搜索
 */
const handleTagSearch = (query: string) => {
  tagSearch.searchTagSuggestions(query);
};

/**
 * 处理封面图上传
 */
const handleCoverUpload = async (file: File): Promise<boolean> => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }

  // 验证文件大小 (5MB)
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB');
    return false;
  }

  uploadingCover.value = true;
  try {
    const result = await uploadImage(file);
    if (result) {
      editorState.coverImage = result.url; // 用于显示
      editorState.coverImageId = result.fileId; // 用于提交给后端
      handleContentChange();
    }
  } finally {
    uploadingCover.value = false;
  }

  return false; // 阻止默认上传行为
};

/**
 * 处理封面图更换
 */
const handleCoverChange = () => {
  // 触发文件选择
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };
  input.click();
};

/**
 * 处理封面图删除
 */
const handleCoverRemove = () => {
  editorState.coverImage = undefined;
  editorState.coverImageId = undefined;
  handleContentChange();
};

/**
 * 处理图片上传（编辑器内）
 */
const handleImageUpload = async (file: File): Promise<string | null> => {
  const result = await uploadImage(file);
  return result?.url || null;
};

/**
 * 处理保存草稿
 */
const handleSaveDraft = async () => {
  if (!editorState.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return;
  }

  if (!post.value) return;

  const result = await updateDraft.mutateAsync({
    draftId: post.value.id,
    postData: {
      title: editorState.title,
      content: editorState.content,
      excerpt: generateExcerpt(editorState.content),
      coverImageId: editorState.coverImageId, // 传递 fileId 给后端
      tags: editorState.tags,
      categoryId: editorState.categoryId,
    }
  });

  if (result) {
    hasUnsavedChanges.value = false;
  }
};

/**
 * 处理发布文章
 */
const handlePublish = async () => {
  if (!editorState.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return;
  }

  if (!editorState.content.trim()) {
    ElMessage.warning('请输入文章内容');
    return;
  }

  if (!post.value) return;

  // 如果是草稿，先更新内容再发布
  if (post.value.status === 'DRAFT') {
    const updateResult = await updateDraft.mutateAsync({
      draftId: post.value.id,
      postData: {
        title: editorState.title,
        content: editorState.content,
        excerpt: generateExcerpt(editorState.content),
        coverImageId: editorState.coverImageId, // 传递 fileId 给后端
        tags: editorState.tags,
        categoryId: editorState.categoryId,
      }
    });

    if (updateResult) {
      const publishResult = await publishDraft.mutateAsync(post.value.id);
      if (publishResult) {
        hasUnsavedChanges.value = false;
        // 发布成功后跳转到文章详情页
        router.push(`/posts/${publishResult.id}`);
      }
    }
  }
};

/**
 * 处理更新文章
 */
const handleUpdate = async () => {
  if (!editorState.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return;
  }

  if (!editorState.content.trim()) {
    ElMessage.warning('请输入文章内容');
    return;
  }

  if (!post.value) return;

  const result = await updatePost.mutateAsync({
    postId: post.value.id,
    postData: {
      title: editorState.title,
      content: editorState.content,
      excerpt: generateExcerpt(editorState.content),
      coverImageId: editorState.coverImageId, // 传递 fileId 给后端
      tags: editorState.tags,
      categoryId: editorState.categoryId,
      status: 'PUBLISHED',
    }
  });

  if (result) {
    hasUnsavedChanges.value = false;
  }
};

/**
 * 处理菜单命令
 */
const handleMenuCommand = async (command: string) => {
  switch (command) {
    case 'preview':
      if (post.value) {
        window.open(`/posts/${post.value.id}`, '_blank');
      }
      break;
    case 'delete':
      await handleDelete();
      break;
  }
};

/**
 * 处理删除文章
 */
const handleDelete = async () => {
  if (!post.value) return;

  try {
    await ElMessageBox.confirm(
      '确定要删除这篇文章吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deletePost.mutateAsync(post.value.id);
    // 删除成功后跳转到首页
    router.push('/');
  } catch {
    // 用户取消删除
  }
};

/**
 * 切换预览显示
 */
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

/**
 * 生成文章摘要
 */
const generateExcerpt = (content: string): string => {
  // 移除 Markdown 标记，提取纯文本
  const plainText = content
    .replace(/[#*`_~\[\]()]/g, '') // 移除 Markdown 符号
    .replace(/\n+/g, ' ') // 替换换行为空格
    .trim();
  
  // 截取前 200 个字符作为摘要
  return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
};

/**
 * 格式化保存时间
 */
const formatSaveTime = (time: Date): string => {
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  
  if (diff < 60000) { // 1分钟内
    return '刚刚';
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`;
  } else {
    return time.toLocaleTimeString();
  }
};

/**
 * 页面离开前提醒
 */
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault();
    e.returnValue = '您有未保存的内容，确定要离开吗？';
  }
};
</script>

<style scoped>
.post-edit-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

.editor-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.post-status {
  display: flex;
  align-items: center;
}

.auto-save-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.save-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  overflow-y: auto;
}

.title-section {
  margin-bottom: var(--space-lg);
}

.title-input {
  font-size: 1.25rem;
  font-weight: 600;
}

.title-input :deep(.el-input__inner) {
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  box-shadow: none;
  padding: var(--space-md) 0;
}

.title-input :deep(.el-input__inner):focus {
  border-bottom: 2px solid var(--color-primary);
}

.meta-section {
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
}

.meta-row {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-item {
  flex: 1;
}

.meta-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.tag-selector,
.category-selector {
  width: 100%;
}

.cover-upload {
  flex: none;
  width: 100%;
}

.cover-upload-area {
  width: 100%;
}

.cover-uploader {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--color-primary);
}

.upload-placeholder i {
  font-size: 2rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.upload-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  display: flex;
  gap: var(--space-xs);
}

.editor-section {
  flex: 1;
  min-height: 400px;
}

.preview-panel {
  width: 50%;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.preview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.preview-content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.preview-meta {
  margin-bottom: var(--space-lg);
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.preview-tag {
  margin: 0;
}

.preview-body {
  color: var(--color-text-primary);
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  .preview-panel {
    width: 100%;
    height: 50%;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
  
  .meta-row {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .header-actions {
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>