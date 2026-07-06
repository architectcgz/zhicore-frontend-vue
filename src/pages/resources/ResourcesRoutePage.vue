<script setup lang="ts">
import {
  Book,
  Bookmark,
  FileText,
  Folder,
  Image as ImageIcon,
  Sparkles,
} from "@lucide/vue";
</script>

<template>
  <section class="resources-route" aria-labelledby="resources-route-title">
    <div class="resources-route__layout">
      <div class="resources-route__hero-card">
        <div class="resources-route__hero-icon-wrapper">
          <Folder class="resources-route__hero-icon" />
        </div>
        <h1 id="resources-route-title" class="resources-route__hero-title">
          资源中心暂未接入
        </h1>
        <p class="resources-route__hero-desc">
          文件、资料与内容资产服务仍在准备中，未来将支持创作者沉淀、整理和分享知识资源。
        </p>
      </div>

      <div class="resources-route__features">
        <div class="resources-route__feature-card">
          <div class="resources-route__feature-icon-wrapper">
            <FileText class="resources-route__feature-icon" />
          </div>
          <h2 class="resources-route__feature-title">文件</h2>
          <p class="resources-route__feature-desc">
            上传与管理各类文档，集中存储，便于查找。
          </p>
          <div class="resources-route__feature-badge">即将推出</div>
        </div>

        <div class="resources-route__feature-card">
          <div class="resources-route__feature-icon-wrapper">
            <Book class="resources-route__feature-icon" />
          </div>
          <h2 class="resources-route__feature-title">资料</h2>
          <p class="resources-route__feature-desc">
            沉淀学习资料与参考内容，构建你的知识库。
          </p>
          <div class="resources-route__feature-badge">即将推出</div>
        </div>

        <div class="resources-route__feature-card">
          <div class="resources-route__feature-icon-wrapper">
            <ImageIcon class="resources-route__feature-icon" />
          </div>
          <h2 class="resources-route__feature-title">素材</h2>
          <p class="resources-route__feature-desc">
            管理图片、图表、代码片段等创作所需素材。
          </p>
          <div class="resources-route__feature-badge">即将推出</div>
        </div>

        <div class="resources-route__feature-card">
          <div class="resources-route__feature-icon-wrapper">
            <Bookmark class="resources-route__feature-icon" />
          </div>
          <h2 class="resources-route__feature-title">收藏</h2>
          <p class="resources-route__feature-desc">
            收藏优质资源与内容，随时回顾与复用。
          </p>
          <div class="resources-route__feature-badge">即将推出</div>
        </div>
      </div>

      <div class="resources-route__footer">
        <Sparkles class="resources-route__footer-icon" />
        <span class="resources-route__footer-text"
          >敬请期待，未来将作为内容沉淀的入口。</span
        >
        <Sparkles class="resources-route__footer-icon" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.resources-route {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
}

.resources-route__layout {
  width: 100%;
  max-width: 60rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-10);
  position: relative;
}

.resources-route__hero-card {
  width: min(100%, 40rem);
  padding: var(--space-12) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(24px);
}

.resources-route__hero-card::before {
  content: "";
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15rem;
  height: 15rem;
  background: radial-gradient(
    circle,
    var(--color-primary-soft) 0%,
    transparent 60%
  );
  opacity: 0.1;
  filter: blur(40px);
  pointer-events: none;
}

.resources-route__hero-icon-wrapper {
  color: var(--color-primary);
  margin-bottom: var(--space-6);
  position: relative;
}

.resources-route__hero-icon {
  width: 3.5rem;
  height: 3.5rem;
  stroke-width: 1.5;
}

.resources-route__hero-title {
  margin: 0 0 var(--space-4);
  color: var(--color-text-strong);
  font-size: var(--font-size-32, 2rem);
  font-weight: var(--font-weight-h1);
  letter-spacing: -0.02em;
}

.resources-route__hero-desc {
  max-width: 36rem;
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-16, 1rem);
  line-height: var(--line-height-desc);
}

.resources-route__features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
  width: 100%;
}

@media (max-width: 1024px) {
  .resources-route__features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .resources-route__features {
    grid-template-columns: 1fr;
  }
}

.resources-route__feature-card {
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--color-panel-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s ease;
  opacity: 0.85;
}

.resources-route__feature-card:hover {
  opacity: 1;
  border-color: var(--color-border-strong);
}

.resources-route__feature-icon-wrapper {
  color: var(--color-text-soft);
  margin-bottom: var(--space-5);
  background: var(--color-panel-glass);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.resources-route__feature-icon {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 1.5;
}

.resources-route__feature-title {
  margin: 0 0 var(--space-3);
  color: var(--color-text-strong);
  font-size: var(--font-size-20, 1.25rem);
  font-weight: var(--font-weight-h3);
}

.resources-route__feature-desc {
  margin: 0 0 var(--space-6);
  color: var(--color-text-soft);
  font-size: var(--font-size-14, 0.875rem);
  line-height: var(--line-height-desc);
  flex-grow: 1;
}

.resources-route__feature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  background: var(--color-panel-glass);
  color: var(--color-text-soft);
  font-size: var(--font-size-12, 0.75rem);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
}

.resources-route__footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
  color: var(--color-primary-strong);
  opacity: 0.8;
}

.resources-route__footer-icon {
  width: 1.125rem;
  height: 1.125rem;
  stroke-width: 1.5;
}

.resources-route__footer-text {
  font-size: var(--font-size-14, 0.875rem);
  letter-spacing: 0.05em;
}
</style>
