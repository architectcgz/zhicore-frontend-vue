<template>
  <div class="about-page">
    <div class="about-page__container">
      <div class="glass-panel about-card">
        <h1 class="about-card__title">关于知构 (ZhiCore)</h1>
        <p class="about-card__subtitle">
          下一代专注于结构化知识与沉浸式体验的内容协作平台。
        </p>

        <div class="about-card__content">
          <h2>设计哲学</h2>
          <p>
            知构 (ZhiCore) 以<strong>深色拟物玻璃态 (Dark Glassmorphism)</strong> 为核心视觉语言。我们相信，阅读和写作环境不应当是苍白耀眼的白纸，而是犹如星空般深邃、晶莹透彻的画布。我们大幅利用毛玻璃（Backdrop blur）与高级渐变背景，旨在降低用户认知负荷，提供真正的沉浸式创作体验。
          </p>

          <h2>核心特性</h2>
          <ul class="about-card__features">
            <li>
              <strong>沉浸式长文编辑器：</strong>
              支持块级元素操作，通过多主题切换、动态模糊工具栏避免视觉遮挡。
            </li>
            <li>
              <strong>前沿技术与高可用架构：</strong>
              采用 Vue 3 + TypeScript 生态，并全面集成 Vitest 保障平台的高覆盖率与稳定性。
            </li>
            <li>
              <strong>结构化知识流：</strong>
              不满足于碎片的推流，知构旨在为您提供一个可以构建体系化文档与思想的网络空间。
            </li>
          </ul>

          <div class="about-card__footer">
            <p>探索知识，重构思维。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: var(--space-10) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px); /* assuming there is a header */
}

.about-page__container {
  width: 100%;
  max-width: 800px;
  animation: fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.about-card {
  padding: var(--space-12) var(--space-10);
}

.about-card__title {
  font-size: 36px;
  font-weight: var(--font-weight-h1);
  margin: 0 0 var(--space-3);
  background: linear-gradient(135deg, #ffffff, #9ca3af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-card__subtitle {
  font-size: 18px;
  color: var(--color-text-soft);
  margin: 0 0 var(--space-8);
  line-height: var(--line-height-desc);
}

.about-card__content h2 {
  font-size: 20px;
  font-weight: var(--font-weight-h3);
  color: var(--color-primary);
  margin: var(--space-8) 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.about-card__content p {
  font-size: 16px;
  line-height: var(--line-height-desc);
  color: var(--color-text);
  margin: 0 0 var(--space-4);
}

.about-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-6);
}

.about-card__features li {
  font-size: 15px;
  line-height: var(--line-height-desc);
  color: var(--color-text);
  margin-bottom: var(--space-3);
  padding-left: var(--space-4);
  position: relative;
}

.about-card__features li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.about-card__features li strong {
  color: var(--color-text-strong);
}

.about-card__footer {
  margin-top: var(--space-12);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.about-card__footer p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-soft);
  letter-spacing: 2px;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: var(--space-6) var(--space-4);
  }
  
  .about-card {
    padding: var(--space-8) var(--space-6);
  }
  
  .about-card__title {
    font-size: 28px;
  }
}
</style>
