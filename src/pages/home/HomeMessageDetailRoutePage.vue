<template>
  <main class="messages-route" aria-labelledby="message-detail-title">
    <section
      v-if="conversation"
      class="messages-route__layout messages-route__layout--detail"
    >
      <MessageUtilityNav />
      <MessageConversationSidebar
        :center="center"
        :active-conversation-id="conversation.id"
        variant="detail"
      />
      <MessageThreadPanel :conversation="conversation" :thread="thread" />
    </section>

    <section
      v-else-if="center.status.value === 'loading'"
      class="messages-route__empty"
    >
      <p class="messages-route__eyebrow">Message</p>
      <h1 id="message-detail-title">正在加载会话…</h1>
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
import { RouterLink } from "vue-router";

import {
  MessageConversationSidebar,
  MessageThreadPanel,
  MessageUtilityNav,
  useMessageCenterRoutePage,
} from "@/features/message";
import "./message-route.css";

// 详情路由保留路由参数、会话列表与线程工作流的装配，视觉区域由 feature UI 组件承载。
const { center, thread, conversation } = useMessageCenterRoutePage();
</script>
