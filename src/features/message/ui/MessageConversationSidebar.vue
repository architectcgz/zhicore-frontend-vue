<template>
  <aside
    class="messages-route__contacts"
    :class="
      variant === 'list'
        ? 'messages-route__contacts--mobile-list'
        : 'messages-route__contacts--desktop'
    "
    aria-label="私信列表"
  >
    <header class="messages-route__contacts-header">
      <div v-if="variant === 'list'">
        <p class="messages-route__section-label">私信</p>
        <h1 id="messages-title">Messages</h1>
      </div>
      <h2 v-else>私信</h2>
      <button class="messages-route__icon-button" type="button" disabled>
        <SquarePen aria-hidden="true" />
        <span class="messages-route__sr-only">新建消息</span>
      </button>
    </header>

    <div class="messages-route__search" role="search">
      <Search aria-hidden="true" />
      <input
        type="search"
        :placeholder="variant === 'list' ? '搜索会话' : '搜索联系人或消息'"
        aria-label="搜索会话"
        disabled
      />
    </div>

    <div class="messages-route__filters" aria-label="私信筛选">
      <button
        class="messages-route__filter messages-route__filter--active"
        type="button"
        disabled
      >
        全部
      </button>
      <button class="messages-route__filter" type="button" disabled>
        未读
        <span v-if="center.unreadCount.value">{{
          center.unreadCount.value
        }}</span>
      </button>
      <button class="messages-route__filter" type="button" disabled>
        群聊
      </button>
      <button class="messages-route__filter" type="button" disabled>
        收藏
      </button>
    </div>

    <div class="messages-route__contact-list">
      <template v-if="variant === 'list'">
        <p
          v-if="center.status.value === 'loading'"
          class="messages-route__list-hint"
          role="status"
        >
          正在加载会话…
        </p>
        <div
          v-else-if="center.status.value === 'error'"
          class="messages-route__list-error"
          role="alert"
        >
          <p>{{ center.error.value ?? "会话列表加载失败" }}</p>
          <button type="button" @click="center.retry">重试</button>
        </div>
        <p
          v-else-if="center.status.value === 'empty'"
          class="messages-route__list-hint"
        >
          还没有任何私信会话。
        </p>
      </template>

      <template
        v-if="variant === 'detail' || center.status.value === 'success'"
      >
        <RouterLink
          v-for="conversation in center.conversations.value"
          :key="conversation.id"
          class="messages-route__conversation"
          :class="{
            'messages-route__conversation--active':
              conversation.id === activeConversationId,
          }"
          :to="`/messages/${conversation.id}`"
          :aria-label="`打开与 ${conversation.participantName} 的私信`"
        >
          <span class="messages-route__avatar">
            {{ conversation.participantInitial }}
            <span
              v-if="conversation.online"
              class="messages-route__online"
              aria-label="在线"
            />
          </span>
          <span class="messages-route__conversation-main">
            <span class="messages-route__conversation-top">
              <strong>{{ conversation.participantName }}</strong>
              <span>{{ conversation.lastMessageAt }}</span>
            </span>
            <span class="messages-route__preview">{{
              conversation.lastMessage
            }}</span>
          </span>
          <span
            v-if="unreadStore.unreadOf(conversation.id) > 0"
            class="messages-route__conversation-badge"
          >
            {{ unreadStore.unreadOf(conversation.id) }}
          </span>
        </RouterLink>
        <button
          v-if="variant === 'list' && center.hasMore.value"
          class="messages-route__list-more"
          type="button"
          :disabled="!center.canLoadMore.value"
          @click="center.loadMore"
        >
          {{ center.loadingMore.value ? "加载中…" : "加载更多会话" }}
        </button>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Search, SquarePen } from "@lucide/vue";
import { RouterLink } from "vue-router";

import { useMessageUnreadStore } from "@/stores/messageUnread";

import type { MessageCenterPageState } from "../types";

interface Props {
  center: MessageCenterPageState;
  activeConversationId: string | null;
  variant: "list" | "detail";
}

defineProps<Props>();

// 会话行徽标直接读取跨页面共享的未读状态，进入详情既读后列表与导航同步归零。
const unreadStore = useMessageUnreadStore();
</script>
