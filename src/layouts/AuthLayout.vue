<!--
  认证布局组件
  用于登录、注册等认证页面的品牌化双栏布局
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

const route = useRoute();
useTheme();
const isTopbarDocked = ref(false);
const authFlipRoutes = new Set(['Login', 'Register', 'login', 'register']);

const isFlipRoute = computed(() => authFlipRoutes.has(String(route.name ?? '')));
const panelTransitionName = computed(() => (isFlipRoute.value ? 'auth-card-flip' : 'auth-panel-fade'));
const panelTransitionKey = computed(() => String(route.name ?? route.path));

const pageTitle = computed(() => {
  switch (route.name) {
    case 'Login':
    case 'login':
      return '登录知构';
    case 'Register':
    case 'register':
      return '创建知构账号';
    case 'forgot-password':
      return '找回账户';
    case 'reset-password':
      return '重置密码';
    default:
      return '身份认证';
  }
});

const pageDescription = computed(() => {
  switch (route.name) {
    case 'Login':
    case 'login':
      return '回到你的写作后台、草稿和关注内容。';
    case 'Register':
    case 'register':
      return '创建账号，开始发布文章、参与讨论与构建个人主页。';
    case 'forgot-password':
      return '输入邮箱地址，找回你的访问权限。';
    case 'reset-password':
      return '设置一个更安全的新密码。';
    default:
      return '完成身份验证，继续浏览与创作。';
  }
});

const featureList = computed(() => [
  '统一的内容发布与草稿管理',
  '首页主题流与趋势发现入口',
  '围绕创作者主页构建个人影响力',
]);

const updateTopbarDockedState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  isTopbarDocked.value = window.scrollY > 12;
};

onMounted(() => {
  updateTopbarDockedState();
  window.addEventListener('scroll', updateTopbarDockedState, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateTopbarDockedState);
});
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__ambient auth-layout__ambient--left" />
    <div class="auth-layout__ambient auth-layout__ambient--right" />

    <div class="auth-layout__shell">
      <header
        class="auth-layout__topbar surface-panel"
        :class="{ 'auth-layout__topbar--docked': isTopbarDocked }"
      >
        <router-link
          to="/"
          class="auth-layout__logo"
          aria-label="返回知构首页"
        >
          <span class="auth-layout__logo-mark">知</span>
          <span class="auth-layout__logo-text">知构</span>
        </router-link>

        <div class="auth-layout__theme">
          <ThemeToggle />
        </div>
      </header>

      <main class="auth-layout__main">
        <section class="auth-layout__showcase">
          <span class="auth-layout__eyebrow">知构账号</span>
          <h1 class="auth-layout__title">
            {{ pageTitle }}
          </h1>
          <p class="auth-layout__description">
            {{ pageDescription }}
          </p>

          <div class="auth-layout__feature-list">
            <div
              v-for="item in featureList"
              :key="item"
              class="auth-layout__feature-item"
            >
              <span class="auth-layout__feature-dot" />
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="auth-layout__metrics">
            <article class="auth-layout__metric-card">
              <span class="auth-layout__metric-label">内容状态</span>
              <strong class="auth-layout__metric-value">在线</strong>
              <span class="auth-layout__metric-detail">随时进入写作与阅读</span>
            </article>
            <article class="auth-layout__metric-card">
              <span class="auth-layout__metric-label">主题场域</span>
              <strong class="auth-layout__metric-value">活跃</strong>
              <span class="auth-layout__metric-detail">围绕标签与趋势发现内容</span>
            </article>
          </div>
        </section>

        <section class="auth-layout__panel">
          <Transition
            :name="panelTransitionName"
            mode="out-in"
          >
            <div
              :key="panelTransitionKey"
              class="auth-layout__panel-card"
            >
              <slot />
            </div>
          </Transition>
        </section>
      </main>

      <footer class="auth-layout__footer">
        <p class="auth-layout__footer-text">
          © 2026 知构. 保留所有权利.
        </p>
        <div class="auth-layout__footer-links">
          <a
            href="/privacy"
            class="auth-layout__footer-link"
          >隐私政策</a>
          <a
            href="/terms"
            class="auth-layout__footer-link"
          >服务条款</a>
          <a
            href="/help"
            class="auth-layout__footer-link"
          >帮助中心</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--gradient-page);
}

.auth-layout__ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(12px);
  pointer-events: none;
}

.auth-layout__ambient--left {
  top: 6%;
  left: -120px;
  width: 320px;
  height: 320px;
  background: rgba(15, 118, 98, 0.12);
}

.auth-layout__ambient--right {
  right: -100px;
  bottom: 10%;
  width: 320px;
  height: 320px;
  background: rgba(183, 121, 31, 0.14);
}

.auth-layout__shell {
  position: relative;
  z-index: 1;
  width: min(1360px, calc(100% - 40px));
  margin: 0 auto;
  padding: 0 0 24px;
}

.auth-layout__topbar,
.auth-layout__logo,
.auth-layout__feature-item,
.auth-layout__metrics,
.auth-layout__footer-links {
  display: flex;
  align-items: center;
}

.auth-layout__topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  justify-content: space-between;
  gap: var(--space-md);
  min-height: 76px;
  margin-bottom: var(--space-lg);
  padding: 14px 18px;
  border-radius: var(--radius-auth-header-shell);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-bg-secondary) 92%, transparent) 0%, color-mix(in srgb, var(--color-surface-overlay) 86%, transparent) 100%);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow-md);
  transform: translateY(18px);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
  will-change: transform;
}

.auth-layout__logo {
  gap: 12px;
}

.auth-layout__topbar--docked {
  transform: translateY(0);
}

.auth-layout__logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-auth-header-button);
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
  font-family: var(--font-brand);
  font-size: 1.3rem;
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-md);
}

.auth-layout__logo-text {
  font-family: var(--font-brand);
  font-size: 1.45rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.auth-layout__theme {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
}

.auth-layout__theme :deep(.theme-toggle__button) {
  border-radius: var(--radius-auth-header-button);
}

.auth-layout__main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 520px);
  gap: var(--space-xl);
  align-items: center;
}

.auth-layout__showcase {
  padding: var(--space-2xl) var(--space-xl) var(--space-2xl) 0;
  margin-top: -72px;
}

.auth-layout__eyebrow {
  display: inline-flex;
  margin-bottom: 16px;
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.auth-layout__title {
  max-width: 11ch;
  margin-bottom: 18px;
  color: var(--color-text);
  font-size: clamp(3rem, 5vw, 4.8rem);
  line-height: 1.02;
}

.auth-layout__description {
  max-width: 46ch;
  color: var(--color-text-secondary);
  font-size: 1.02rem;
  line-height: 1.9;
}

.auth-layout__feature-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: var(--space-xl) 0;
}

.auth-layout__feature-item {
  gap: 12px;
  color: var(--color-text);
  font-size: 0.96rem;
}

.auth-layout__feature-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--gradient-accent);
  flex-shrink: 0;
}

.auth-layout__metrics {
  gap: 14px;
}

.auth-layout__metric-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--gradient-card);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(14px);
}

.auth-layout__metric-label,
.auth-layout__metric-detail {
  color: var(--color-text-secondary);
}

.auth-layout__metric-label {
  font-size: 0.8rem;
}

.auth-layout__metric-value {
  color: var(--color-text);
  font-size: 1.4rem;
}

.auth-layout__metric-detail {
  font-size: 0.84rem;
  line-height: 1.6;
}

.auth-layout__panel {
  display: flex;
  justify-content: flex-end;
  perspective: 1400px;
  perspective-origin: center center;
}

.auth-layout__panel-card {
  width: 100%;
  display: flex;
  justify-content: inherit;
  transform-origin: center center;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.auth-card-flip-enter-active,
.auth-card-flip-leave-active {
  transition:
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 380ms ease;
}

.auth-card-flip-enter-from {
  opacity: 0;
  transform: rotateY(-86deg) scale(0.97);
}

.auth-card-flip-leave-to {
  opacity: 0;
  transform: rotateY(86deg) scale(0.97);
}

.auth-panel-fade-enter-active,
.auth-panel-fade-leave-active {
  transition:
    transform 260ms ease,
    opacity 220ms ease;
}

.auth-panel-fade-enter-from,
.auth-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.auth-layout__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.auth-layout__footer-text,
.auth-layout__footer-link {
  font-size: 0.84rem;
}

.auth-layout__footer-text {
  color: var(--color-text-tertiary);
}

.auth-layout__footer-links {
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.auth-layout__footer-link {
  color: var(--color-text-secondary);
}

.auth-layout__footer-link:hover {
  color: var(--color-cta);
}

@media (max-width: 1023px) {
  .auth-layout__shell {
    width: min(100%, calc(100% - 24px));
  }

  .auth-layout__main {
    grid-template-columns: minmax(0, 1fr);
  }

  .auth-layout__showcase {
    padding: 0;
    margin-top: -44px;
  }

  .auth-layout__panel {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  .auth-layout__shell {
    width: min(100%, calc(100% - 12px));
  }

  .auth-layout__topbar,
  .auth-layout__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-layout__topbar {
    padding: 14px;
    transform: translateY(10px);
    border-radius: var(--radius-auth-header-shell-mobile);
  }

  .auth-layout__topbar--docked {
    transform: translateY(0);
  }

  .auth-card-flip-enter-from {
    transform: rotateY(-38deg) scale(0.985);
  }

  .auth-card-flip-leave-to {
    transform: rotateY(38deg) scale(0.985);
  }

  .auth-layout__title {
    font-size: 2.5rem;
  }

  .auth-layout__showcase {
    margin-top: -28px;
  }

  .auth-layout__metrics {
    flex-direction: column;
    align-items: stretch;
  }

  .auth-layout__metric-card {
    min-width: 0;
  }

  .auth-layout__theme {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-card-flip-enter-active,
  .auth-card-flip-leave-active,
  .auth-panel-fade-enter-active,
  .auth-panel-fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
