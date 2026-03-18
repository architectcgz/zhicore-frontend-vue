<script setup lang="ts">
import AdminUserManagementPanel from '@/components/admin/AdminUserManagementPanel.vue';
</script>

<template>
  <section class="admin-user-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          用户管理
        </h1>
        <p class="page-description">
          基于 zhicore 当前管理员用户接口，对账号状态进行查询和维护。
        </p>
      </div>
    </div>

    <AdminUserManagementPanel />
  </section>
</template>

<style scoped>
.admin-user-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-description {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
}
</style>
