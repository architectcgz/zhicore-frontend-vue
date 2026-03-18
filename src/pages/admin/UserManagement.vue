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
          查看用户信息，筛选账号状态，并处理启用或禁用等管理操作。
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
