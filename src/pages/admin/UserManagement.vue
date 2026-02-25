<!--
  用户管理页面
  提供用户列表、搜索、筛选、禁用/启用、批量操作功能
-->

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { adminApi, type AdminUser, type PageParams } from '@/api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Delete, Lock, Unlock } from '@element-plus/icons-vue';
import type { TableColumnCtx } from 'element-plus';

// 数据状态
const loading = ref(false);
const users = ref<AdminUser[]>([]);
const total = ref(0);
const selectedUsers = ref<AdminUser[]>([]);

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
 * 加载用户列表
 */
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await adminApi.getUsers(searchParams);
    users.value = response.items;
    total.value = response.total;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  searchParams.page = 1;
  loadUsers();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchParams.keyword = '';
  searchParams.status = '';
  searchParams.page = 1;
  loadUsers();
};

/**
 * 处理分页变化
 */
const handlePageChange = (page: number) => {
  searchParams.page = page;
  loadUsers();
};

/**
 * 处理每页大小变化
 */
const handleSizeChange = (size: number) => {
  searchParams.size = size;
  searchParams.page = 1;
  loadUsers();
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
  loadUsers();
};

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: AdminUser[]) => {
  selectedUsers.value = selection;
};

/**
 * 禁用用户
 */
const handleDisableUser = async (user: AdminUser) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用用户 "${user.nickname}" 吗？`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await adminApi.disableUser(user.id);
    ElMessage.success('禁用成功');
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用用户失败:', error);
      ElMessage.error('禁用用户失败');
    }
  }
};

/**
 * 启用用户
 */
const handleEnableUser = async (user: AdminUser) => {
  try {
    await adminApi.enableUser(user.id);
    ElMessage.success('启用成功');
    loadUsers();
  } catch (error) {
    console.error('启用用户失败:', error);
    ElMessage.error('启用用户失败');
  }
};

/**
 * 批量禁用用户
 */
const handleBatchDisable = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要禁用的用户');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认批量禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const userIds = selectedUsers.value.map(user => user.id);
    await adminApi.batchDisableUsers(userIds);
    ElMessage.success('批量禁用成功');
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量禁用失败:', error);
      ElMessage.error('批量禁用失败');
    }
  }
};

/**
 * 批量启用用户
 */
const handleBatchEnable = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要启用的用户');
    return;
  }

  try {
    const userIds = selectedUsers.value.map(user => user.id);
    await adminApi.batchEnableUsers(userIds);
    ElMessage.success('批量启用成功');
    loadUsers();
  } catch (error) {
    console.error('批量启用失败:', error);
    ElMessage.error('批量启用失败');
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
const getStatusType = (status: string): 'success' | 'danger' => {
  return status === 'ACTIVE' ? 'success' : 'danger';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string): string => {
  return status === 'ACTIVE' ? '正常' : '已禁用';
};

/**
 * 获取角色标签类型
 */
const getRoleType = (role: string): 'primary' | 'warning' => {
  return role === 'ADMIN' ? 'warning' : 'primary';
};

/**
 * 获取角色文本
 */
const getRoleText = (role: string): string => {
  return role === 'ADMIN' ? '管理员' : '普通用户';
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="user-management">
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
            placeholder="用户名/昵称/邮箱"
            clearable
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
              label="正常"
              value="ACTIVE"
            />
            <el-option
              label="已禁用"
              value="DISABLED"
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
            type="warning"
            :icon="Lock"
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDisable"
          >
            批量禁用
          </el-button>
          <el-button
            type="success"
            :icon="Unlock"
            :disabled="selectedUsers.length === 0"
            @click="handleBatchEnable"
          >
            批量启用
          </el-button>
        </div>
        <div class="toolbar__right">
          <span class="toolbar__info">
            已选择 {{ selectedUsers.length }} 项
          </span>
        </div>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card
      class="table-card"
      shadow="never"
    >
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />

        <el-table-column
          label="用户信息"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :src="row.avatar"
                :size="40"
              >
                {{ row.nickname.charAt(0) }}
              </el-avatar>
              <div class="user-info__text">
                <div class="user-info__nickname">
                  {{ row.nickname }}
                </div>
                <div class="user-info__username">
                  @{{ row.username }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="email"
          label="邮箱"
          min-width="180"
        />

        <el-table-column
          label="角色"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="getRoleType(row.role)"
              size="small"
            >
              {{ getRoleText(row.role) }}
            </el-tag>
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
          prop="postsCount"
          label="文章数"
          width="100"
          sortable="custom"
        />

        <el-table-column
          prop="followersCount"
          label="粉丝数"
          width="100"
          sortable="custom"
        />

        <el-table-column
          prop="createdAt"
          label="注册时间"
          width="180"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="最后登录"
          width="180"
        >
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'ACTIVE'"
              type="warning"
              size="small"
              text
              @click="handleDisableUser(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              text
              @click="handleEnableUser(row)"
            >
              启用
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
.user-management {
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

/* ========== 用户信息 ========== */

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-info__text {
  flex: 1;
  min-width: 0;
}

.user-info__nickname {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.user-info__username {
  font-size: 12px;
  color: var(--color-text-secondary);
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
