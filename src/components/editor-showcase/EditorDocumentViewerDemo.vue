<template>
  <section class="document-demo">
    <header class="document-demo__header">
      <div>
        <p class="document-demo__eyebrow">ZhiCore Display</p>
        <h1>工程文档展示器</h1>
      </div>
      <RouterLink class="document-demo__link" to="/editor-showcase">
        返回编辑器
      </RouterLink>
    </header>

    <article class="document-viewer">
      <aside class="document-viewer__toc">
        <p>目录</p>
        <a>目标</a>
        <a>后端契约</a>
        <a>发布检查</a>
        <a>冲突处理</a>
      </aside>

      <main class="document-viewer__content">
        <p class="document-viewer__eyebrow">展示 / 阅读页候选</p>
        <h2>发布检查</h2>
        <p>
          工程文档风格更适合作为最终展示或技术文章阅读模板。它保留更强的目录、代码块和提示块，
          但不作为默认编辑器体验。
        </p>
        <pre><code>{
  "schemaVersion": 1,
  "blocks": ["paragraph", "code_block", "image"],
  "basePostVersion": 12
}</code></pre>
        <div class="document-viewer__callout">
          DRAFT_CONFLICT 时保留本地改动，提示刷新或合并，不静默覆盖服务端草稿。
        </div>
      </main>
    </article>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.document-demo {
  min-height: 100vh;
  padding: clamp(18px, 4vw, 44px);
  background:
    linear-gradient(
      135deg,
      rgba(247, 248, 251, 0.98),
      rgba(233, 238, 244, 0.9)
    ),
    radial-gradient(
      circle at 82% 14%,
      rgba(42, 157, 143, 0.14),
      transparent 32%
    );
  color: #17202a;
}

.document-demo__header,
.document-viewer {
  max-width: 1180px;
  margin-inline: auto;
}

.document-demo__header {
  display: flex;
  gap: 18px;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.document-demo__eyebrow,
.document-viewer__eyebrow {
  margin: 0 0 8px;
  color: #587083;
  font-size: 12px;
  font-weight: 760;
  text-transform: uppercase;
}

.document-demo h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 0.98;
  letter-spacing: 0;
}

.document-demo__link {
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: #405466;
  text-decoration: none;
}

.document-viewer {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 50px rgba(30, 42, 58, 0.08);
}

.document-viewer__toc {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 24px 18px;
  border-right: 1px solid rgba(49, 74, 91, 0.12);
}

.document-viewer__toc p {
  margin: 0;
  color: #7b8b98;
  font-size: 13px;
}

.document-viewer__toc a {
  color: #405466;
  font-size: 14px;
}

.document-viewer__content {
  padding: clamp(28px, 5vw, 56px);
}

.document-viewer__content h2 {
  margin: 0 0 16px;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
}

.document-viewer__content p {
  color: #485765;
  font-size: 17px;
  line-height: 1.75;
}

.document-viewer pre {
  overflow: auto;
  margin: 24px 0;
  padding: 18px;
  border-radius: 8px;
  background: #18202b;
  color: #d6e3ec;
  font-size: 14px;
}

.document-viewer__callout {
  padding: 14px 16px;
  border-left: 3px solid #2a9d8f;
  background: rgba(233, 245, 242, 0.86);
  color: #24423f;
}

@media (max-width: 760px) {
  .document-demo__header,
  .document-viewer {
    grid-template-columns: 1fr;
  }

  .document-demo__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .document-viewer__toc {
    border-right: 0;
    border-bottom: 1px solid rgba(49, 74, 91, 0.12);
  }
}
</style>
