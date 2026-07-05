<template>
  <main class="messages-route" aria-labelledby="messages-title">
    <section v-if="page.isLocalDemo" class="messages-route__layout">
      <aside class="messages-route__rail" aria-label="私信分组">
        <button
          class="messages-route__rail-item messages-route__rail-item--active"
          type="button"
        >
          AI
        </button>
        <button
          v-for="conversation in secondaryConversations"
          :key="conversation.id"
          class="messages-route__rail-item"
          type="button"
        >
          {{ conversation.participantInitial }}
        </button>
      </aside>

      <aside class="messages-route__contacts" aria-label="私信列表">
        <header class="messages-route__contacts-header">
          <div>
            <p class="messages-route__eyebrow">消息</p>
            <h1 id="messages-title">私信列表</h1>
          </div>
          <span v-if="page.unreadCount" class="messages-route__count">
            {{ page.unreadCount }}
          </span>
        </header>

        <div class="messages-route__contact-list">
          <button
            v-for="conversation in page.conversations"
            :key="conversation.id"
            class="messages-route__conversation"
            :class="{
              'messages-route__conversation--active':
                conversation.id === page.activeConversation?.id,
            }"
            type="button"
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
              <span class="messages-route__preview">
                {{ conversation.lastMessage }}
              </span>
            </span>
            <span
              v-if="conversation.unreadCount > 0"
              class="messages-route__conversation-badge"
            >
              {{ conversation.unreadCount }}
            </span>
          </button>
        </div>
      </aside>

      <section
        v-if="page.activeConversation"
        class="messages-route__chat"
        aria-label="当前会话"
      >
        <header class="messages-route__chat-header">
          <div>
            <span class="messages-route__channel-mark">#</span>
            <h2>{{ page.activeConversation.participantName }}</h2>
          </div>
          <p>
            {{ page.activeConversation.online ? "在线" : "离线" }}
          </p>
        </header>

        <div class="messages-route__history">
          <article
            v-for="message in page.activeConversation.messages"
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
                message.author === "me"
                  ? "我"
                  : page.activeConversation.participantInitial
              }}
            </span>
            <div class="messages-route__message-body">
              <div class="messages-route__message-meta">
                <strong>
                  {{
                    message.author === "me"
                      ? "我"
                      : page.activeConversation.participantName
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
              :placeholder="`发送消息给 ${page.activeConversation.participantName}`"
              aria-label="消息输入"
            />
          </div>
        </footer>
      </section>
    </section>

    <section v-else class="messages-route__empty">
      <p class="messages-route__eyebrow">Message</p>
      <h1 id="messages-title">私信暂不可用</h1>
      <p>消息服务接入后会显示会话列表和历史消息。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useMessageCenterPage } from "@/features/message";

const page = useMessageCenterPage();
const secondaryConversations = computed(() => page.conversations.slice(1, 3));
</script>

<style scoped>
.messages-route {
  --messages-bg: #2b2d31;
  --messages-bg-deep: #1e1f22;
  --messages-bg-panel: #313338;
  --messages-bg-hover: #35373c;
  --messages-bg-active: #404249;
  --messages-text: #dbdee1;
  --messages-text-strong: #ffffff;
  --messages-muted: #949ba4;
  --messages-border: #1e1f22;

  min-height: calc(100vh - 72px);
  background: var(--messages-bg);
  color: var(--messages-text);
}

.messages-route__layout {
  display: grid;
  grid-template-columns: 72px minmax(240px, 320px) minmax(0, 1fr);
  min-height: calc(100vh - 72px);
}

.messages-route__rail {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-3) 0;
  background: var(--messages-bg-deep);
}

.messages-route__rail-item {
  display: grid;
  width: var(--space-12);
  height: var(--space-12);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--messages-bg-panel);
  color: var(--messages-text);
  cursor: pointer;
  font-weight: 800;
  place-items: center;
  transition:
    background 0.2s ease,
    border-radius 0.2s ease,
    color 0.2s ease;
}

.messages-route__rail-item:hover,
.messages-route__rail-item--active {
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: #000;
}

.messages-route__contacts {
  display: flex;
  min-width: 0;
  flex-direction: column;
  background: var(--messages-bg);
  border-right: 1px solid var(--messages-border);
}

.messages-route__contacts-header {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--messages-border);
}

.messages-route__eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--messages-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.messages-route__contacts-header h1,
.messages-route__chat-header h2,
.messages-route__empty h1 {
  margin: 0;
  color: var(--messages-text-strong);
}

.messages-route__contacts-header h1 {
  font-size: 0.875rem;
  text-transform: uppercase;
}

.messages-route__count,
.messages-route__conversation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-6);
  height: var(--space-6);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #000;
  font-size: 0.8125rem;
  font-weight: 800;
}

.messages-route__contact-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
  padding: var(--space-2);
}

.messages-route__conversation {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.messages-route__conversation:hover {
  background: var(--messages-bg-hover);
}

.messages-route__conversation--active {
  background: var(--messages-bg-active);
}

.messages-route__avatar {
  position: relative;
  display: grid;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #000;
  font-weight: 800;
  place-items: center;
}

.messages-route__online {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  border: 2px solid var(--messages-bg);
  border-radius: var(--radius-pill);
  background: #23a559;
}

.messages-route__conversation-main {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.messages-route__conversation-top {
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
  font-size: 0.9375rem;
}

.messages-route__conversation-top strong {
  color: var(--messages-text-strong);
}

.messages-route__conversation-top span,
.messages-route__preview {
  color: var(--messages-muted);
}

.messages-route__preview {
  overflow: hidden;
  font-size: 0.8125rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-route__chat {
  display: grid;
  min-width: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--messages-bg-panel);
}

.messages-route__chat-header {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--messages-bg);
}

.messages-route__chat-header div {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.messages-route__channel-mark {
  color: #80848e;
  font-size: 1.25rem;
  font-weight: 800;
}

.messages-route__chat-header h2 {
  font-size: 1rem;
}

.messages-route__chat-header p {
  margin: 0;
  color: var(--messages-muted);
  font-size: 0.8125rem;
}

.messages-route__history {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
}

.messages-route__message {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
}

.messages-route__message-avatar {
  display: grid;
  width: var(--space-10);
  height: var(--space-10);
  border-radius: var(--radius-pill);
  background: #444850;
  color: var(--messages-text-strong);
  font-weight: 800;
  place-items: center;
}

.messages-route__message-avatar--mine {
  background: var(--color-primary);
  color: #000;
}

.messages-route__message-body {
  min-width: 0;
}

.messages-route__message-meta {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  margin-bottom: var(--space-1);
}

.messages-route__message-meta strong {
  color: var(--messages-text-strong);
}

.messages-route__message-meta time {
  color: var(--messages-muted);
  font-size: 0.75rem;
}

.messages-route__message-body p {
  margin: 0;
  color: var(--messages-text);
  line-height: 1.5;
}

.messages-route__composer {
  padding: 0 var(--space-4) var(--space-6);
}

.messages-route__input-shell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: #383a40;
}

.messages-route__add-button {
  width: var(--space-6);
  height: var(--space-6);
  border: 0;
  border-radius: var(--radius-pill);
  background: #b5bac1;
  color: #383a40;
  cursor: not-allowed;
  font-weight: 800;
}

.messages-route__input-shell input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--messages-text);
}

.messages-route__input-shell input::placeholder {
  color: var(--messages-muted);
}

.messages-route__empty {
  display: grid;
  gap: var(--space-3);
  width: min(100%, 760px);
  margin: var(--space-10) auto 0;
  padding: var(--space-10);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel);
  place-items: center;
  text-align: center;
}

.messages-route__empty p:last-child {
  max-width: 560px;
  margin: 0;
  color: var(--color-text-soft);
}

@media (max-width: 860px) {
  .messages-route__layout {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .messages-route__chat {
    grid-column: 1 / -1;
    min-height: 520px;
  }
}

@media (max-width: 640px) {
  .messages-route__layout {
    grid-template-columns: 1fr;
  }

  .messages-route__rail {
    display: none;
  }
}
</style>
