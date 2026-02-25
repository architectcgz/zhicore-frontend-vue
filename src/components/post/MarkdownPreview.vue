<!--
  Markdown 预览组件
  安全地渲染 Markdown 内容，支持语法高亮、数学公式等功能
-->
<template>
  <div class="markdown-preview">
    <div 
      v-if="renderedContent" 
      class="markdown-content"
      v-html="renderedContent"
    />
    <div
      v-else-if="!content.trim()"
      class="empty-content"
    >
      <i class="el-icon-document" />
      <p>开始写作，这里将显示预览内容</p>
    </div>
    <div
      v-else
      class="loading-content"
    >
      <i class="el-icon-loading" />
      <p>正在渲染内容...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useMarkdown } from '@/composables/useMarkdown';

// Props
interface Props {
  content: string;
  enableHighlight?: boolean;
  enableMath?: boolean;
  enableMermaid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  enableHighlight: true,
  enableMath: false,
  enableMermaid: false,
});

// 组合式函数
const { renderMarkdown, highlightCodeBlocks } = useMarkdown();

// 响应式状态
const renderedContent = ref('');
const isRendering = ref(false);

// 计算属性
const hasContent = computed(() => props.content.trim().length > 0);

// 监听内容变化并渲染
watch(() => props.content, async (newContent) => {
  if (!newContent.trim()) {
    renderedContent.value = '';
    return;
  }

  isRendering.value = true;
  try {
    // 基础 Markdown 渲染
    let html = renderMarkdown(newContent);
    
    // 等待 DOM 更新
    await nextTick();
    
    // 异步语法高亮
    if (props.enableHighlight) {
      await highlightCodeBlocks();
    }
    
    renderedContent.value = html;
  } catch (error) {
    console.error('Markdown 渲染失败:', error);
    renderedContent.value = '<p>内容渲染失败</p>';
  } finally {
    isRendering.value = false;
  }
}, { immediate: true });

// 暴露方法
defineExpose({
  refresh: () => {
    // 强制重新渲染
    const content = props.content;
    renderedContent.value = '';
    nextTick(() => {
      if (content.trim()) {
        renderedContent.value = renderMarkdown(content);
        if (props.enableHighlight) {
          highlightCodeBlocks();
        }
      }
    });
  },
});
</script>

<style scoped>
.markdown-preview {
  height: 100%;
  overflow-y: auto;
}

.markdown-content {
  /* 基础排版 */
  line-height: 1.6;
  color: var(--color-text-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.empty-content,
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
  text-align: center;
}

.empty-content i,
.loading-content i {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
  opacity: 0.5;
}

.loading-content i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Markdown 内容样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: var(--space-lg) 0 var(--space-md) 0;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--space-sm);
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-xs);
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
}

.markdown-content :deep(h4) {
  font-size: 1.125rem;
}

.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 1rem;
}

.markdown-content :deep(p) {
  margin: var(--space-md) 0;
  line-height: 1.6;
}

.markdown-content :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--color-primary);
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(del) {
  text-decoration: line-through;
  opacity: 0.7;
}

.markdown-content :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 0.875em;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

.markdown-content :deep(pre) {
  margin: var(--space-md) 0;
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.markdown-content :deep(pre code) {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border-radius: 0;
  font-size: inherit;
}

.markdown-content :deep(blockquote) {
  margin: var(--space-md) 0;
  padding: var(--space-sm) var(--space-md);
  border-left: 4px solid var(--color-primary);
  background-color: var(--color-bg-secondary);
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

.markdown-content :deep(blockquote p) {
  margin: 0;
  color: var(--color-text-secondary);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: var(--space-md) 0;
  padding-left: var(--space-lg);
}

.markdown-content :deep(li) {
  margin: var(--space-xs) 0;
  line-height: 1.6;
}

.markdown-content :deep(li p) {
  margin: var(--space-xs) 0;
}

.markdown-content :deep(table) {
  width: 100%;
  margin: var(--space-md) 0;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.markdown-content :deep(th) {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-content :deep(tr:last-child td) {
  border-bottom: none;
}

.markdown-content :deep(tr:nth-child(even)) {
  background-color: var(--color-bg-secondary);
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: var(--space-md) 0;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.markdown-content :deep(hr) {
  margin: var(--space-xl) 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

/* 代码高亮主题适配 */
.markdown-content :deep(.hljs) {
  background-color: var(--color-bg-secondary) !important;
  color: var(--color-text-primary) !important;
}

/* 任务列表 */
.markdown-content :deep(.task-list-item) {
  list-style: none;
  margin-left: -1.5em;
}

.markdown-content :deep(.task-list-item input) {
  margin-right: var(--space-xs);
}

/* 脚注 */
.markdown-content :deep(.footnote-ref) {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875em;
  vertical-align: super;
}

.markdown-content :deep(.footnotes) {
  margin-top: var(--space-xl);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-content :deep(h1) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.25rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.125rem;
  }
  
  .markdown-content :deep(pre) {
    padding: var(--space-sm);
    font-size: 0.8rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.875rem;
  }
  
  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: var(--space-xs) var(--space-sm);
  }
}

/* 滚动条样式 */
.markdown-preview::-webkit-scrollbar {
  width: 6px;
}

.markdown-preview::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.markdown-preview::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.markdown-preview::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* 打印样式 */
@media print {
  .markdown-content {
    color: #000 !important;
    background: #fff !important;
  }
  
  .markdown-content :deep(a) {
    color: #000 !important;
    text-decoration: underline !important;
  }
  
  .markdown-content :deep(pre),
  .markdown-content :deep(code) {
    background: #f5f5f5 !important;
    color: #000 !important;
  }
}
</style>