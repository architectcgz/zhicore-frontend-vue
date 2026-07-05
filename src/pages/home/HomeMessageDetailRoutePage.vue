<template>
  <main class="messages-route" aria-labelledby="message-detail-title">
    <section
      v-if="page.isLocalDemo && conversation"
      class="messages-route__layout messages-route__layout--detail"
    >
      <aside class="messages-route__rail" aria-label="私信分组">
        <RouterLink
          class="messages-route__rail-item"
          :class="{
            'messages-route__rail-item--active':
              conversation.id === page.conversations[0]?.id,
          }"
          :to="firstConversationHref"
          aria-label="打开最近私信"
        >
          AI
        </RouterLink>
        <RouterLink
          v-for="secondaryConversation in secondaryConversations"
          :key="secondaryConversation.id"
          class="messages-route__rail-item"
          :class="{
            'messages-route__rail-item--active':
              secondaryConversation.id === conversation.id,
          }"
          :to="`/messages/${secondaryConversation.id}`"
          :aria-label="`打开与 ${secondaryConversation.participantName} 的私信`"
        >
          {{ secondaryConversation.participantInitial }}
        </RouterLink>
      </aside>

      <aside
        class="messages-route__contacts messages-route__contacts--desktop"
        aria-label="私信列表"
      >
        <header class="messages-route__contacts-header">
          <div>
            <p class="messages-route__eyebrow">消息</p>
            <h2>私信列表</h2>
          </div>
          <span v-if="page.unreadCount" class="messages-route__count">
            {{ page.unreadCount }}
          </span>
        </header>

        <div class="messages-route__contact-list">
          <RouterLink
            v-for="item in page.conversations"
            :key="item.id"
            class="messages-route__conversation"
            :class="{
              'messages-route__conversation--active':
                item.id === conversation.id,
            }"
            :to="`/messages/${item.id}`"
            :aria-label="`打开与 ${item.participantName} 的私信`"
          >
            <span class="messages-route__avatar">
              {{ item.participantInitial }}
              <span
                v-if="item.online"
                class="messages-route__online"
                aria-label="在线"
              />
            </span>
            <span class="messages-route__conversation-main">
              <span class="messages-route__conversation-top">
                <strong>{{ item.participantName }}</strong>
                <span>{{ item.lastMessageAt }}</span>
              </span>
              <span class="messages-route__preview">
                {{ item.lastMessage }}
              </span>
            </span>
            <span
              v-if="item.unreadCount > 0"
              class="messages-route__conversation-badge"
            >
              {{ item.unreadCount }}
            </span>
          </RouterLink>
        </div>
      </aside>

      <section
        class="messages-route__chat messages-route__chat--desktop messages-route__chat--mobile-detail"
        aria-label="当前会话"
      >
        <header class="messages-route__chat-header">
          <div>
            <RouterLink
              class="messages-route__detail-back"
              to="/messages"
              aria-label="返回私信列表"
            >
              ←
            </RouterLink>
            <h1 id="message-detail-title">
              {{ conversation.participantName }}
            </h1>
          </div>
          <p>
            {{ conversation.online ? "在线" : "离线" }}
          </p>
        </header>

        <div class="messages-route__history">
          <article
            v-for="message in conversation.messages"
            :key="message.id"
            class="messages-route__message"
          >
            <span
              class="messages-route__message-avatar"
              :class="{
                'messages-route__message-avatar--mine': message.author === 'me',
              }"
            >
              {{
                message.author === "me" ? "我" : conversation.participantInitial
              }}
            </span>
            <div class="messages-route__message-body">
              <div class="messages-route__message-meta">
                <strong>
                  {{
                    message.author === "me"
                      ? "我"
                      : conversation.participantName
                  }}
                </strong>
                <time>{{ message.sentAt }}</time>
              </div>
              <p>{{ message.text }}</p>
            </div>
          </article>
        </div>

        <footer class="messages-route__composer">
          <div class="messages-route__input-shell">
            <button class="messages-route__add-button" type="button" disabled>
              +
            </button>
            <input
              type="text"
              :placeholder="`发送消息给 ${conversation.participantName}`"
              aria-label="消息输入"
            />
          </div>
        </footer>
      </section>
    </section>

    <section v-else class="messages-route__empty">
      <p class="messages-route__eyebrow">Message</p>
      <h1 id="message-detail-title">找不到私信会话</h1>
      <p>这个会话不存在，或消息服务暂不可用。</p>
      <RouterLink class="messages-route__empty-link" to="/messages">
        返回私信列表
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { useMessageCenterPage } from "@/features/message";
import "./message-route.css";

const route = useRoute();
const conversationId = computed(() => {
  const param = route.params.conversationId;
  return Array.isArray(param) ? param[0] : param;
});

// 路由 id 是详情页唯一会话来源；未知 id 不回退到默认会话，避免用户看到错误私信内容。
const page = computed(() =>
  useMessageCenterPage({ activeConversationId: conversationId.value }),
);
const conversation = computed(() => page.value.activeConversation);
const secondaryConversations = computed(() =>
  page.value.conversations.slice(1, 3),
);
const firstConversationHref = computed(() =>
  page.value.conversations[0]
    ? `/messages/${page.value.conversations[0].id}`
    : "/messages",
);
</script>
