<template>
  <main class="messages-route" aria-labelledby="messages-title">
    <section class="messages-route__layout messages-route__layout--list">
      <MessageUtilityNav />
      <MessageConversationSidebar
        :center="center"
        :active-conversation-id="center.activeConversation.value?.id ?? null"
        variant="list"
      />

      <section
        class="messages-route__chat messages-route__chat--desktop messages-route__no-selection"
        aria-label="未选择会话"
      >
        <div class="messages-route__no-selection-inner">
          <span class="messages-route__no-selection-icon" aria-hidden="true">
            <MessagesSquare />
          </span>
          <h2>选择一个会话</h2>
          <p>从左侧私信列表挑选联系人，开始阅读或回复消息。</p>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { MessagesSquare } from "@lucide/vue";

import {
  MessageConversationSidebar,
  MessageUtilityNav,
  useMessageCenterPage,
} from "@/features/message";
import "./message-route.css";

// 列表入口只负责会话选择；线程、发送与管理操作由 /messages/:conversationId 详情路由承载。
const center = useMessageCenterPage();
</script>
