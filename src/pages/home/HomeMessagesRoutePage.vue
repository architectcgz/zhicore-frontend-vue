<template>
  <div class="messages-page">
    <div class="messages-page__container">
      <div class="glass-panel messages-card">
        <aside class="messages-sidebar">
          <header class="messages-header">
            <h1 class="messages-title">私信</h1>
            <button class="new-message-btn" aria-label="新建私信">
              <Plus class="new-icon" />
            </button>
          </header>
          <div class="messages-list">
            <div class="message-item active unread">
              <div class="message-avatar gradient-ai">AI</div>
              <div class="message-info">
                <div class="message-info-top">
                  <span class="message-name">Antigravity</span>
                  <span class="message-time">刚刚</span>
                </div>
                <p class="message-preview">新版透明度已经调整好了，看看合适吗？</p>
              </div>
            </div>
            
            <div class="message-item">
              <div class="message-avatar gradient-user">L</div>
              <div class="message-info">
                <div class="message-info-top">
                  <span class="message-name">Li Lei</span>
                  <span class="message-time">2小时前</span>
                </div>
                <p class="message-preview">期待你的下一篇架构分享。</p>
              </div>
            </div>
          </div>
        </aside>
        
        <main class="messages-chat">
          <header class="chat-header">
            <div class="chat-header-info">
              <h2>Antigravity</h2>
              <span class="chat-status"><span class="status-dot"></span> 在线</span>
            </div>
            <button class="chat-more-btn">
              <MoreVertical class="more-icon" />
            </button>
          </header>
          <div class="chat-body">
            <div class="chat-bubble received">
              <p>我已经进一步将工具栏的透明度大幅降低（增加了不透明度）了，看看效果如何？</p>
              <span class="time">15:55</span>
            </div>
            <div class="chat-bubble sent">
              <p>好多了！能不能再帮我把通知和私信功能也做一下？</p>
              <span class="time">15:58</span>
            </div>
            <div class="chat-bubble received">
              <p>没问题，马上为你安排独立页面和悬浮下拉菜单双端适配的完美体验。</p>
              <span class="time">16:00</span>
            </div>
          </div>
          <footer class="chat-footer">
            <button class="chat-action-btn">
              <Image class="action-icon" />
            </button>
            <div class="chat-input-wrapper">
              <input type="text" placeholder="输入消息..." class="chat-input" />
            </div>
            <button class="chat-send">
              <Send class="send-icon" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, MoreVertical, Image, Send } from "@lucide/vue";
</script>

<style scoped>
.messages-page {
  padding: 32px 24px;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 72px);
  background: radial-gradient(circle at 100% 100%, rgba(0, 168, 255, 0.08), transparent 50%);
}

.messages-page__container {
  width: 100%;
  max-width: 1100px;
  height: calc(100vh - 130px);
  min-height: 500px;
  animation: fade-in-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.messages-card {
  display: flex;
  height: 100%;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.messages-sidebar {
  width: 340px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.15);
}

.messages-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.messages-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.new-message-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-message-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: rotate(90deg);
}

.new-icon {
  width: 18px;
  height: 18px;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.message-item.active {
  background: linear-gradient(90deg, rgba(0, 229, 181, 0.08) 0%, transparent 100%);
}

.message-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  box-shadow: 0 0 12px var(--color-primary-soft);
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  border: 1px solid;
}

.gradient-ai {
  background: linear-gradient(135deg, rgba(0, 229, 181, 0.15), rgba(0, 168, 255, 0.15));
  color: var(--color-primary);
  border-color: rgba(0, 229, 181, 0.3);
}

.gradient-user {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15));
  color: #d8b4fe;
  border-color: rgba(168, 85, 247, 0.3);
}

.message-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.message-info-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.message-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.message-preview {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.unread .message-name {
  color: var(--color-primary);
}

.message-item.unread .message-preview {
  color: var(--color-text);
  font-weight: 500;
}

.messages-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
}

.chat-header {
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.01);
}

.chat-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary-soft);
}

.chat-more-btn {
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chat-more-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.more-icon {
  width: 20px;
  height: 20px;
}

.chat-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-bubble {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.chat-bubble.received {
  align-self: flex-start;
}

.chat-bubble.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-bubble p {
  margin: 0 0 6px;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.6;
  border-radius: 18px;
}

.chat-bubble.received p {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 4px;
  color: var(--color-text-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-bubble.sent p {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: #000;
  font-weight: 500;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 229, 181, 0.2);
}

.chat-bubble .time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

.chat-footer {
  padding: 20px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.01);
}

.chat-action-btn {
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.chat-action-btn:hover {
  color: var(--color-primary);
  background: rgba(0, 229, 181, 0.1);
}

.action-icon {
  width: 22px;
  height: 22px;
}

.chat-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.chat-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 14px 20px;
  color: var(--color-text-strong);
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.chat-input:focus {
  border-color: rgba(0, 229, 181, 0.4);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 2px rgba(0, 229, 181, 0.1);
}

.chat-send {
  background: var(--color-primary);
  color: #000;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 229, 181, 0.25);
}

.chat-send:hover {
  transform: translateY(-2px) scale(1.05);
  background: var(--color-primary-soft);
}

.send-icon {
  width: 20px;
  height: 20px;
  margin-left: -2px; /* Visual center adjustment */
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .messages-sidebar {
    display: none;
  }
  .messages-page {
    padding: 16px;
  }
  .messages-page__container {
    height: calc(100vh - 96px);
  }
}
</style>
