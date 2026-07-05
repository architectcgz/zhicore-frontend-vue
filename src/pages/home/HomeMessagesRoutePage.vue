<template>
  <div class="messages-page">
    <div class="messages-page__container">
      <div class="glass-panel messages-card">
        <aside class="messages-sidebar">
          <header class="messages-header">
            <h1 class="messages-title">私信</h1>
          </header>
          <div class="messages-list">
            <div class="message-item active unread">
              <div class="message-avatar">AI</div>
              <div class="message-info">
                <div class="message-info-top">
                  <span class="message-name">Antigravity</span>
                  <span class="message-time">刚刚</span>
                </div>
                <p class="message-preview">新版透明度已经调整好了，看看合适吗？</p>
              </div>
            </div>
            
            <div class="message-item">
              <div class="message-avatar">L</div>
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
            <h2>Antigravity</h2>
            <span class="chat-status">在线</span>
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
            <input type="text" placeholder="输入消息..." class="chat-input" />
            <button class="chat-send">发送</button>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messages-page {
  padding: var(--space-8) var(--space-6);
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 64px);
}

.messages-page__container {
  width: 100%;
  max-width: 1000px;
  height: 75vh;
  animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.messages-card {
  display: flex;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.messages-sidebar {
  width: 320px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
}

.messages-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.messages-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.messages-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.message-item.active {
  background: rgba(0, 229, 181, 0.08);
  border-left: 3px solid var(--color-primary);
  padding-left: 17px;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 229, 181, 0.2), rgba(0, 168, 255, 0.2));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 229, 181, 0.3);
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
  color: rgba(255, 255, 255, 0.4);
}

.message-preview {
  margin: 0;
  font-size: 13px;
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
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.chat-status {
  font-size: 12px;
  color: var(--color-primary);
  background: rgba(0, 229, 181, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 181, 0.2);
}

.chat-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-bubble {
  max-width: 70%;
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
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  border-radius: 16px;
}

.chat-bubble.received p {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
  color: var(--color-text);
}

.chat-bubble.sent p {
  background: var(--color-primary);
  color: #000;
  font-weight: 500;
  border-bottom-right-radius: 4px;
}

.chat-bubble .time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
}

.chat-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.chat-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 12px 20px;
  color: var(--color-text-strong);
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-input:focus {
  border-color: rgba(255, 255, 255, 0.3);
}

.chat-send {
  background: var(--color-primary);
  color: #000;
  border: none;
  padding: 0 24px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.chat-send:hover {
  transform: translateY(-1px);
  background: var(--color-primary-soft);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .messages-sidebar {
    display: none; /* In a real app, this would toggle based on route/state */
  }
}
</style>
