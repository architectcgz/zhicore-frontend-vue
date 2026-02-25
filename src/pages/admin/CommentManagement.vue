<!--
  评论管理页面
  提供评论列表、搜索、筛选、删除、批量操作功能
-->

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi, type AdminComment, type PageParams } from '@/api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete, View } from '@element-plus/icons-vue';

// 路由
const router = useRouter();

// 数据状态
const loading = ref(false);
const comments = ref<AdminComment[]>([]);
const total = ref(0);
const selectedComments = ref<AdminComment[]>([]);

// 搜索和筛选参数
const searchParams = reactive<PageParams>({
  page: 1,
  size: 20,
  keyword: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

/**
 * 加载评论列表
 */
const loadComments = async () => {
  loading.value = true;
  try {
    const response = await adminApi.getComments(searchParams);
    comments.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error('加载评论列表失败:', error);
    ElMessage.error('加载评论列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  searchParams.page = 1;
  loadComments();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchParams.keyword = '';
  searchParams.page = 1;
  loadComments();
};

/**
 * 处理分页变化
 */
const handlePageChange = (page: number) => {
  searchParams.page = page;
  loadComments();
};

/**
 * 处理每页大小变化
 */
const handleSizeChange = (size: number) => {
  searchParams.size = size;
  searchParams.page = 1;
  loadComments();
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
  loadComments();
};

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: AdminComment[]) => {
  selectedComments.value = selection;
};

/**
 * 查看文章
 */
const handleViewPost = (comment: AdminComment) => {
  router.push(`/posts/${comment.post.id}`);
};

/**
 * 删除评论
 */
const handleDeleteComment = async (comment: AdminComment) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除该评论吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await adminApi.deleteComment(comment.id);
    ElMessage.success('删除成功');
    loadComments();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error);
      ElMessage.error('删除评论失败');
    }
  }
};

/**
 * 批量删除评论
 */
const handleBatchDelete = async () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请先选择要删除的评论');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedComments.value.length} 条评论吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const commentIds = selectedComments.value.map(comment => comment.id);
    await adminApi.batchDeleteComments(commentIds);
    ElMessage.success('批量删除成功');
    loadComments();
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

/**
 * 截断文本
 */
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

onMounted(() => {
  loadComments();
});
</script>

<template>
  <div class="comment-management">
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
            placeholder="评论内容/用户/文章"
            clearable
            style="width: 280px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
            :disabled="selectedComments.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div class="toolbar__right">
          <span class="toolbar__info">
            已选择 {{ selectedComments.length }} 项
          </span>
        </div>
      </div>
    </el-card>

    <!-- 评论列表 -->
    <el-card
      class="table-card"
      shadow="never"
    >
      <el-table
        v-loading="loading"
        :data="comments"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />

        <el-table-column
          label="评论内容"
          min-width="300"
        >
          <template #default="{ row }">
            <div class="comment-content">
              {{ truncateText(row.content) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="评论者"
          width="180"
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :src="row.user.avatar"
                :size="32"
              >
                {{ row.user.nickname.charAt(0) }}
              </el-avatar>
              <span class="user-info__name">{{ row.user.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="所属文章"
          min-width="200"
        >
          <template #default="{ row }">
            <el-link
              type="primary"
              :underline="false"
              @click="handleViewPost(row)"
            >
              {{ truncateText(row.post.title, 50) }}
            </el-link>
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
          prop="repliesCount"
          label="回复"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatNumber(row.repliesCount) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="createdAt"
          label="评论时间"
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
              @click="handleDeleteComment(row)"
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
.comment-management {
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

/* ========== 评论内容 ========== */

.comment-content {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.6;
  word-break: break-word;
}

/* ========== 用户信息 ========== */

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-info__name {
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
