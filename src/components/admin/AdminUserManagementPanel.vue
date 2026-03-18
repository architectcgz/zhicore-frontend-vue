<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Refresh, Search } from '@element-plus/icons-vue';
import { useAdminUsersQuery } from '@/queries/admin/useAdminUsersQuery';
import { useDisableUserMutation } from '@/queries/admin/useDisableUserMutation';
import type { AdminUser, AdminUserStatus, PageParams } from '@/api/admin';

interface FilterFormState {
  keyword: string;
  status: '' | AdminUserStatus;
}

const filters = reactive<FilterFormState>({
  keyword: '',
  status: '',
});

const queryParams = ref<PageParams>({
  page: 1,
  size: 20,
});

const activeActionUserId = ref<string | null>(null);

const usersQuery = useAdminUsersQuery(queryParams);
const toggleUserStatusMutation = useDisableUserMutation();

const users = computed(() => usersQuery.data.value?.items ?? []);
const total = computed(() => usersQuery.data.value?.total ?? 0);
const isLoading = computed(() => usersQuery.isLoading.value || usersQuery.isFetching.value);

function buildQueryParams(overrides: Partial<PageParams> = {}): PageParams {
  return {
    ...queryParams.value,
    ...overrides,
    keyword: filters.keyword.trim() || undefined,
    status: filters.status || undefined,
  };
}

function applyFilters(overrides: Partial<PageParams> = {}) {
  queryParams.value = buildQueryParams(overrides);
}

function handleSearch() {
  applyFilters({ page: 1 });
}

function handleReset() {
  filters.keyword = '';
  filters.status = '';
  queryParams.value = {
    page: 1,
    size: queryParams.value.size ?? 20,
  };
}

function handlePageChange(page: number) {
  applyFilters({ page });
}

function handleSizeChange(size: number) {
  applyFilters({
    page: 1,
    size,
  });
}

async function handleRefresh() {
  await usersQuery.refetch();
}

async function handleToggleUserStatus(user: AdminUser, disable: boolean) {
  const actionText = disable ? '禁用' : '启用';

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户“${getDisplayName(user)}”吗？`,
      `确认${actionText}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: disable ? 'warning' : 'info',
      }
    );

    activeActionUserId.value = user.id;

    await toggleUserStatusMutation.mutateAsync({
      userId: user.id,
      disable,
    });
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  } finally {
    activeActionUserId.value = null;
  }
}

function getDisplayName(user: AdminUser): string {
  return user.nickname || user.username || `用户 ${user.id}`;
}

function getInitial(user: AdminUser): string {
  return getDisplayName(user).slice(0, 1).toUpperCase();
}

function getStatusType(status: AdminUserStatus): 'success' | 'danger' {
  return status === 'NORMAL' ? 'success' : 'danger';
}

function getStatusText(status: AdminUserStatus): string {
  return status === 'NORMAL' ? '正常' : '已禁用';
}

function normalizeRoleCode(role: string): string {
  return role.replace(/^ROLE_/, '').toUpperCase();
}

function getRoleText(role: string): string {
  const code = normalizeRoleCode(role);

  if (code === 'ADMIN') return '管理员';
  if (code === 'USER') return '普通用户';

  return code;
}

function getRoleTagType(role: string): 'warning' | 'info' {
  return normalizeRoleCode(role) === 'ADMIN' ? 'warning' : 'info';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN');
}

function isRowPending(userId: string): boolean {
  return activeActionUserId.value === userId && toggleUserStatusMutation.isPending.value;
}
</script>

<template>
  <div class="admin-user-panel">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="panel-alert"
    >
      支持按关键词和状态筛选用户，并执行启用或禁用等管理操作。
    </el-alert>

    <el-card
      class="panel-card"
      shadow="never"
    >
      <el-form
        :inline="true"
        class="panel-filters"
      >
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            clearable
            placeholder="用户名 / 昵称 / 邮箱"
            style="width: 260px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            clearable
            placeholder="全部"
            style="width: 140px"
          >
            <el-option
              label="正常"
              value="NORMAL"
            />
            <el-option
              label="已禁用"
              value="FORBIDDEN"
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
          <el-button
            :icon="Refresh"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      class="panel-card"
      shadow="never"
    >
      <el-table
        v-loading="isLoading"
        :data="users"
        stripe
      >
        <el-table-column
          label="用户信息"
          min-width="240"
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :src="row.avatar || undefined"
                :size="40"
              >
                {{ getInitial(row) }}
              </el-avatar>
              <div class="user-info__meta">
                <div class="user-info__name">
                  {{ getDisplayName(row) }}
                </div>
                <div class="user-info__sub">
                  @{{ row.username }} · ID {{ row.id }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="email"
          label="邮箱"
          min-width="220"
        />

        <el-table-column
          label="角色"
          min-width="180"
        >
          <template #default="{ row }">
            <div class="role-list">
              <el-tag
                v-for="role in row.roles"
                :key="role"
                :type="getRoleTagType(role)"
                size="small"
              >
                {{ getRoleText(role) }}
              </el-tag>
              <span
                v-if="row.roles.length === 0"
                class="role-list__empty"
              >
                未配置
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          width="120"
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
          label="注册时间"
          min-width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="140"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'NORMAL'"
              type="warning"
              size="small"
              text
              :loading="isRowPending(row.id)"
              @click="handleToggleUserStatus(row, true)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              text
              :loading="isRowPending(row.id)"
              @click="handleToggleUserStatus(row, false)"
            >
              启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="panel-pagination">
        <el-pagination
          :current-page="queryParams.page"
          :page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.admin-user-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.panel-alert,
.panel-card {
  border: 1px solid var(--color-border);
}

.panel-filters {
  row-gap: var(--space-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-info__meta {
  min-width: 0;
}

.user-info__name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-info__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.role-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-list__empty {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.panel-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

@media (max-width: 768px) {
  .panel-pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
