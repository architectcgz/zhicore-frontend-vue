<template>
  <div class="notifications-page">
    <div class="notifications-page__container">
      <div class="glass-panel notifications-card">
        <header class="notifications-header">
          <h1 class="notifications-title">全部通知</h1>
          <button class="mark-read-btn">全部标记为已读</button>
        </header>

        <div class="notifications-list">
          <div class="notification-item unread">
            <div class="notification-indicator"></div>
            <div class="notification-content">
              <p><strong>Han Meimei</strong> 赞了你的草稿《2026 前端趋势》</p>
              <span class="notification-time">10 分钟前</span>
            </div>
          </div>
          
          <div class="notification-item">
            <div class="notification-indicator"></div>
            <div class="notification-content">
              <p><strong>System</strong> 欢迎加入知构 (ZhiCore) 平台！请记得完善你的个人资料，这有助于你认识更多志同道合的朋友。</p>
              <span class="notification-time">1 天前</span>
            </div>
          </div>
          
          <div class="notification-item">
            <div class="notification-indicator"></div>
            <div class="notification-content">
              <p><strong>Alice</strong> 在文章《Vue3 设计原理》中提到了你。</p>
              <span class="notification-time">3 天前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  padding: var(--space-10) var(--space-6);
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 64px);
}

.notifications-page__container {
  width: 100%;
  max-width: 680px;
  animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.notifications-card {
  padding: 0;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-8);
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.02);
}

.notifications-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.mark-read-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-soft);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(0, 229, 181, 0.1);
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: var(--space-6) var(--space-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notification-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-item.unread .notification-indicator {
  background: var(--color-primary);
  box-shadow: 0 0 10px rgba(0, 229, 181, 0.5);
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.6;
}

.notification-content strong {
  color: var(--color-text-strong);
}

.notification-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.notification-item.unread .notification-content p {
  color: var(--color-text-strong);
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

@media (max-width: 640px) {
  .notifications-page {
    padding: var(--space-6) var(--space-4);
  }
  
  .notifications-header {
    padding: var(--space-4) var(--space-6);
  }
  
  .notification-item {
    padding: var(--space-4) var(--space-6);
  }
}
</style>
