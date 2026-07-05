<template>
  <div class="notifications-page">
    <div class="notifications-page__container">
      <div class="glass-panel notifications-card">
        <header class="notifications-header">
          <div class="notifications-header-title">
            <Bell class="header-icon" />
            <h1 class="notifications-title">全部通知</h1>
          </div>
          <button class="mark-read-btn">
            <CheckCheck class="btn-icon" />
            <span>全部标记为已读</span>
          </button>
        </header>

        <div class="notifications-list">
          <div class="notification-item unread">
            <div class="notification-indicator"></div>
            <div class="notification-avatar"><Heart class="item-icon" /></div>
            <div class="notification-content">
              <p><strong>Han Meimei</strong> 赞了你的草稿《2026 前端趋势》</p>
              <span class="notification-time">10 分钟前</span>
            </div>
          </div>
          
          <div class="notification-item">
            <div class="notification-indicator"></div>
            <div class="notification-avatar primary"><Sparkles class="item-icon" /></div>
            <div class="notification-content">
              <p><strong>System</strong> 欢迎加入知构 (ZhiCore) 平台！请记得完善你的个人资料，这有助于你认识更多志同道合的朋友。</p>
              <span class="notification-time">1 天前</span>
            </div>
          </div>
          
          <div class="notification-item">
            <div class="notification-indicator"></div>
            <div class="notification-avatar mention"><AtSign class="item-icon" /></div>
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

<script setup lang="ts">
import { Bell, CheckCheck, Heart, Sparkles, AtSign } from "@lucide/vue";
</script>

<style scoped>
.notifications-page {
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 72px);
  background: radial-gradient(circle at 50% 0%, rgba(0, 229, 181, 0.05), transparent 60%);
}

.notifications-page__container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: fade-in-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.notifications-card {
  padding: 0;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
}

.notifications-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
  filter: drop-shadow(0 0 8px rgba(0, 229, 181, 0.5));
}

.notifications-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.mark-read-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-soft);
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mark-read-btn .btn-icon {
  width: 16px;
  height: 16px;
}

.mark-read-btn:hover {
  color: #000;
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: 0 0 16px rgba(0, 229, 181, 0.3);
  transform: translateY(-1px);
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
  position: relative;
  align-items: flex-start;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.02);
  transform: translateX(4px);
}

.notification-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  margin-top: 14px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.notification-item.unread .notification-indicator {
  background: var(--color-primary);
  box-shadow: 0 0 12px rgba(0, 229, 181, 0.6);
}

.notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.notification-avatar.primary {
  background: linear-gradient(135deg, rgba(0, 229, 181, 0.15), rgba(0, 168, 255, 0.05));
  color: var(--color-primary);
  border-color: rgba(0, 229, 181, 0.2);
}

.notification-avatar.mention {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.05));
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.2);
}

.item-icon {
  width: 18px;
  height: 18px;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--color-text-soft);
  line-height: 1.6;
  transition: color 0.3s ease;
}

.notification-content strong {
  color: var(--color-text-strong);
  font-weight: 600;
}

.notification-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.notification-item.unread .notification-content p {
  color: var(--color-text);
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

@media (max-width: 640px) {
  .notifications-page {
    padding: var(--space-4);
  }
  
  .notifications-header {
    padding: 20px;
  }
  
  .notification-item {
    padding: 20px;
  }
  
  .notification-item:hover {
    transform: none;
  }
}
</style>
