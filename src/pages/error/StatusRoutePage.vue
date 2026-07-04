<template>
  <section class="status-page" :aria-labelledby="titleId">
    <div class="status-page__shell">
      <header class="status-page__brand" aria-label="知构">
        <RouterLink class="status-page__brand-link" to="/">
          <span class="status-page__brand-mark">知</span>
          <span class="status-page__brand-name">知构</span>
        </RouterLink>
      </header>

      <main class="status-page__content">
        <div class="status-page__message">
          <p class="status-page__status-label">
            <component
              :is="statusView.icon"
              class="status-page__label-icon"
              aria-hidden="true"
            />
            <span>{{ statusView.label }}</span>
          </p>

          <p class="status-page__code" aria-hidden="true">
            {{ normalizedStatus }}
          </p>
          <h1 :id="titleId">{{ statusView.title }}</h1>
          <p class="status-page__description">{{ statusView.description }}</p>

          <div class="status-page__actions" aria-label="错误恢复操作">
            <RouterLink
              class="status-page__primary-action"
              :to="statusView.primaryAction.to"
            >
              <component
                :is="statusView.primaryAction.icon"
                aria-hidden="true"
              />
              <span>{{ statusView.primaryAction.label }}</span>
            </RouterLink>
            <RouterLink
              v-if="statusView.primaryAction.to !== '/'"
              class="status-page__secondary-action"
              to="/"
            >
              <Home aria-hidden="true" />
              <span>返回发现页</span>
            </RouterLink>
          </div>
        </div>

        <aside class="status-page__summary" aria-label="当前状态">
          <div class="status-page__summary-head">
            <span>状态摘要</span>
            <strong>{{ normalizedStatus }}</strong>
          </div>
          <dl class="status-page__summary-list">
            <div>
              <dt>原因</dt>
              <dd>{{ statusView.reason }}</dd>
            </div>
            <div>
              <dt>下一步</dt>
              <dd>{{ statusView.nextStep }}</dd>
            </div>
            <div>
              <dt>范围</dt>
              <dd>{{ statusView.scope }}</dd>
            </div>
          </dl>
        </aside>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  FileQuestion,
  Home,
  LockKeyhole,
  LogIn,
  ShieldAlert,
  TriangleAlert,
} from "@lucide/vue";

const props = defineProps<{
  status: number;
}>();

const normalizedStatus = computed(() =>
  Number.isFinite(props.status) ? props.status : 500,
);

interface StatusAction {
  label: string;
  to: string;
  icon: Component;
}

interface StatusView {
  label: string;
  title: string;
  description: string;
  reason: string;
  nextStep: string;
  scope: string;
  icon: Component;
  primaryAction: StatusAction;
}

const titleId = "status-page-title";

const statusView = computed<StatusView>(() => {
  if (normalizedStatus.value === 401) {
    return {
      label: "需要登录",
      title: "登录状态已失效",
      description:
        "当前会话不可用。重新登录后，可以继续访问需要身份校验的内容。",
      reason: "会话过期或凭证未通过校验",
      nextStep: "重新登录",
      scope: "仅影响需要登录的页面",
      icon: LockKeyhole,
      primaryAction: {
        label: "重新登录",
        to: "/auth/login",
        icon: LogIn,
      },
    };
  }

  if (normalizedStatus.value === 403) {
    return {
      label: "权限不足",
      title: "当前账号无法访问",
      description: "这个页面需要更高权限，或内容尚未对当前账号开放。",
      reason: "账号权限不满足访问条件",
      nextStep: "返回发现页或更换账号",
      scope: "不影响公开内容浏览",
      icon: ShieldAlert,
      primaryAction: {
        label: "更换账号登录",
        to: "/auth/login",
        icon: LogIn,
      },
    };
  }

  if (normalizedStatus.value === 404) {
    return {
      label: "未找到内容",
      title: "页面不存在",
      description:
        "这个地址没有对应的内容，可能已被移动、删除，或链接输入有误。",
      reason: "没有匹配的页面或内容资源",
      nextStep: "返回发现页继续浏览",
      scope: "当前链接不可用",
      icon: FileQuestion,
      primaryAction: {
        label: "返回发现页",
        to: "/",
        icon: Home,
      },
    };
  }

  return {
    label: "服务异常",
    title: "页面暂时不可用",
    description: "请求暂时没有完成。稍后重试，或返回发现页继续浏览其他内容。",
    reason: "页面渲染或服务请求失败",
    nextStep: "稍后重试",
    scope: "可能只影响当前页面",
    icon: TriangleAlert,
    primaryAction: {
      label: "返回发现页",
      to: "/",
      icon: Home,
    },
  };
});
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  padding: var(--space-6);
  background:
    radial-gradient(
      circle at 16% 18%,
      color-mix(in srgb, var(--color-primary) 14%, transparent),
      transparent 30%
    ),
    linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg) 62%);
  color: var(--color-text);
}

.status-page__shell {
  position: relative;
  display: grid;
  align-items: center;
  width: min(67.5rem, 100%);
  min-height: calc(100vh - var(--space-12));
  margin: 0 auto;
}

.status-page__brand {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: flex-start;
}

.status-page__brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-strong);
  text-decoration: none;
}

.status-page__brand-link:focus-visible,
.status-page__primary-action:focus-visible,
.status-page__secondary-action:focus-visible {
  outline: 0.1875rem solid
    color-mix(in srgb, var(--color-primary) 42%, transparent);
  outline-offset: 0.1875rem;
}

.status-page__brand-mark {
  display: grid;
  width: 2.375rem;
  height: 2.375rem;
  place-items: center;
  border-radius: var(--radius-lg);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 800;
  line-height: 1;
}

.status-page__brand-name {
  font-size: 1.125rem;
  font-weight: 760;
}

.status-page__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17.5rem, 22.5rem);
  gap: var(--space-8);
  align-items: end;
}

.status-page__message {
  min-width: 0;
}

.status-page__status-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-5);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-panel-soft);
  color: var(--color-text-soft);
  font-size: 0.875rem;
  font-weight: 680;
}

.status-page__label-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  color: var(--color-primary);
}

.status-page__code {
  margin: 0;
  color: color-mix(in srgb, var(--color-primary) 16%, transparent);
  font-size: 8rem;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 0.86;
}

.status-page h1 {
  max-width: 45rem;
  margin: var(--space-5) 0 0;
  color: var(--color-text-strong);
  font-size: 2.25rem;
  line-height: 1.18;
  text-wrap: balance;
}

.status-page__description {
  max-width: 58ch;
  margin: var(--space-4) 0 0;
  color: var(--color-text-soft);
  font-size: 1rem;
  line-height: 1.75;
  text-wrap: pretty;
}

.status-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-8);
}

.status-page__primary-action,
.status-page__secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.625rem;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.status-page__primary-action svg,
.status-page__secondary-action svg {
  width: 1.0625rem;
  height: 1.0625rem;
}

.status-page__primary-action {
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
}

.status-page__secondary-action {
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text);
}

.status-page__primary-action:hover,
.status-page__secondary-action:hover {
  transform: translateY(-0.0625rem);
}

.status-page__secondary-action:hover {
  border-color: var(--color-border-strong);
  background: var(--color-bg-elevated);
}

.status-page__summary {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-panel);
}

.status-page__summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.status-page__summary-head span {
  color: var(--color-text-soft);
  font-size: 0.875rem;
  font-weight: 700;
}

.status-page__summary-head strong {
  color: var(--color-primary);
  font-size: 1.5rem;
  line-height: 1;
}

.status-page__summary-list {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-5) 0 0;
}

.status-page__summary-list div {
  display: grid;
  gap: var(--space-1);
}

.status-page__summary-list dt {
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 700;
}

.status-page__summary-list dd {
  margin: 0;
  color: var(--color-text);
  line-height: 1.65;
}

@media (max-width: 820px) {
  .status-page__content {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

@media (max-width: 560px) {
  .status-page {
    padding: var(--space-4);
  }

  .status-page__shell {
    min-height: calc(100vh - var(--space-8));
  }

  .status-page__code {
    font-size: 5.75rem;
  }

  .status-page h1 {
    font-size: 1.75rem;
  }

  .status-page__actions,
  .status-page__primary-action,
  .status-page__secondary-action {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-page__primary-action,
  .status-page__secondary-action {
    transition: none;
  }

  .status-page__primary-action:hover,
  .status-page__secondary-action:hover {
    transform: none;
  }
}
</style>
