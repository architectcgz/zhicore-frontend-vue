<!--
  文章管理页面
  提供文章列表、搜索、筛选、删除、批量操作功能
-->

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, type AdminPost, type PageParams } from '@/api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete, View } from '@element-plus/icons-vue';

// 路由
const router = useRouter();

// 数据状态
const loading = ref(false);
const posts = ref<AdminPost[]>([]);
const total = ref(0);
const selectedPosts = ref<AdminPost[]>([]);

// 搜索和筛选参数
const searchParams = reactive<PageParams>({
  page: 1,
  size: 20,
  keyword: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

/**
 * 加载文章列表
 */
const loadPosts = async () => {
  loading.value = true;
  try {
    const response = await adminApi.getPosts(searchParams);
    posts.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error('加载文章列表失败:', error);
    ElMessage.error('加载文章列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  searchParams.page = 1;
  loadPosts();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchParams.keyword = '';
  searchParams.status = '';
  searchParams.page = 1;
  loadPosts();
};

/**
 * 处理分页变化
 */
const handlePageChange = (page: number) => {
  searchParams.page = page;
  loadPosts();
};

/**
 * 处理每页大小变化
 */
const handleSizeChange = (size: number) => {
  searchParams.size = size;
  searchParams.page = 1;
  loadPosts();
};

/**
 * 处理排序变化
 */
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (order) {
    searchParams.sortBy = prop;
    searchParams.sortOrder = order === 'ascending' ? 'asc' : 'desc';
  } else {
    searchParams.sortBy = 'createdAt';
    searchParams.sortOrder = 'desc';
  }
  loadPosts();
};

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: AdminPost[]) => {
  selectedPosts.value = selection;
};

/**
 * 查看文章
 */
const handleViewPost = (post: AdminPost) => {
  router.push(`/posts/${post.id}`);
};

/**
 * 删除文章
 */
const handleDeletePost = async (post: AdminPost) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章 "${post.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await adminApi.deletePost(post.id);
    ElMessage.success('删除成功');
    loadPosts();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error);
      ElMessage.error('删除文章失败');
    }
  }
};

/**
 * 批量删除文章
 */
const handleBatchDelete = async () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要删除的文章');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedPosts.value.length} 篇文章吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const postIds = selectedPosts.value.map(post => post.id);
    await adminApi.batchDeletePosts(postIds);
    ElMessage.success('批量删除成功');
    loadPosts();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

/**
 * 格式化日期
 */
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN');
};

/**
 * 获取状态标签类型
 */
const getStatusType = (status: string): 'info' | 'success' | 'warning' => {
  const types: Record<string, 'info' | 'success' | 'warning'> = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    ARCHIVED: 'warning',
  };
  return types[status] || 'info';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
  };
  return texts[status] || status;
};

/**
 * 格式化数字
 */
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="post-management">
    <!-- 搜索和筛选 -->
    <el-card
      class="search-card"
      shadow="never"
    >
      <el-form
        :inline="true"
        :model="searchParams"
      >
        <el-form-item label="关键词">
          <el-input
            v-model="searchParams.keyword"
            placeholder="文章标题/作者"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              label="草稿"
              value="DRAFT"
            />
            <el-option
              label="已发布"
              value="PUBLISHED"
            />
            <el-option
              label="已归档"
              value="ARCHIVED"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleReset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量操作 -->
    <el-card
      class="toolbar-card"
      shadow="never"
    >
      <div class="toolbar">
        <div class="toolbar__left">
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedPosts.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div class="toolbar__right">
          <span class="toolbar__info">
            已选择 {{ selectedPosts.length }} 项
          </span>
        </div>
      </div>
    </el-card>

    <!-- 文章列表 -->
    <el-card
      class="table-card"
      shadow="never"
    >
      <el-table
        v-loading="loading"
        :data="posts"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />

        <el-table-column
          label="文章标题"
          min-width="300"
        >
          <template #default="{ row }">
            <div class="post-title">
              <el-link
                type="primary"
                :underline="false"
                @click="handleViewPost(row)"
              >
                {{ row.title }}
              </el-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="作者"
          width="180"
        >
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar
                :src="row.author.avatar"
                :size="32"
              >
                {{ row.author.nickname.charAt(0) }}
              </el-avatar>
              <span class="author-info__name">{{ row.author.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="viewCount"
          label="浏览"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.viewCount) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="likeCount"
          label="点赞"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.likeCount) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="commentCount"
          label="评论"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.commentCount) }}
          </template>
        </el-table-column>

        <el-table-column
          label="发布时间"
          width="180"
        >
          <template #default="{ row }">
            {{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              text
              :icon="View"
              @click="handleViewPost(row)"
            >
              查看
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              :icon="Delete"
              @click="handleDeletePost(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchParams.page"
          v-model:page-size="searchParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.search-card,
.toolbar-card,
.table-card {
  border: 1px solid var(--color-border);
}

/* ========== 工具栏 ========== */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar__left {
  display: flex;
  gap: var(--space-sm);
}

.toolbar__info {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* ========== 文章标题 ========== */

.post-title {
  font-size: 14px;
  font-weight: 500;
}

/* ========== 作者信息 ========== */

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.author-info__name {
  font-size: 14px;
  color: var(--color-text);
}

/* ========== 分页 ========== */

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

/* ========== 响应式设计 ========== */

@media (max-width: 767px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }

  .toolbar__left {
    flex-direction: column;
  }

  .toolbar__right {
    text-align: center;
  }

  .pagination {
    justify-content: center;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
