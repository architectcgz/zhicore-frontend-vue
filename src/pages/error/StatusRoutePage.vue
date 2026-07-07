<template>
  <section class="status-page" :aria-labelledby="titleId">
    <div class="status-page__backdrop" aria-hidden="true"></div>

    <main class="status-page__content">
      <div class="status-page__message">
        <p class="status-page__code" aria-hidden="true">
          {{ statusView.statusCode }}
        </p>
        <h1 :id="titleId">{{ statusView.title }}</h1>
        <p class="status-page__description">{{ statusView.description }}</p>

        <div class="status-page__actions" aria-label="错误恢复操作">
          <RouterLink
            class="status-page__primary-action"
            :to="statusView.primaryActionTo"
          >
            {{ statusView.primaryActionLabel }}
          </RouterLink>
          <RouterLink class="status-page__secondary-action" to="/explore">
            探索内容
          </RouterLink>
        </div>
      </div>

      <aside class="status-page__summary" aria-label="状态摘要">
        <h2>状态摘要</h2>
        <dl class="status-page__summary-list">
          <div>
            <dt>状态码</dt>
            <dd>{{ statusView.statusCode }}</dd>
          </div>
          <div>
            <dt>错误类型</dt>
            <dd>{{ statusView.errorType }}</dd>
          </div>
          <div>
            <dt>记录状态</dt>
            <dd>{{ statusView.recordState }}</dd>
          </div>
          <div>
            <dt>支持信息</dt>
            <dd>{{ statusView.supportInfo }}</dd>
          </div>
        </dl>
        <div class="status-page__artifact" aria-hidden="true">
          <component :is="statusView.icon" />
        </div>
      </aside>
    </main>

    <footer class="status-page__footer">
      <p>{{ statusView.footer }}</p>
      <nav class="status-page__quick-links" aria-label="推荐入口">
        <RouterLink to="/explore">
          <SearchCheck aria-hidden="true" />
          <span>探索内容</span>
        </RouterLink>
        <RouterLink to="/community">
          <UsersRound aria-hidden="true" />
          <span>热门社区</span>
        </RouterLink>
        <RouterLink to="/auth/login">
          <UserRound aria-hidden="true" />
          <span>登录账号</span>
        </RouterLink>
      </nav>
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  FileQuestion,
  LockKeyhole,
  SearchCheck,
  ServerCrash,
  ShieldX,
  UserRound,
  UsersRound,
} from "@lucide/vue";

const props = defineProps<{
  status: number;
}>();

interface StatusView {
  statusCode: 401 | 403 | 404 | 500;
  title: string;
  description: string;
  errorType: string;
  footer: string;
  recordState: string;
  supportInfo: string;
  primaryActionLabel: string;
  primaryActionTo: string;
  icon: Component;
}

const titleId = "status-page-title";
const unavailableMetadata = "暂未提供";

const normalizedStatus = computed<401 | 403 | 404 | 500>(() => {
  if (props.status === 401 || props.status === 403 || props.status === 404) {
    return props.status;
  }

  return 500;
});

const statusView = computed<StatusView>(() => {
  if (normalizedStatus.value === 401) {
    return {
      statusCode: 401,
      title: "未授权访问",
      description: "抱歉，你需要登录后才能访问此页面。",
      errorType: "Unauthorized",
      footer: "你也可以先去搜索内容，或登录后重试。",
      recordState: unavailableMetadata,
      supportInfo: "登录后重试访问",
      primaryActionLabel: "去登录",
      primaryActionTo: "/auth/login",
      icon: LockKeyhole,
    };
  }

  if (normalizedStatus.value === 403) {
    return {
      statusCode: 403,
      title: "禁止访问",
      description: "抱歉，你没有权限访问此页面或执行此操作。",
      errorType: "Forbidden",
      footer: "你可以返回上一页，或探索更多公开内容。",
      recordState: unavailableMetadata,
      supportInfo: "确认账号权限",
      primaryActionLabel: "返回首页",
      primaryActionTo: "/",
      icon: ShieldX,
    };
  }

  if (normalizedStatus.value === 404) {
    return {
      statusCode: 404,
      title: "页面未找到",
      description: "抱歉，你访问的页面可能已被移动、删除或暂时不可用。",
      errorType: "Not Found",
      footer: "你也可以尝试搜索或浏览以下内容，或许能找到你需要的信息。",
      recordState: unavailableMetadata,
      supportInfo: "检查链接地址",
      primaryActionLabel: "返回首页",
      primaryActionTo: "/",
      icon: FileQuestion,
    };
  }

  return {
    statusCode: 500,
    title: "服务器错误",
    description: "抱歉，服务器遇到了问题，请稍后再试。",
    errorType: "Internal Server Error",
    footer: "如果问题持续存在，请稍后重试或联系维护者。你也可以先返回首页。",
    recordState: unavailableMetadata,
    supportInfo: "稍后重试",
    primaryActionLabel: "返回首页",
    primaryActionTo: "/",
    icon: ServerCrash,
  };
});
</script>

<style scoped>
.status-page {
  position: relative;
  min-height: calc(100vh - 4rem);
  padding: var(--space-6);
  overflow: hidden;
  color: var(--color-text);
  isolation: isolate;
}

.status-page__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(
      120deg,
      color-mix(in srgb, var(--color-bg) 98%, transparent) 0%,
      color-mix(in srgb, var(--color-bg) 90%, var(--color-primary)) 52%,
      color-mix(in srgb, var(--color-primary) 18%, var(--color-bg)) 100%
    ),
    var(--color-bg);
}

.status-page__backdrop::before,
.status-page__backdrop::after {
  position: absolute;
  inset: -18%;
  background-repeat: no-repeat;
  content: "";
  opacity: 0.78;
}

.status-page__backdrop::before {
  background:
    radial-gradient(
      ellipse at 17% 78%,
      color-mix(in srgb, var(--color-primary) 32%, transparent) 0%,
      transparent 26%
    ),
    radial-gradient(
      ellipse at 82% 42%,
      color-mix(in srgb, var(--color-primary) 40%, transparent) 0%,
      transparent 30%
    );
  filter: blur(0.625rem);
}

.status-page__backdrop::after {
  background:
    linear-gradient(
      20deg,
      transparent 10%,
      color-mix(in srgb, var(--color-primary) 14%, transparent) 34%,
      color-mix(in srgb, var(--color-primary) 34%, transparent) 46%,
      transparent 64%
    ),
    linear-gradient(
      150deg,
      transparent 40%,
      color-mix(in srgb, var(--color-primary) 22%, transparent) 62%,
      transparent 82%
    );
  filter: blur(0.25rem);
}

.status-page__quick-links svg {
  width: 1rem;
  height: 1rem;
}

.status-page__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
  gap: clamp(var(--space-8), 8vw, 7rem);
  align-items: center;
  width: min(74rem, 100%);
  min-height: calc(100vh - 15rem);
  margin: 0 auto;
  padding: var(--space-10) 0;
}

.status-page__message {
  min-width: 0;
}

.status-page__code {
  margin: 0;
  color: var(--color-primary);
  font-size: 6.75rem;
  font-weight: 850;
  line-height: 0.86;
  text-shadow: 0 0 1.75rem
    color-mix(in srgb, var(--color-primary) 58%, transparent);
}

.status-page h1 {
  margin: var(--space-6) 0 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: 850;
  line-height: 1.18;
}

.status-page__description {
  max-width: 36rem;
  margin: var(--space-4) 0 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.75;
}

.status-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.status-page__primary-action,
.status-page__secondary-action,
.status-page__quick-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 800;
  text-decoration: none;
}

.status-page__primary-action,
.status-page__secondary-action {
  min-width: 8.75rem;
  padding: 0 var(--space-6);
}

.status-page__primary-action {
  background: var(--color-primary);
  color: var(--color-bg);
  box-shadow: 0 0 1.375rem
    color-mix(in srgb, var(--color-primary) 32%, transparent);
}

.status-page__secondary-action {
  border: 1px solid color-mix(in srgb, var(--color-primary) 48%, transparent);
  background: color-mix(in srgb, var(--color-bg-elevated) 50%, transparent);
  color: var(--color-text-strong);
}

.status-page__summary {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-6);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  border-radius: var(--radius-lg);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-bg) 70%, transparent),
    color-mix(in srgb, var(--color-bg-elevated) 48%, transparent)
  );
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(1.125rem);
  -webkit-backdrop-filter: blur(1.125rem);
}

.status-page__summary h2 {
  margin: 0;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.status-page__summary-list {
  display: grid;
  margin: 0;
}

.status-page__summary-list div {
  display: grid;
  grid-template-columns: minmax(5rem, auto) minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.status-page__summary-list dt {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.status-page__summary-list dd {
  min-width: 0;
  margin: 0;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 750;
  overflow-wrap: anywhere;
  text-align: right;
}

.status-page__artifact {
  display: grid;
  min-height: 7rem;
  place-items: center;
  color: var(--color-primary);
}

.status-page__artifact svg {
  width: 4rem;
  height: 4rem;
  filter: drop-shadow(
    0 0 1rem color-mix(in srgb, var(--color-primary) 48%, transparent)
  );
  opacity: 0.84;
}

.status-page__footer {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  color: var(--color-text);
  font-size: 0.875rem;
  text-align: center;
}

.status-page__footer p {
  margin: 0;
}

.status-page__quick-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
}

.status-page__quick-links a {
  min-width: 8.5rem;
  gap: var(--space-2);
  padding: 0 var(--space-5);
  border: 1px solid color-mix(in srgb, var(--color-primary) 36%, transparent);
  background: color-mix(in srgb, var(--color-bg-elevated) 44%, transparent);
  color: var(--color-primary);
}

.status-page__primary-action:focus-visible,
.status-page__secondary-action:focus-visible,
.status-page__quick-links a:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.1875rem;
}

@media (max-width: 920px) {
  .status-page__content {
    grid-template-columns: 1fr;
    gap: var(--space-8);
    min-height: auto;
    padding: var(--space-10) 0 var(--space-8);
  }
}

@media (max-width: 560px) {
  .status-page {
    padding: var(--space-4);
  }

  .status-page__code {
    font-size: 5rem;
  }

  .status-page h1 {
    font-size: 1.75rem;
  }

  .status-page__actions,
  .status-page__primary-action,
  .status-page__secondary-action,
  .status-page__quick-links,
  .status-page__quick-links a {
    width: 100%;
  }

  .status-page__summary {
    padding: var(--space-5);
  }
}
</style>
