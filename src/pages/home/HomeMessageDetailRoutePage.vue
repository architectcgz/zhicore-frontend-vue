<template>
  <main class="messages-route" aria-labelledby="message-detail-title">
    <section
      v-if="page.isLocalDemo && conversation"
      class="messages-route__layout messages-route__layout--detail"
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
        class="messages-route__contacts messages-route__contacts--desktop"
        aria-label="私信列表"
      >
        <header class="messages-route__contacts-header">
          <h2>私信</h2>
          <button class="messages-route__icon-button" type="button" disabled>
            <SquarePen aria-hidden="true" />
            <span class="messages-route__sr-only">新建消息</span>
          </button>
        </header>

        <div class="messages-route__search" role="search">
          <Search aria-hidden="true" />
          <input
            type="search"
            placeholder="搜索联系人或消息"
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
          <div class="messages-route__chat-person">
            <RouterLink
              class="messages-route__detail-back"
              to="/messages"
              aria-label="返回私信列表"
            >
              <ArrowLeft aria-hidden="true" />
            </RouterLink>
            <span class="messages-route__avatar messages-route__avatar--header">
              {{ conversation.participantInitial }}
              <span
                v-if="conversation.online"
                class="messages-route__online"
                aria-label="在线"
              />
            </span>
            <div>
              <h1 id="message-detail-title">
                {{ conversation.participantName }}
              </h1>
              <p>{{ conversation.online ? "在线" : "离线" }}</p>
            </div>
          </div>

          <div class="messages-route__chat-actions">
            <button class="messages-route__icon-button" type="button" disabled>
              <Phone aria-hidden="true" />
              <span class="messages-route__sr-only">语音通话</span>
            </button>
            <button class="messages-route__icon-button" type="button" disabled>
              <Video aria-hidden="true" />
              <span class="messages-route__sr-only">视频通话</span>
            </button>
            <button class="messages-route__icon-button" type="button" disabled>
              <MoreHorizontal aria-hidden="true" />
              <span class="messages-route__sr-only">更多操作</span>
            </button>
          </div>
        </header>

        <div class="messages-route__history">
          <div class="messages-route__date-divider">今天</div>
          <article
            v-for="message in conversation.messages"
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
              {{ conversation.participantInitial }}
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
      <h1 id="message-detail-title">找不到私信会话</h1>
      <p>这个会话不存在，或消息服务暂不可用。</p>
      <RouterLink class="messages-route__empty-link" to="/messages">
        返回私信列表
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Settings,
  Smile,
  SquarePen,
  Star,
  Users,
  Video,
} from "@lucide/vue";
import { RouterLink } from "vue-router";

import { useMessageCenterRoutePage } from "@/features/message";
import "./message-route.css";

const { page, conversation } = useMessageCenterRoutePage();
</script>
