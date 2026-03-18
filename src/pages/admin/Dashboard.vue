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
    description: '已按当前后端契约对齐，支持分页查询、状态筛选、禁用与启用。',
    path: '/admin/users',
    icon: User,
  },
  {
    title: '文章管理',
    description: '已打通基础查询与删除通路，后续继续做字段与交互细化。',
    path: '/admin/posts',
    icon: Document,
  },
  {
    title: '评论管理',
    description: '已保留现有页面入口，后续继续按后端 DTO 做进一步收敛。',
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
        <span class="hero-card__eyebrow">Admin Overview</span>
        <h1 class="hero-card__title">
          当前后台先以已落地接口为准
        </h1>
        <p class="hero-card__description">
          这一版管理后台不再预设聚合统计接口。优先围绕 zhicore 当前已经可用的用户、文章、评论管理员接口，逐步完成可验证纵切片。
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
  text-transform: uppercase;
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
