<!--
  认证布局组件
  用于登录、注册等认证页面的简洁布局
  不包含侧边栏，专注于认证表单
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

// 当前路由
const route = useRoute();

// 主题功能（初始化主题状态）
useTheme();

// 页面标题
const pageTitle = computed(() => {
  switch (route.name) {
    case 'login':
      return '登录';
    case 'register':
      return '注册';
    case 'forgot-password':
      return '忘记密码';
    case 'reset-password':
      return '重置密码';
    default:
      return '认证';
  }
});

// 页面描述
const pageDescription = computed(() => {
  switch (route.name) {
    case 'login':
      return '欢迎回来，请登录您的账户';
    case 'register':
      return '创建新账户，开始您的博客之旅';
    case 'forgot-password':
      return '输入您的邮箱地址，我们将发送重置链接';
    case 'reset-password':
      return '请设置您的新密码';
    default:
      return '请完成身份验证';
  }
});
</script>

<template>
  <div class="auth-layout">
    <!-- 背景装饰 -->
    <div class="auth-layout__background">
      <div class="auth-layout__background-pattern" />
    </div>
    
    <!-- 主要内容 -->
    <div class="auth-layout__container">
      <!-- 顶部导航 -->
      <header class="auth-layout__header">
        <!-- Logo -->
        <router-link 
          to="/" 
          class="auth-layout__logo"
        >
          <h1 class="auth-layout__logo-text">
            知构
          </h1>
        </router-link>
        
        <!-- 主题切换 -->
        <ThemeToggle />
      </header>
      
      <!-- 认证卡片 -->
      <main class="auth-layout__main">
        <div class="auth-layout__card">
          <!-- 卡片头部 -->
          <div class="auth-layout__card-header">
            <h2 class="auth-layout__title">
              {{ pageTitle }}
            </h2>
            <p class="auth-layout__description">
              {{ pageDescription }}
            </p>
          </div>
          
          <!-- 卡片内容 -->
          <div class="auth-layout__card-content">
            <slot />
          </div>
          
          <!-- 卡片底部 -->
          <div 
            v-if="$slots.footer"
            class="auth-layout__card-footer"
          >
            <slot name="footer" />
          </div>
        </div>
        
        <!-- 额外链接 -->
        <div 
          v-if="$slots.links"
          class="auth-layout__links"
        >
          <slot name="links" />
        </div>
      </main>
      
      <!-- 页脚 -->
      <footer class="auth-layout__footer">
        <p class="auth-layout__footer-text">
          © 2024 知构. 保留所有权利.
        </p>
        <div class="auth-layout__footer-links">
          <a
            href="#"
            class="auth-layout__footer-link"
          >隐私政策</a>
          <a
            href="#"
            class="auth-layout__footer-link"
          >服务条款</a>
          <a
            href="#"
            class="auth-layout__footer-link"
          >帮助中心</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%);
}

.auth-layout__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.auth-layout__background-pattern {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(circle at 25% 25%, var(--color-cta) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, var(--color-primary) 0%, transparent 50%);
  opacity: 0.03;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.auth-layout__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.auth-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
}

.auth-layout__logo {
  text-decoration: none;
  color: var(--color-text);
  transition: color var(--transition-base);
}

.auth-layout__logo:hover {
  color: var(--color-cta);
}

.auth-layout__logo-text {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-cta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.auth-layout__card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.auth-layout__card-header {
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  text-align: center;
  border-bottom: 1px solid var(--color-border-light);
}

.auth-layout__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-sm) 0;
}

.auth-layout__description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.auth-layout__card-content {
  padding: var(--space-xl);
}

.auth-layout__card-footer {
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
  border-top: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.auth-layout__links {
  text-align: center;
  padding: var(--space-md);
}

.auth-layout__footer {
  text-align: center;
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--color-border-light);
}

.auth-layout__footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-sm) 0;
}

.auth-layout__footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.auth-layout__footer-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-base);
}

.auth-layout__footer-link:hover {
  color: var(--color-cta);
}

/* ========== 响应式设计 ========== */

/* 移动设备 */
@media (max-width: 767px) {
  .auth-layout__container {
    max-width: 100%;
    padding: var(--space-md);
  }
  
  .auth-layout__header {
    flex-direction: column;
    gap: var(--space-md);
    text-align: center;
  }
  
  .auth-layout__logo-text {
    font-size: var(--font-size-xl);
  }
  
  .auth-layout__title {
    font-size: var(--font-size-2xl);
  }
  
  .auth-layout__card-header,
  .auth-layout__card-content,
  .auth-layout__card-footer {
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
  }
  
  .auth-layout__footer-links {
    flex-direction: column;
    gap: var(--space-sm);
  }
}

/* 小屏移动设备 */
@media (max-width: 479px) {
  .auth-layout__container {
    padding: var(--space-sm);
  }
  
  .auth-layout__card-header,
  .auth-layout__card-content,
  .auth-layout__card-footer {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }
}

/* 暗色主题特殊样式 */
[data-theme='dark'] .auth-layout__card {
  background-color: rgba(39, 39, 42, 0.8);
  border-color: var(--color-border);
}

[data-theme='dark'] .auth-layout__background-pattern {
  opacity: 0.05;
}
</style>