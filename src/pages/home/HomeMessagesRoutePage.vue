<template>
  <main class="messages-route" aria-labelledby="messages-title">
    <section class="messages-route__layout messages-route__layout--list">
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
            placeholder="搜索会话"
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
            <!-- 未读数加载失败为 null 时隐藏 badge，不显示为 0（见 message 设计文档未读规则）。 -->
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
          <template v-else>
            <RouterLink
              v-for="conversation in center.conversations.value"
              :key="conversation.id"
              class="messages-route__conversation"
              :class="{
                'messages-route__conversation--active':
                  conversation.id === center.activeConversation.value?.id,
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
            <button
              v-if="center.hasMore.value"
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

      <section
        v-if="center.activeConversation.value"
        class="messages-route__chat messages-route__chat--desktop"
        aria-label="当前会话"
      >
        <header class="messages-route__chat-header">
          <div class="messages-route__chat-person">
            <span class="messages-route__avatar messages-route__avatar--header">
              {{ center.activeConversation.value.participantInitial }}
              <span
                v-if="center.activeConversation.value.online"
                class="messages-route__online"
                aria-label="在线"
              />
            </span>
            <div>
              <h2>{{ center.activeConversation.value.participantName }}</h2>
              <p>
                {{ center.activeConversation.value.online ? "在线" : "离线" }}
              </p>
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
          <p
            v-if="thread.status.value === 'loading'"
            class="messages-route__list-hint"
            role="status"
          >
            正在加载消息…
          </p>
          <div
            v-else-if="thread.status.value === 'error'"
            class="messages-route__list-error"
            role="alert"
          >
            <p>{{ thread.error.value ?? "历史消息加载失败" }}</p>
            <button type="button" @click="thread.retry">重试</button>
          </div>
          <p
            v-else-if="thread.status.value === 'empty'"
            class="messages-route__list-hint"
          >
            还没有历史消息，发送第一条开始对话。
          </p>
          <template v-else>
            <button
              v-if="thread.hasMore.value"
              class="messages-route__list-more"
              type="button"
              :disabled="!thread.canLoadMore.value"
              @click="thread.loadMore"
            >
              {{ thread.loadingMore.value ? "加载中…" : "加载更早消息" }}
            </button>
            <div class="messages-route__date-divider">今天</div>
            <article
              v-for="message in thread.messages.value"
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
                {{ center.activeConversation.value.participantInitial }}
              </span>
              <div class="messages-route__message-body">
                <p>{{ message.text }}</p>
                <div class="messages-route__message-meta">
                  <time v-if="message.sentAt">{{ message.sentAt }}</time>
                  <span
                    v-if="message.author === 'me' && message.deliveryState"
                    class="messages-route__delivery-status"
                    :class="`messages-route__delivery-status--${message.deliveryState}`"
                    :aria-label="deliveryStatusLabel(message.deliveryState)"
                    :title="deliveryStatusLabel(message.deliveryState)"
                  >
                    <LoaderCircle
                      v-if="message.deliveryState === 'sending'"
                      aria-hidden="true"
                    />
                    <TriangleAlert
                      v-else-if="message.deliveryState === 'failed'"
                      aria-hidden="true"
                    />
                    <Check
                      v-else-if="message.deliveryState === 'sent'"
                      aria-hidden="true"
                    />
                    <CheckCheck v-else aria-hidden="true" />
                  </span>
                  <button
                    v-if="message.deliveryState === 'failed'"
                    class="messages-route__message-retry"
                    type="button"
                    @click="thread.retryMessage(message.id)"
                  >
                    重试
                  </button>
                </div>
              </div>
            </article>
          </template>
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
          <div ref="composerInputRoot" class="messages-route__input-shell">
            <input
              v-model="thread.draft.value"
              type="text"
              placeholder="输入消息..."
              aria-label="消息输入"
              @keydown.enter.prevent="thread.send"
            />
            <button
              class="messages-route__emoji-button"
              type="button"
              aria-label="选择表情"
              aria-haspopup="menu"
              :aria-expanded="isEmojiPickerOpen"
              @click="toggleEmojiPicker"
            >
              <Smile aria-hidden="true" />
            </button>
            <div
              v-if="isEmojiPickerOpen"
              class="messages-route__emoji-menu"
              role="menu"
              aria-label="表情"
            >
              <button
                v-for="emoji in emojiOptions"
                :key="emoji"
                type="button"
                role="menuitem"
                :aria-label="`插入 ${emoji}`"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          <button
            class="messages-route__send-button"
            type="button"
            :disabled="!thread.canSend.value"
            @click="thread.send"
          >
            <Send aria-hidden="true" />
            <span class="messages-route__sr-only">发送消息</span>
          </button>
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  Bell,
  Check,
  CheckCheck,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Settings,
  Smile,
  SquarePen,
  Star,
  TriangleAlert,
  Users,
} from "@lucide/vue";
import { RouterLink } from "vue-router";

import {
  useConversationActionMenu,
  useMessageComposer,
  useMessageCenterPage,
  useMessageThread,
  type MessageDeliveryState,
} from "@/features/message";
import "./message-route.css";

// 会话列表入口：加载成功后默认选中第一条会话，供桌面端右侧内联展示线程。
const center = useMessageCenterPage({ autoSelectFirst: true });
// 线程跟随当前选中的会话 id 独立加载，会话切换时自动重载并丢弃旧响应。
const thread = useMessageThread(center.activeConversationId);
const {
  conversationActionMenuRoot,
  isConversationActionMenuOpen,
  toggleConversationActionMenu,
} = useConversationActionMenu();
const {
  composerInputRoot,
  emojiOptions,
  isEmojiPickerOpen,
  insertEmoji,
  toggleEmojiPicker,
} = useMessageComposer(thread.draft);

function deliveryStatusLabel(state: MessageDeliveryState): string {
  switch (state) {
    case "sending":
      return "发送中";
    case "failed":
      return "发送失败";
    case "read":
      return "已读";
    default:
      return "已发送";
  }
}
</script>
