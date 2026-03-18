<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  ChatLineSquare,
  Document,
  User,
} from '@element-plus/icons-vue';

const router = useRouter();

const modules = [
  {
    title: '用户管理',
    description: '查看用户状态、筛选账户，并执行启用或禁用等管理操作。',
    path: '/admin/users',
    icon: User,
  },
  {
    title: '文章管理',
    description: '管理站内文章内容，查看详情并处理不合规或无效文章。',
    path: '/admin/posts',
    icon: Document,
  },
  {
    title: '评论管理',
    description: '审核评论内容，及时处理违规、垃圾或不当互动信息。',
    path: '/admin/comments',
    icon: ChatLineSquare,
  },
];

function goToModule(path: string) {
  router.push(path);
}
</script>

<template>
  <section class="admin-dashboard">
    <el-card
      class="hero-card"
      shadow="never"
    >
      <div class="hero-card__content">
        <span class="hero-card__eyebrow">管理总览</span>
        <h1 class="hero-card__title">
          管理站内用户、文章与评论
        </h1>
        <p class="hero-card__description">
          在这里处理社区日常运营工作，维护内容质量，并保持用户互动环境稳定有序。
        </p>
        <el-button
          type="primary"
          @click="goToModule('/admin/users')"
        >
          进入用户管理
        </el-button>
      </div>
    </el-card>

    <div class="dashboard-grid">
      <el-card
        v-for="module in modules"
        :key="module.path"
        class="module-card"
        shadow="hover"
        @click="goToModule(module.path)"
      >
        <div class="module-card__icon">
          <el-icon size="22">
            <component :is="module.icon" />
          </el-icon>
        </div>
        <h2 class="module-card__title">
          {{ module.title }}
        </h2>
        <p class="module-card__description">
          {{ module.description }}
        </p>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card,
.module-card {
  border: 1px solid var(--color-border);
}

.hero-card__content {
  padding: 8px 4px;
}

.hero-card__eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-card__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
}

.hero-card__description {
  max-width: 720px;
  margin: 14px 0 20px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.module-card {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.module-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.12);
  color: var(--color-primary);
}

.module-card__title {
  margin: 0;
  font-size: 18px;
}

.module-card__description {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 960px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
