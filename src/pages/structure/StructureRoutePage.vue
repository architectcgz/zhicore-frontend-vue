<template>
  <section class="structure-page">
    <header class="structure-page__header">
      <p class="structure-page__context">构 · 知识结构工作台</p>
      <h1>把零散文章组织成可以复用的知识结构。</h1>
      <p>
        构面向高阶作者、内容维护者和专题组织者，帮助他们整理专题、沉淀知识块、维护阅读脉络，
        并在发布前检查内容结构是否完整。
      </p>
    </header>

    <div class="structure-page__grid">
      <article
        v-for="item in structureCapabilities"
        :key="item.title"
        class="structure-card"
      >
        <span>{{ item.scope }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
// 与 PRODUCT.md 的“构”能力定义保持一致，避免结构页文案和 PRD 语义分叉。
const structureCapabilities = [
  {
    scope: "专题",
    title: "专题组织",
    description:
      "把多篇文章归入一个主题，例如 Vue 编辑器实现、内容模型设计、后端架构实践。",
  },
  {
    scope: "知识块",
    title: "知识块整理",
    description:
      "把文章里的关键段落、概念、代码片段和引用关系沉淀成可复用节点。",
  },
  {
    scope: "脉络",
    title: "脉络维护",
    description:
      "维护前置知识、下一篇阅读建议，以及同一概念在不同文章中的出现位置。",
  },
  {
    scope: "发布",
    title: "发布前结构检查",
    description:
      "检查标题层级、摘要、标签、引用和系列归属，降低结构缺失导致的阅读断点。",
  },
  {
    scope: "资产",
    title: "内容资产管理",
    description:
      "管理草稿、已发布文章、专题、标签、引用和收藏，让内容沉淀可持续维护。",
  },
];
</script>

<style scoped>
.structure-page {
  display: grid;
  gap: 24px;
  max-width: 1120px;
  margin: 0 auto;
}

.structure-page__header {
  max-width: 780px;
}

.structure-page__context {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 760;
}

.structure-page h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 32px;
  line-height: 1.18;
  text-wrap: balance;
}

.structure-page__header p:last-child {
  margin: 14px 0 0;
  color: var(--color-text-soft);
}

.structure-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.structure-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-elevated);
}

.structure-card span {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 760;
}

.structure-card h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 18px;
  line-height: 1.28;
}

.structure-card p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 14px;
}

@media (max-width: 768px) {
  .structure-page {
    padding: 0 16px 24px;
  }
  .structure-page h1 {
    font-size: 26px;
  }
  .structure-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
