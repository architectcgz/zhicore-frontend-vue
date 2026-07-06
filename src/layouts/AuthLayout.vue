<template>
  <div class="auth-layout" :class="{ 'auth-layout--with-nav': shouldShowNav }">
    <header v-if="shouldShowNav" class="auth-layout__header">
      <RouterLink
        class="auth-layout__brand"
        to="/"
        aria-label="返回 ZhiCore 首页"
      >
        <span class="auth-layout__brand-mark">Z</span>
        <span class="auth-layout__brand-name">ZhiCore</span>
      </RouterLink>

      <nav class="auth-layout__nav" aria-label="主导航">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/explore">Explore</RouterLink>
        <RouterLink to="/community">Communities</RouterLink>
        <RouterLink to="/resources">Resources</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>

      <div class="auth-layout__tools" aria-label="辅助操作">
        <RouterLink class="auth-layout__search" to="/search" aria-label="搜索">
          <Search aria-hidden="true" />
          <span>Search...</span>
        </RouterLink>
        <RouterLink
          class="auth-layout__icon-btn"
          to="/messages"
          aria-label="消息"
        >
          <Mail aria-hidden="true" />
        </RouterLink>
        <RouterLink
          class="auth-layout__icon-btn"
          to="/notifications"
          aria-label="通知"
        >
          <Bell aria-hidden="true" />
        </RouterLink>
        <RouterLink
          class="auth-layout__avatar"
          to="/auth/login"
          aria-label="登录"
        >
          <UserRound aria-hidden="true" />
        </RouterLink>
        <RouterLink class="auth-layout__post-btn" to="/editor">
          <Plus aria-hidden="true" />
          <span>New Post</span>
        </RouterLink>
      </div>
    </header>

    <main class="auth-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Bell, Mail, Plus, Search, UserRound } from "@lucide/vue";

const route = useRoute();

const shouldShowNav = computed(() => route.name === "Register");
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(
      115deg,
      color-mix(in srgb, var(--color-bg) 96%, transparent) 0%,
      color-mix(in srgb, var(--color-bg-elevated) 68%, transparent) 48%,
      color-mix(in srgb, var(--color-primary) 16%, var(--color-bg)) 100%
    ),
    var(--color-bg);
  color: var(--color-text);
}

.auth-layout--with-nav {
  display: grid;
  grid-template-rows: auto 1fr;
}

.auth-layout__header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) auto minmax(18rem, 1fr);
  gap: var(--space-6);
  align-items: center;
  min-height: 5.25rem;
  padding: var(--space-5) var(--space-12);
}

.auth-layout__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  justify-self: start;
  color: var(--color-text-strong);
  font-weight: 800;
  text-decoration: none;
}

.auth-layout__brand-mark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 64%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: 1.5rem;
  line-height: 1;
  text-shadow: 0 0 1rem
    color-mix(in srgb, var(--color-primary) 68%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 24%, transparent),
    0 0 1.375rem color-mix(in srgb, var(--color-primary) 34%, transparent);
}

.auth-layout__brand-name {
  font-size: 1.375rem;
  line-height: 1;
}

.auth-layout__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 650;
}

.auth-layout__nav a {
  position: relative;
  padding: var(--space-2) 0;
  color: inherit;
  text-decoration: none;
}

.auth-layout__nav a:first-child::after {
  position: absolute;
  right: 0;
  bottom: calc(var(--space-2) * -1);
  left: 0;
  height: 0.0625rem;
  background: color-mix(in srgb, var(--color-text-strong) 80%, transparent);
  content: "";
}

.auth-layout__tools {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: var(--space-4);
}

.auth-layout__search {
  display: inline-flex;
  align-items: center;
  width: min(22rem, 28vw);
  min-height: 2.875rem;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-text-strong) 9%, transparent);
  color: var(--color-text-soft);
  text-decoration: none;
}

.auth-layout__search svg {
  width: 1.125rem;
  height: 1.125rem;
}

.auth-layout__icon-btn,
.auth-layout__avatar,
.auth-layout__post-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  text-decoration: none;
  cursor: pointer;
}

.auth-layout__icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  color: var(--color-text);
}

.auth-layout__icon-btn svg,
.auth-layout__avatar svg,
.auth-layout__post-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.auth-layout__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-primary) 78%, var(--color-bg));
  color: var(--color-bg);
}

.auth-layout__post-btn {
  min-height: 2.75rem;
  gap: var(--space-2);
  padding: 0 var(--space-5);
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg);
  font-weight: 800;
}

.auth-layout__brand:focus-visible,
.auth-layout__nav a:focus-visible,
.auth-layout__search:focus-visible,
.auth-layout__icon-btn:focus-visible,
.auth-layout__avatar:focus-visible,
.auth-layout__post-btn:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.1875rem;
}

.auth-layout__main {
  min-height: 0;
}

@media (max-width: 1180px) {
  .auth-layout__header {
    grid-template-columns: 1fr auto;
    padding-inline: var(--space-8);
  }

  .auth-layout__nav {
    display: none;
  }
}

@media (max-width: 820px) {
  .auth-layout__header {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .auth-layout__tools {
    justify-self: stretch;
    justify-content: space-between;
  }

  .auth-layout__search {
    width: 100%;
  }

  .auth-layout__post-btn span {
    display: none;
  }
}

@media (max-width: 560px) {
  .auth-layout__tools {
    gap: var(--space-2);
  }

  .auth-layout__icon-btn {
    display: none;
  }
}
</style>
