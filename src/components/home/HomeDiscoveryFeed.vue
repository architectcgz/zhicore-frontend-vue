<template>
  <section class="home-discovery" aria-labelledby="home-discovery-title">
    <header class="home-discovery__hero">
      <h1 id="home-discovery-title" class="home-discovery__hero-title">
        结构化知识，<br/>
        无限洞察。
      </h1>
      <p class="home-discovery__hero-desc">
        知构：致力于培育结构化知识、分享洞见，<br/>
        并通过优质内容共同成长的首选社区。
      </p>
      <div class="home-discovery__hero-actions">
        <RouterLink class="home-discovery__btn home-discovery__btn--primary" to="/auth/login">
          免费开始
        </RouterLink>
        <RouterLink class="home-discovery__btn home-discovery__btn--secondary" to="/structure">
          探索社区
        </RouterLink>
      </div>
    </header>

    <div class="home-discovery__feed-nav-wrapper">
      <nav class="home-discovery__feed-nav">
        <button class="home-discovery__nav-item active">推荐</button>
        <button class="home-discovery__nav-item">热门</button>
        <button class="home-discovery__nav-item">关注</button>
        <button class="home-discovery__nav-item">话题</button>
      </nav>
    </div>

    <section class="home-discovery__content">
      <main class="home-discovery__main-feed">
        <article class="home-discovery__article glass-panel">
          <div class="home-discovery__article-content">
            <header class="home-discovery__article-header">
              <span class="home-discovery__article-category">产品设计</span>
              <div class="home-discovery__article-meta-right">
                <span>10月28日</span>
                <span class="home-discovery__icon-text"><MessageSquare class="icon-sm" /> 1.2K</span>
              </div>
            </header>
            
            <h2 class="home-discovery__article-title">掌握信息架构：全面指南</h2>
            
            <div class="home-discovery__article-author-row">
              <div class="home-discovery__author-info">
                <div class="home-discovery__avatar">
                  <img src="https://i.pravatar.cc/150?u=liam" alt="Liam Chen" />
                </div>
                <span class="home-discovery__author-name">Liam Chen</span>
                <span class="home-discovery__dot">·</span>
                <span class="home-discovery__date">10月26日</span>
                <span class="home-discovery__dot">·</span>
                <span class="home-discovery__icon-text"><Heart class="icon-sm" /> 1.2K</span>
              </div>
            </div>
            
            <p class="home-discovery__article-excerpt">
              在产品设计中，信息架构是构建可用性和用户体验的基石。本文将带你探索如何通过清晰的结构化思考来组织和展示复杂系统，帮助用户更高效地获取知识。
            </p>
            
            <div class="home-discovery__article-tags">
              <span class="home-discovery__tag">产品</span>
              <span class="home-discovery__tag">设计</span>
              <span class="home-discovery__tag">架构</span>
            </div>
            
            <footer class="home-discovery__article-footer">
              <div class="home-discovery__author-info-bottom">
                <div class="home-discovery__avatar icon-sm-avatar">
                  <img src="https://i.pravatar.cc/150?u=liam" alt="Liam Chen" />
                </div>
                <span class="home-discovery__author-name-small">Liam Chen</span>
              </div>
              <div class="home-discovery__article-actions">
                <button class="home-discovery__action-btn" aria-label="Like"><Heart class="icon-md" /></button>
                <button class="home-discovery__action-btn" aria-label="Comment"><MessageSquare class="icon-md" /></button>
                <button class="home-discovery__action-btn" aria-label="Bookmark"><Bookmark class="icon-md" /></button>
              </div>
            </footer>
          </div>
          
          <div class="home-discovery__article-image">
             <div class="home-discovery__image-placeholder ui-mockup-bg"></div>
          </div>
        </article>
        
        <article class="home-discovery__article glass-panel">
          <div class="home-discovery__article-content">
            <header class="home-discovery__article-header">
              <span class="home-discovery__article-category">设计趋势</span>
              <div class="home-discovery__article-meta-right">
                <span class="home-discovery__icon-text"><Clock class="icon-sm" /> 10月26日</span>
                <span class="home-discovery__icon-text"><MessageSquare class="icon-sm" /> 348</span>
              </div>
            </header>
            
            <h2 class="home-discovery__article-title">如何建立可扩展的组件库</h2>
            
            <p class="home-discovery__article-excerpt">
              组件库是现代前端工程不可或缺的基础设施，从基础色彩体系到高级组件模式，本文深入解析其演进之路与常见架构设计挑战，助你打造优雅的代码体系。
            </p>
            
            <div class="home-discovery__article-tags">
              <span class="home-discovery__tag">设计</span>
              <span class="home-discovery__tag">架构</span>
              <span class="home-discovery__tag">排版</span>
            </div>
            
            <footer class="home-discovery__article-footer">
              <div class="home-discovery__author-info-bottom">
                <div class="home-discovery__avatar icon-sm-avatar">
                  <img src="https://i.pravatar.cc/150?u=liam" alt="Liam Chen" />
                </div>
                <span class="home-discovery__author-name-small">Liam Chen</span>
              </div>
              <div class="home-discovery__article-actions">
                <button class="home-discovery__action-btn" aria-label="Like"><Heart class="icon-md" /></button>
                <button class="home-discovery__action-btn" aria-label="Comment"><MessageSquare class="icon-md" /></button>
                <button class="home-discovery__action-btn" aria-label="Bookmark"><Bookmark class="icon-md" /></button>
              </div>
            </footer>
          </div>
          
          <div class="home-discovery__article-image">
             <div class="home-discovery__image-placeholder dark-bg"></div>
          </div>
        </article>
      </main>

      <aside class="home-discovery__sidebar">
        <div class="home-discovery__widget glass-panel">
          <h3 class="home-discovery__widget-title">热门话题</h3>
          <ul class="home-discovery__topic-list">
            <li><span class="home-discovery__topic-num">1.</span> <span class="home-discovery__topic-name">前端架构</span></li>
            <li><span class="home-discovery__topic-num">2.</span> <span class="home-discovery__topic-name">交互设计</span></li>
            <li><span class="home-discovery__topic-num">3.</span> <span class="home-discovery__topic-name">状态管理</span></li>
            <li><span class="home-discovery__topic-num">4.</span> <span class="home-discovery__topic-name">用户体验</span></li>
            <li><span class="home-discovery__topic-num">5.</span> <span class="home-discovery__topic-name">性能优化</span></li>
          </ul>
        </div>
        
        <div class="home-discovery__widget glass-panel">
          <h3 class="home-discovery__widget-title">热门社区</h3>
          <ul class="home-discovery__community-list">
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon zhi-icon">Z</div>
              <div class="home-discovery__community-info">
                <h4>知构</h4>
                <span>4.8万 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon community-icon">C</div>
              <div class="home-discovery__community-info">
                <h4>设计</h4>
                <span>563 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon scientioc-icon">S</div>
              <div class="home-discovery__community-info">
                <h4>科学</h4>
                <span>1.12万 成员</span>
              </div>
            </li>
            <li class="home-discovery__community-item">
              <div class="home-discovery__community-icon zhi-icon-dark">Z</div>
              <div class="home-discovery__community-info">
                <h4>知构</h4>
                <span>3.3万 成员</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { Heart, MessageSquare, Bookmark, Clock } from "@lucide/vue";
import { RouterLink } from "vue-router";
import type { HomeDiscoveryData } from "@/features/home-discovery";

const props = defineProps<{
  discovery?: HomeDiscoveryData;
  activeContentCategory?: string;
  searchQuery?: string;
}>();

const emit = defineEmits<{
  selectContentCategory: [category: string];
  "update:searchQuery": [query: string];
}>();
</script>

<style scoped>
.home-discovery {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 60px;
}

.home-discovery__hero {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeUp 0.8s ease-out forwards;
}

.home-discovery__hero-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-text-strong);
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.home-discovery__hero-desc {
  font-size: 1.125rem;
  color: var(--color-text-soft);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 800px;
  margin-inline: auto;
}

.home-discovery__hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.home-discovery__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-discovery__btn--primary {
  background: var(--color-primary);
  color: #000;
  box-shadow: 0 4px 14px rgba(0, 229, 181, 0.3);
}

.home-discovery__btn--primary:hover {
  background: var(--color-primary-soft);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 229, 181, 0.4);
}

.home-discovery__btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-strong);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.home-discovery__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.home-discovery__feed-nav-wrapper {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 6px;
  margin-bottom: 40px;
  display: inline-flex;
}

.home-discovery__feed-nav {
  display: flex;
  gap: 8px;
}

.home-discovery__nav-item {
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-discovery__nav-item:hover {
  color: var(--color-text-strong);
}

.home-discovery__nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-strong);
}

.home-discovery__content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  width: 100%;
}

.home-discovery__main-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-discovery__article {
  display: flex;
  padding: 24px;
  gap: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-discovery__article:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.home-discovery__article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home-discovery__article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-text-soft);
}

.home-discovery__article-meta-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.home-discovery__icon-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.icon-md {
  width: 18px;
  height: 18px;
}

.home-discovery__article-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.home-discovery__article-author-row {
  margin-bottom: 16px;
}

.home-discovery__author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-soft);
}

.home-discovery__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-bg-elevated);
}

.home-discovery__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-sm-avatar {
  width: 16px;
  height: 16px;
}

.home-discovery__author-name {
  color: var(--color-text);
  font-weight: 500;
}

.home-discovery__dot {
  opacity: 0.5;
}

.home-discovery__article-excerpt {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-soft);
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-discovery__article-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.home-discovery__tag {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  color: var(--color-text-soft);
}

.home-discovery__article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.home-discovery__author-info-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-discovery__author-name-small {
  font-size: 13px;
  color: var(--color-text);
}

.home-discovery__article-actions {
  display: flex;
  gap: 16px;
}

.home-discovery__action-btn {
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.home-discovery__action-btn:hover {
  color: var(--color-primary);
}

.home-discovery__article-image {
  flex: 0 0 240px;
  border-radius: 12px;
  overflow: hidden;
}

.home-discovery__image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border-radius: 12px;
}

.ui-mockup-bg {
  background: #eef2f6 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="10" rx="2" fill="%23d0d7e0"/><rect x="10" y="40" width="60" height="8" rx="2" fill="%23d0d7e0"/><rect x="10" y="55" width="40" height="8" rx="2" fill="%23d0d7e0"/><rect x="10" y="70" width="70" height="8" rx="2" fill="%23d0d7e0"/></svg>') no-repeat center center;
  background-size: 60%;
}

.dark-bg {
  background: linear-gradient(135deg, #16222A 0%, #3A6073 100%);
}


.home-discovery__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home-discovery__widget {
  padding: 20px;
}

.home-discovery__widget-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 16px 0;
}

.home-discovery__topic-list,
.home-discovery__community-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-discovery__topic-list li {
  font-size: 14px;
  color: var(--color-text-soft);
  display: flex;
  gap: 8px;
}

.home-discovery__topic-num {
  color: var(--color-text-soft);
  opacity: 0.7;
}

.home-discovery__topic-name {
  color: var(--color-text);
  transition: color 0.2s ease;
  cursor: pointer;
}

.home-discovery__topic-name:hover {
  color: var(--color-text-strong);
}

.home-discovery__community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.home-discovery__community-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.zhi-icon { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: var(--color-primary); }
.community-icon { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
.scientioc-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.zhi-icon-dark { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: var(--color-primary); }

.home-discovery__community-info h4 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.home-discovery__community-info span {
  font-size: 12px;
  color: var(--color-text-soft);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .home-discovery__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-discovery__article {
    flex-direction: column;
  }
  .home-discovery__article-image {
    flex: none;
    height: 200px;
    width: 100%;
  }
}
</style>
