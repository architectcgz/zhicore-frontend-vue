<template>
  <aside class="messages-route__utility-nav" aria-label="消息功能">
    <RouterLink
      class="messages-route__utility-item messages-route__utility-item--active"
      to="/messages"
      aria-label="消息"
    >
      <MessageCircle aria-hidden="true" />
      <span>消息</span>
    </RouterLink>
    <RouterLink
      class="messages-route__utility-item"
      to="/explore"
      aria-label="探索"
    >
      <Search aria-hidden="true" />
      <span>探索</span>
    </RouterLink>
    <RouterLink
      class="messages-route__utility-item"
      to="/community"
      aria-label="社区"
    >
      <Users aria-hidden="true" />
      <span>社区</span>
    </RouterLink>
    <button class="messages-route__utility-item" type="button" disabled>
      <Star aria-hidden="true" />
      <span>收藏</span>
    </button>
    <RouterLink
      class="messages-route__utility-item"
      to="/notifications"
      aria-label="通知"
    >
      <Bell aria-hidden="true" />
      <span>通知</span>
    </RouterLink>
    <RouterLink
      class="messages-route__utility-item"
      to="/user/profile"
      aria-label="设置"
    >
      <Settings aria-hidden="true" />
      <span>设置</span>
    </RouterLink>
  </aside>
</template>

<script setup lang="ts">
import {
  Bell,
  MessageCircle,
  Search,
  Settings,
  Star,
  Users,
} from "@lucide/vue";
import { RouterLink } from "vue-router";
</script>
