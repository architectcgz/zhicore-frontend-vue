<script setup lang="ts">
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  Copy,
  Home,
  Search,
  Sun,
} from "@lucide/vue";
import type { Component } from "vue";
import { RouterLink } from "vue-router";

interface SidebarItem {
  label: string;
  icon?: Component;
  active?: boolean;
  expanded?: boolean;
  children?: Array<{
    label: string;
    active?: boolean;
  }>;
}

interface ChecklistItem {
  label: string;
  status: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Overview",
    icon: Home,
    active: true,
  },
  {
    label: "Button 组件",
    icon: Box,
    expanded: true,
    children: [
      { label: "Props", active: true },
      { label: "States" },
      { label: "Accessibility" },
    ],
  },
  {
    label: "Release Checklist",
    icon: ClipboardCheck,
    expanded: false,
    children: [{ label: "Checklist" }, { label: "变更记录" }],
  },
];

const propRows = [
  {
    property: "variant",
    type: "'primary' | 'secondary' | 'ghost' | 'danger'",
    defaultValue: "'primary'",
    description: "按钮样式类型",
  },
  {
    property: "size",
    type: "'small' | 'medium' | 'large'",
    defaultValue: "'medium'",
    description: "按钮尺寸",
  },
  {
    property: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "是否禁用按钮",
  },
  {
    property: "loading",
    type: "boolean",
    defaultValue: "false",
    description: "是否显示加载状态",
  },
];

const checklistItems: ChecklistItem[] = [
  { label: "代码示例", status: "通过" },
  { label: "Props 表格", status: "通过" },
  { label: "无障碍说明", status: "通过" },
  { label: "视觉设计稿", status: "通过" },
  { label: "变更记录", status: "通过" },
];
</script>

<template>
  <section class="editor-document" aria-labelledby="editor-document-title">
    <header class="editor-document__topbar">
      <div class="editor-document__brand">
        <span class="editor-document__logo-mark" aria-hidden="true">Z</span>
        <span class="editor-document__brand-name">ZhiCore</span>
      </div>

      <div class="editor-document__breadcrumb" aria-label="当前位置">
        <span>工程文档</span>
        <span aria-hidden="true">/</span>
        <strong>组件规范</strong>
      </div>

      <div class="editor-document__actions">
        <button class="editor-document__ghost-button" type="button">
          <Copy class="editor-document__button-icon" aria-hidden="true" />
          <span>复制链接</span>
        </button>
        <div class="editor-document__sync" aria-label="文档同步状态">
          <span>
            已同步
            <i aria-hidden="true" />
          </span>
          <small>2 分钟前</small>
        </div>
        <RouterLink class="editor-document__return-link" to="/editor">
          <ArrowLeft class="editor-document__button-icon" aria-hidden="true" />
          <span>返回编辑器</span>
        </RouterLink>
      </div>
    </header>

    <div class="editor-document__workspace">
      <aside class="editor-document__sidebar" aria-label="文档导航">
        <div class="editor-document__search" aria-label="搜索文档">
          <Search class="editor-document__search-icon" aria-hidden="true" />
          <span class="editor-document__search-placeholder">搜索文档</span>
          <kbd>⌘K</kbd>
        </div>

        <nav class="editor-document__nav">
          <section
            v-for="item in sidebarItems"
            :key="item.label"
            class="editor-document__nav-group"
          >
            <button
              class="editor-document__nav-link"
              :class="{ 'editor-document__nav-link--active': item.active }"
              type="button"
              :aria-current="item.active ? 'page' : undefined"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                class="editor-document__nav-icon"
                aria-hidden="true"
              />
              <span>{{ item.label }}</span>
              <ChevronUp
                v-if="item.children && item.expanded"
                class="editor-document__nav-chevron"
                aria-hidden="true"
              />
              <ChevronDown
                v-else-if="item.children"
                class="editor-document__nav-chevron"
                aria-hidden="true"
              />
            </button>

            <div
              v-if="item.children"
              class="editor-document__nav-children"
              :class="{
                'editor-document__nav-children--expanded': item.expanded,
              }"
            >
              <button
                v-for="child in item.children"
                :key="child.label"
                class="editor-document__nav-child"
                :class="{
                  'editor-document__nav-child--active': child.active,
                }"
                type="button"
                :aria-current="child.active ? 'location' : undefined"
              >
                <span
                  v-if="child.active"
                  class="editor-document__nav-dot"
                  aria-hidden="true"
                />
                <span>{{ child.label }}</span>
              </button>
            </div>
          </section>
        </nav>

        <footer class="editor-document__sidebar-footer">
          <span class="editor-document__footer-logo" aria-hidden="true">Z</span>
          <span>由 ZhiCore Docs 驱动</span>
          <Sun class="editor-document__theme-icon" aria-hidden="true" />
        </footer>
      </aside>

      <main class="editor-document__content">
        <article class="editor-document__article">
          <p class="editor-document__section-pill">组件</p>
          <h1 id="editor-document-title">Button 组件</h1>
          <p class="editor-document__lead">
            按钮用于触发操作或提交表单。提供多种样式、尺寸和状态以适应不同的场景。
          </p>

          <hr class="editor-document__divider" />

          <section
            class="editor-document__article-section"
            aria-labelledby="basic-usage-title"
          >
            <h2 id="basic-usage-title">基本用法</h2>
            <p>
              通过
              <code>variant</code>
              和
              <code>size</code>
              属性来控制按钮的样式和尺寸。
            </p>

            <figure class="editor-document__code-card">
              <figcaption>
                <span>React</span>
                <button type="button">
                  <Copy aria-hidden="true" />
                  <span>复制代码</span>
                </button>
                <i aria-hidden="true" />
              </figcaption>
              <pre><code>&lt;Button variant="primary" size="medium"&gt;
  Create
&lt;/Button&gt;</code></pre>
            </figure>

            <aside class="editor-document__callout">
              <span class="editor-document__callout-icon" aria-hidden="true">
                i
              </span>
              <div>
                <strong>提示</strong>
                <p>
                  推荐使用
                  <code>primary</code>
                  作为主操作按钮，一个页面中主操作按钮不应超过一个。
                </p>
              </div>
            </aside>
          </section>

          <section
            class="editor-document__article-section"
            aria-labelledby="props-title"
          >
            <h2 id="props-title">Props</h2>
            <div class="editor-document__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>类型</th>
                    <th>默认值</th>
                    <th>描述</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in propRows" :key="row.property">
                    <td>{{ row.property }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.defaultValue }}</td>
                    <td>{{ row.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </main>

      <aside class="editor-document__meta" aria-label="文档状态">
        <section class="editor-document__meta-panel">
          <h2>文档状态</h2>
          <div class="editor-document__publish-card">
            <CheckCircle2 aria-hidden="true" />
            <div>
              <strong>已发布</strong>
              <span>当前版本为最新版本</span>
            </div>
          </div>
        </section>

        <section class="editor-document__meta-panel">
          <h2>最后更新</h2>
          <div class="editor-document__author">
            <span class="editor-document__avatar" aria-hidden="true">LC</span>
            <div>
              <strong>Liam Chen</strong>
              <span>2024-10-26 14:32</span>
            </div>
          </div>
          <div class="editor-document__change-note">
            <span>更新内容：</span>
            <ul>
              <li>新增 loading 属性说明</li>
              <li>补充无障碍访问说明</li>
            </ul>
          </div>
        </section>

        <section class="editor-document__meta-panel">
          <h2>发布检查</h2>
          <ul class="editor-document__checklist">
            <li v-for="item in checklistItems" :key="item.label">
              <CheckCircle2 aria-hidden="true" />
              <span>{{ item.label }}</span>
              <small>{{ item.status }}</small>
            </li>
          </ul>
          <button class="editor-document__history-button" type="button">
            <Clock3 aria-hidden="true" />
            <span>查看发布记录</span>
          </button>
        </section>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.editor-document {
  --document-page-bg: #f7f9fc;
  --document-surface: rgba(255, 255, 255, 0.9);
  --document-surface-strong: #ffffff;
  --document-surface-soft: #f3f7fb;
  --document-border: #e4eaf1;
  --document-border-soft: #edf2f6;
  --document-text: #151d29;
  --document-text-muted: #5f6d7c;
  --document-text-soft: #8a96a5;
  --document-primary: #0aa49d;
  --document-primary-strong: #008f89;
  --document-primary-soft: #e8f8f6;
  --document-blue: #2f80ed;
  --document-blue-soft: #f1f7ff;
  --document-shadow: 0 1rem 3rem rgba(29, 43, 63, 0.08);

  min-height: 100vh;
  padding: var(--space-3);
  background:
    radial-gradient(
      circle at 54% 5%,
      rgba(10, 164, 157, 0.08),
      transparent 24rem
    ),
    linear-gradient(180deg, #fbfdff 0%, var(--document-page-bg) 100%);
  color: var(--document-text);
}

.editor-document__topbar,
.editor-document__workspace {
  width: min(100%, 112rem);
  margin-inline: auto;
}

.editor-document__topbar {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(12rem, 1fr) auto;
  min-height: 4.75rem;
  overflow: hidden;
  border: 1px solid var(--document-border);
  border-radius: var(--radius-md);
  background: var(--document-surface);
  box-shadow: 0 0.625rem 2rem rgba(29, 43, 63, 0.06);
  backdrop-filter: blur(1rem);
}

.editor-document__brand,
.editor-document__breadcrumb,
.editor-document__actions {
  display: flex;
  align-items: center;
}

.editor-document__brand {
  gap: var(--space-3);
  padding-inline: var(--space-8);
  border-right: 1px solid var(--document-border);
}

.editor-document__logo-mark,
.editor-document__footer-logo {
  display: inline-grid;
  place-items: center;
  color: var(--document-primary);
  font-weight: 800;
  line-height: 1;
}

.editor-document__logo-mark {
  width: 2rem;
  height: 2rem;
  border: 0.125rem solid currentColor;
  border-radius: var(--radius-sm);
  font-size: 1.35rem;
  transform: skew(-8deg);
}

.editor-document__brand-name {
  color: #111827;
  font-size: 1.55rem;
  font-weight: 780;
  letter-spacing: 0;
}

.editor-document__breadcrumb {
  gap: var(--space-2);
  padding-inline: var(--space-8);
  color: var(--document-text);
  font-size: 1.125rem;
  font-weight: 700;
}

.editor-document__breadcrumb span:nth-child(2) {
  color: var(--document-text-soft);
  font-weight: 500;
}

.editor-document__actions {
  justify-content: flex-end;
  gap: var(--space-5);
  padding-inline: var(--space-6);
}

.editor-document__ghost-button,
.editor-document__return-link,
.editor-document__history-button,
.editor-document__code-card button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  border: 1px solid var(--document-border);
  border-radius: var(--radius-sm);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.editor-document__ghost-button {
  padding-inline: var(--space-5);
  background: var(--document-surface-strong);
  color: var(--document-text);
}

.editor-document__ghost-button:focus-visible,
.editor-document__return-link:focus-visible,
.editor-document__history-button:focus-visible,
.editor-document__code-card button:focus-visible,
.editor-document__nav-link:focus-visible,
.editor-document__nav-child:focus-visible {
  outline: 0.1875rem solid
    color-mix(in srgb, var(--document-primary) 28%, transparent);
  outline-offset: 0.125rem;
}

.editor-document__button-icon {
  width: 1rem;
  height: 1rem;
}

.editor-document__sync {
  display: grid;
  gap: 0.125rem;
  min-width: 5.5rem;
  color: var(--document-text);
  font-weight: 760;
  line-height: 1.15;
}

.editor-document__sync span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.editor-document__sync i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-pill);
  background: #21c48b;
}

.editor-document__sync small {
  color: var(--document-text-soft);
  font-size: 0.875rem;
  font-weight: 500;
}

.editor-document__return-link {
  padding-inline: var(--space-5);
  background: linear-gradient(
    180deg,
    var(--document-primary),
    var(--document-primary-strong)
  );
  color: #ffffff;
  box-shadow: 0 0.875rem 1.5rem rgba(0, 143, 137, 0.18);
}

.editor-document__workspace {
  display: grid;
  grid-template-columns: 18.5rem minmax(0, 1fr) 20rem;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.editor-document__sidebar,
.editor-document__content,
.editor-document__meta {
  min-height: calc(100vh - 6.5rem);
  border: 1px solid var(--document-border);
  border-radius: var(--radius-md);
  background: var(--document-surface);
  box-shadow: var(--document-shadow);
}

.editor-document__sidebar {
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.editor-document__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 3rem;
  margin: var(--space-5);
  padding-inline: var(--space-3);
  border: 1px solid var(--document-border);
  border-radius: var(--radius-sm);
  background: var(--document-surface-strong);
  color: var(--document-text-soft);
}

.editor-document__search-icon {
  width: 1rem;
  height: 1rem;
}

.editor-document__search-placeholder {
  flex: 1;
  min-width: 0;
}

.editor-document__search kbd {
  padding: 0.125rem var(--space-2);
  border: 1px solid var(--document-border);
  border-radius: var(--radius-sm);
  background: var(--document-surface-soft);
  color: var(--document-text-soft);
  font-size: 0.75rem;
  font-weight: 700;
}

.editor-document__nav {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--document-border-soft);
}

.editor-document__nav-group,
.editor-document__nav-children {
  display: grid;
  gap: var(--space-2);
}

.editor-document__nav-link,
.editor-document__nav-child {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.625rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--document-text-muted);
  font: inherit;
  text-decoration: none;
  cursor: pointer;
}

.editor-document__nav-link {
  gap: var(--space-2);
  padding-inline: var(--space-3);
  font-weight: 760;
}

.editor-document__nav-link--active,
.editor-document__nav-child--active {
  background: linear-gradient(
    90deg,
    rgba(10, 164, 157, 0.14),
    rgba(10, 164, 157, 0.05)
  );
  color: var(--document-primary-strong);
}

.editor-document__nav-icon,
.editor-document__nav-chevron {
  width: 1rem;
  height: 1rem;
}

.editor-document__nav-chevron {
  margin-left: auto;
}

.editor-document__nav-children {
  margin-left: var(--space-4);
}

.editor-document__nav-children:not(.editor-document__nav-children--expanded) {
  padding-left: var(--space-6);
}

.editor-document__nav-child {
  gap: var(--space-3);
  padding-inline: var(--space-4);
  font-weight: 620;
}

.editor-document__nav-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--radius-pill);
  background: var(--document-primary);
}

.editor-document__sidebar-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 4.5rem;
  padding-inline: var(--space-5);
  border-top: 1px solid var(--document-border);
  color: var(--document-text-muted);
  font-size: 0.875rem;
  font-weight: 700;
}

.editor-document__footer-logo {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
  transform: skew(-8deg);
}

.editor-document__theme-icon {
  width: 1.125rem;
  height: 1.125rem;
  margin-left: auto;
  color: var(--document-text);
}

.editor-document__content {
  overflow: auto;
  padding: var(--space-10) min(5vw, var(--space-10));
}

.editor-document__article {
  max-width: 63rem;
  margin-inline: auto;
}

.editor-document__section-pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.625rem;
  margin: 0 0 var(--space-5);
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--document-primary-soft);
  color: var(--document-primary-strong);
  font-size: 0.8125rem;
  font-weight: 780;
}

.editor-document__article h1,
.editor-document__article h2,
.editor-document__meta-panel h2 {
  margin: 0;
  color: var(--document-text);
  letter-spacing: 0;
}

.editor-document__article h1 {
  font-size: 2.75rem;
  font-weight: 850;
  line-height: 1.08;
}

.editor-document__lead {
  max-width: 50rem;
  margin: var(--space-4) 0 0;
  color: var(--document-text-muted);
  font-size: 1.0625rem;
  line-height: 1.7;
}

.editor-document__divider {
  margin: var(--space-6) 0;
  border: 0;
  border-top: 1px solid var(--document-border);
}

.editor-document__article-section {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.editor-document__article-section h2 {
  font-size: 1.375rem;
  font-weight: 800;
}

.editor-document__article-section p {
  margin: 0;
  color: var(--document-text-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.editor-document__article code {
  border-radius: var(--radius-sm);
  background: #eef4fb;
  color: #3a5b8f;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.9375em;
}

.editor-document__code-card {
  overflow: hidden;
  margin: var(--space-1) 0 var(--space-2);
  border: 1px solid var(--document-border);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #f8fafc, #f2f5f9);
}

.editor-document__code-card figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 2.75rem;
  padding-inline: var(--space-5);
  color: var(--document-text-soft);
  font-size: 0.875rem;
  font-weight: 620;
}

.editor-document__code-card button {
  min-height: 2rem;
  margin-left: auto;
  padding-inline: var(--space-2);
  border: 0;
  background: transparent;
  color: var(--document-text-soft);
  font-size: 0.875rem;
}

.editor-document__code-card button svg {
  width: 1rem;
  height: 1rem;
}

.editor-document__code-card figcaption i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-pill);
  background: #20bf7a;
}

.editor-document__code-card pre {
  overflow: auto;
  margin: 0;
  padding: var(--space-2) var(--space-5) var(--space-6);
  color: #182033;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 1rem;
  line-height: 1.6;
}

.editor-document__callout {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid #9ec5fe;
  border-radius: var(--radius-sm);
  background: var(--document-blue-soft);
  color: #1f4f9d;
}

.editor-document__callout-icon {
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.125rem;
  border: 0.125rem solid currentColor;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
}

.editor-document__callout strong {
  display: block;
  margin-bottom: var(--space-1);
  color: var(--document-blue);
}

.editor-document__callout p {
  color: #2d4e80;
}

.editor-document__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--document-border);
  border-radius: var(--radius-sm);
}

.editor-document__table-wrap table {
  width: 100%;
  min-width: 45rem;
  border-collapse: collapse;
  background: var(--document-surface-strong);
  color: var(--document-text);
}

.editor-document__table-wrap th,
.editor-document__table-wrap td {
  padding: var(--space-3) var(--space-4);
  border-right: 1px solid var(--document-border);
  border-bottom: 1px solid var(--document-border);
  text-align: left;
  vertical-align: top;
}

.editor-document__table-wrap th:last-child,
.editor-document__table-wrap td:last-child {
  border-right: 0;
}

.editor-document__table-wrap tr:last-child td {
  border-bottom: 0;
}

.editor-document__table-wrap th {
  background: #f7f9fb;
  color: var(--document-text-muted);
  font-size: 0.875rem;
  font-weight: 760;
}

.editor-document__table-wrap td {
  color: var(--document-text-muted);
  font-size: 0.9375rem;
}

.editor-document__table-wrap td:first-child {
  color: var(--document-text);
  font-weight: 620;
}

.editor-document__meta {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-6);
}

.editor-document__meta-panel {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-3) 0 var(--space-6);
  border-bottom: 1px solid var(--document-border);
}

.editor-document__meta-panel:last-child {
  border-bottom: 0;
}

.editor-document__meta-panel h2 {
  font-size: 1.125rem;
  font-weight: 800;
}

.editor-document__publish-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--document-border-soft);
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #f8fafc, #f0f4f8);
}

.editor-document__publish-card svg,
.editor-document__checklist svg {
  flex: 0 0 auto;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--document-primary);
}

.editor-document__publish-card div,
.editor-document__author div {
  display: grid;
  gap: 0.125rem;
}

.editor-document__publish-card strong,
.editor-document__author strong {
  color: var(--document-text);
  font-weight: 760;
}

.editor-document__publish-card span,
.editor-document__author span,
.editor-document__change-note {
  color: var(--document-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.editor-document__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.editor-document__avatar {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-pill);
  background:
    linear-gradient(135deg, rgba(10, 164, 157, 0.15), transparent), #dce5ee;
  color: var(--document-primary-strong);
  font-size: 0.75rem;
  font-weight: 800;
}

.editor-document__change-note ul,
.editor-document__checklist {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.editor-document__change-note ul {
  margin-top: var(--space-2);
  padding-left: var(--space-4);
  list-style: disc;
}

.editor-document__checklist li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-height: 2rem;
  color: var(--document-text);
  font-weight: 620;
}

.editor-document__checklist small {
  padding: 0.125rem var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--document-surface-soft);
  color: var(--document-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.editor-document__history-button {
  width: 100%;
  margin-top: var(--space-2);
  background: #f8fafc;
  color: var(--document-text);
}

.editor-document__history-button svg {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 87.5rem) {
  .editor-document__topbar {
    grid-template-columns: minmax(13rem, 16rem) 1fr;
  }

  .editor-document__actions {
    grid-column: 1 / -1;
    min-height: 4rem;
    border-top: 1px solid var(--document-border);
  }

  .editor-document__workspace {
    grid-template-columns: 17rem minmax(0, 1fr);
  }

  .editor-document__meta {
    grid-column: 1 / -1;
    min-height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .editor-document__meta-panel {
    padding-bottom: var(--space-3);
    border-right: 1px solid var(--document-border);
    border-bottom: 0;
    padding-inline: var(--space-3);
  }

  .editor-document__meta-panel:last-child {
    border-right: 0;
  }
}

@media (max-width: 60rem) {
  .editor-document__topbar,
  .editor-document__workspace,
  .editor-document__meta {
    grid-template-columns: 1fr;
  }

  .editor-document__brand,
  .editor-document__breadcrumb,
  .editor-document__actions {
    min-height: 4rem;
    padding-inline: var(--space-5);
    border-right: 0;
  }

  .editor-document__breadcrumb,
  .editor-document__actions {
    border-top: 1px solid var(--document-border);
  }

  .editor-document__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .editor-document__sidebar,
  .editor-document__content,
  .editor-document__meta {
    min-height: auto;
  }

  .editor-document__content {
    padding: var(--space-6) var(--space-5);
  }

  .editor-document__meta-panel {
    border-right: 0;
    border-bottom: 1px solid var(--document-border);
    padding-inline: 0;
  }

  .editor-document__article h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 40rem) {
  .editor-document {
    padding: var(--space-2);
  }

  .editor-document__topbar,
  .editor-document__sidebar,
  .editor-document__content,
  .editor-document__meta {
    border-radius: var(--radius-sm);
  }

  .editor-document__ghost-button,
  .editor-document__return-link {
    width: 100%;
  }

  .editor-document__sync {
    width: 100%;
  }

  .editor-document__code-card figcaption {
    flex-wrap: wrap;
  }

  .editor-document__callout {
    align-items: flex-start;
  }
}
</style>
