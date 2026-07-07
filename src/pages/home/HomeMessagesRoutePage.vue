<template>
  <main class="messages-route" aria-labelledby="messages-title">
    <section
      v-if="page.isLocalDemo"
      class="messages-route__layout messages-route__layout--list"
    >
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

      <aside
        class="messages-route__contacts messages-route__contacts--mobile-list"
        aria-label="私信列表"
      >
        <header class="messages-route__contacts-header">
          <div>
            <p class="messages-route__section-label">私信</p>
            <h1 id="messages-title">Messages</h1>
          </div>
          <button class="messages-route__icon-button" type="button" disabled>
            <SquarePen aria-hidden="true" />
            <span class="messages-route__sr-only">新建消息</span>
          </button>
        </header>

        <div class="messages-route__search" role="search">
          <Search aria-hidden="true" />
          <input
            type="search"
            placeholder="Search conversations..."
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
            <span v-if="page.unreadCount">{{ page.unreadCount }}</span>
          </button>
          <button class="messages-route__filter" type="button" disabled>
            群聊
          </button>
          <button class="messages-route__filter" type="button" disabled>
            收藏
          </button>
        </div>

        <div class="messages-route__contact-list">
          <RouterLink
            v-for="conversation in page.conversations"
            :key="conversation.id"
            class="messages-route__conversation"
            :class="{
              'messages-route__conversation--active':
                conversation.id === page.activeConversation?.id,
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
          </RouterLink>
        </div>
      </aside>

      <section
        v-if="page.activeConversation"
        class="messages-route__chat messages-route__chat--desktop"
        aria-label="当前会话"
      >
        <header class="messages-route__chat-header">
          <div class="messages-route__chat-person">
            <span class="messages-route__avatar messages-route__avatar--header">
              {{ page.activeConversation.participantInitial }}
              <span
                v-if="page.activeConversation.online"
                class="messages-route__online"
                aria-label="在线"
              />
            </span>
            <div>
              <h2>{{ page.activeConversation.participantName }}</h2>
              <p>{{ page.activeConversation.online ? "在线" : "离线" }}</p>
            </div>
          </div>

          <div
            ref="conversationActionMenuRoot"
            class="messages-route__chat-actions"
          >
            <button
              class="messages-route__icon-button"
              type="button"
              aria-label="更多操作"
              aria-haspopup="menu"
              :aria-expanded="isConversationActionMenuOpen"
              aria-controls="messages-conversation-action-menu"
              @click="toggleConversationActionMenu"
            >
              <MoreHorizontal aria-hidden="true" />
              <span class="messages-route__sr-only">更多操作</span>
            </button>
            <div
              v-if="isConversationActionMenuOpen"
              id="messages-conversation-action-menu"
              class="messages-route__action-menu"
              role="menu"
              aria-label="会话管理"
            >
              <button type="button" role="menuitem" disabled>拉黑用户</button>
              <button type="button" role="menuitem" disabled>举报对话</button>
              <button
                type="button"
                role="menuitem"
                class="messages-route__action-menu-item--danger"
                disabled
              >
                删除会话
              </button>
            </div>
          </div>
        </header>

        <div class="messages-route__history">
          <div class="messages-route__date-divider">今天</div>
          <article
            v-for="message in page.activeConversation.messages"
            :key="message.id"
            class="messages-route__message"
            :class="{
              'messages-route__message--mine': message.author === 'me',
            }"
          >
            <span
              v-if="message.author !== 'me'"
              class="messages-route__message-avatar"
            >
              {{ page.activeConversation.participantInitial }}
            </span>
            <div class="messages-route__message-body">
              <p>{{ message.text }}</p>
              <div class="messages-route__message-meta">
                <time>{{ message.sentAt }}</time>
                <span v-if="message.author === 'me'">✓✓</span>
              </div>
            </div>
          </article>
        </div>

        <footer class="messages-route__composer">
          <button
            class="messages-route__composer-button"
            type="button"
            disabled
          >
            <Paperclip aria-hidden="true" />
            <span class="messages-route__sr-only">添加附件</span>
          </button>
          <div class="messages-route__input-shell">
            <input
              type="text"
              placeholder="输入消息..."
              aria-label="消息输入"
              disabled
            />
            <Smile aria-hidden="true" />
          </div>
          <button class="messages-route__send-button" type="button" disabled>
            <Send aria-hidden="true" />
            <span class="messages-route__sr-only">发送消息</span>
          </button>
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
import {
  Bell,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Settings,
  Smile,
  SquarePen,
  Star,
  Users,
} from "@lucide/vue";
import { RouterLink } from "vue-router";

import { useMessageCenterPage } from "@/features/message";
import "./message-route.css";
import { useConversationActionMenu } from "./useConversationActionMenu";

const page = useMessageCenterPage();
const {
  conversationActionMenuRoot,
  isConversationActionMenuOpen,
  toggleConversationActionMenu,
} = useConversationActionMenu();
</script>
