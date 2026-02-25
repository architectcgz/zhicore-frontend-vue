<!--
  Markdown 文章编辑器组件
  支持工具栏、实时预览、图片上传、自动保存、全屏模式、快捷键等功能
-->
<template>
  <div
    class="post-editor"
    :class="{ 'fullscreen': isFullscreen }"
  >
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <!-- 标题工具 -->
        <el-button-group>
          <el-button 
            size="small" 
            title="标题 1 (Ctrl+1)"
            @click="insertText('# ', '')"
          >
            H1
          </el-button>
          <el-button 
            size="small" 
            title="标题 2 (Ctrl+2)"
            @click="insertText('## ', '')"
          >
            H2
          </el-button>
          <el-button 
            size="small" 
            title="标题 3 (Ctrl+3)"
            @click="insertText('### ', '')"
          >
            H3
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-group">
        <!-- 文本格式工具 -->
        <el-button 
          size="small" 
          title="粗体 (Ctrl+B)"
          @click="insertText('**', '**')"
        >
          <i class="el-icon-bold" />
        </el-button>
        <el-button 
          size="small" 
          title="斜体 (Ctrl+I)"
          @click="insertText('*', '*')"
        >
          <i class="el-icon-italic" />
        </el-button>
        <el-button 
          size="small" 
          title="删除线"
          @click="insertText('~~', '~~')"
        >
          <i class="el-icon-strikethrough" />
        </el-button>
        <el-button 
          size="small" 
          title="行内代码"
          @click="insertText('`', '`')"
        >
          <i class="el-icon-code" />
        </el-button>
      </div>

      <div class="toolbar-group">
        <!-- 列表工具 -->
        <el-button 
          size="small" 
          title="无序列表"
          @click="insertText('- ', '')"
        >
          <i class="el-icon-list" />
        </el-button>
        <el-button 
          size="small" 
          title="有序列表"
          @click="insertText('1. ', '')"
        >
          <i class="el-icon-numbered-list" />
        </el-button>
        <el-button 
          size="small" 
          title="引用"
          @click="insertText('> ', '')"
        >
          <i class="el-icon-quote" />
        </el-button>
      </div>

      <div class="toolbar-group">
        <!-- 插入工具 -->
        <el-button 
          size="small" 
          title="插入链接 (Ctrl+K)"
          @click="insertLink"
        >
          <i class="el-icon-link" />
        </el-button>
        <el-button 
          size="small" 
          title="插入图片 (Ctrl+Shift+I)"
          :loading="uploadingImage"
          @click="triggerImageUpload"
        >
          <i class="el-icon-picture" />
        </el-button>
        <el-button 
          size="small" 
          title="代码块"
          @click="insertCodeBlock"
        >
          <i class="el-icon-code-block" />
        </el-button>
        <el-button 
          size="small" 
          title="插入表格"
          @click="insertTable"
        >
          <i class="el-icon-table" />
        </el-button>
      </div>

      <div class="toolbar-group">
        <!-- 视图工具 -->
        <el-button 
          size="small" 
          :type="showPreview ? 'primary' : 'default'"
          title="切换预览 (Ctrl+P)"
          @click="togglePreview"
        >
          <i class="el-icon-view" />
        </el-button>
        <el-button 
          size="small" 
          title="全屏模式 (F11)"
          @click="toggleFullscreen"
        >
          <i :class="isFullscreen ? 'el-icon-minimize' : 'el-icon-full-screen'" />
        </el-button>
      </div>

      <div class="toolbar-group">
        <!-- 帮助工具 -->
        <el-button 
          size="small" 
          title="Markdown 帮助"
          @click="showHelp = true"
        >
          <i class="el-icon-question" />
        </el-button>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div
      class="editor-body"
      :class="{ 'split-view': showPreview }"
    >
      <!-- 编辑区域 -->
      <div class="editor-pane">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="editor-textarea"
          placeholder="开始写作..."
          @input="handleInput"
          @keydown="handleKeydown"
          @paste="handlePaste"
          @drop="handleDrop"
          @dragover.prevent
        />
      </div>

      <!-- 预览区域 -->
      <div
        v-if="showPreview"
        class="preview-pane"
      >
        <div class="preview-header">
          <span>预览</span>
          <el-button
            size="small"
            @click="showPreview = false"
          >
            <i class="el-icon-close" />
          </el-button>
        </div>
        <div class="preview-content">
          <MarkdownPreview :content="content" />
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="editor-statusbar">
      <div class="status-left">
        <span class="word-count">
          字数: {{ wordCount }} | 字符: {{ charCount }}
        </span>
        <span
          v-if="uploadingImage"
          class="upload-status"
        >
          <i class="el-icon-loading" />
          上传图片中...
        </span>
      </div>
      <div class="status-right">
        <span class="cursor-position">
          行 {{ cursorLine }}, 列 {{ cursorColumn }}
        </span>
      </div>
    </div>

    <!-- 隐藏的文件上传输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- 链接插入对话框 -->
    <el-dialog
      v-model="linkDialog.visible"
      title="插入链接"
      width="400px"
      @close="resetLinkDialog"
    >
      <el-form
        :model="linkDialog"
        label-width="60px"
      >
        <el-form-item label="文本">
          <el-input
            v-model="linkDialog.text"
            placeholder="链接文本"
          />
        </el-form-item>
        <el-form-item label="链接">
          <el-input
            v-model="linkDialog.url"
            placeholder="https://"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkDialog.visible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmInsertLink"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- Markdown 帮助对话框 -->
    <el-dialog
      v-model="showHelp"
      title="Markdown 语法帮助"
      width="600px"
    >
      <div class="markdown-help">
        <div class="help-section">
          <h4>标题</h4>
          <pre># 一级标题
## 二级标题
### 三级标题</pre>
        </div>
        <div class="help-section">
          <h4>文本格式</h4>
          <pre>**粗体文本**
*斜体文本*
~~删除线~~
`行内代码`</pre>
        </div>
        <div class="help-section">
          <h4>列表</h4>
          <pre>- 无序列表项
- 另一个项目

1. 有序列表项
2. 另一个项目</pre>
        </div>
        <div class="help-section">
          <h4>链接和图片</h4>
          <pre>[链接文本](https://example.com)
![图片描述](image-url.jpg)</pre>
        </div>
        <div class="help-section">
          <h4>代码块</h4>
          <pre>```javascript
console.log('Hello World');
```</pre>
        </div>
        <div class="help-section">
          <h4>引用</h4>
          <pre>> 这是一个引用
> 可以多行</pre>
        </div>
        <div class="help-section">
          <h4>表格</h4>
          <pre>| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import MarkdownPreview from './MarkdownPreview.vue';

// Props
interface Props {
  content: string;
  uploadImage?: (file: File) => Promise<string | null>;
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placeholder: '开始写作...',
  readonly: false,
});

// Emits
const emit = defineEmits<{
  'update:content': [value: string];
  change: [value: string];
}>();

// 响应式状态
const textareaRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const content = ref(props.content);
const showPreview = ref(false);
const isFullscreen = ref(false);
const uploadingImage = ref(false);
const showHelp = ref(false);

// 链接对话框状态
const linkDialog = ref({
  visible: false,
  text: '',
  url: '',
  selectionStart: 0,
  selectionEnd: 0,
});

// 计算属性
const wordCount = computed(() => {
  return content.value.replace(/\s+/g, '').length;
});

const charCount = computed(() => {
  return content.value.length;
});

const cursorLine = ref(1);
const cursorColumn = ref(1);

// 监听内容变化
watch(content, (newValue) => {
  emit('update:content', newValue);
  emit('change', newValue);
});

// 监听 props 变化
watch(() => props.content, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue;
  }
});

// 生命周期
onMounted(() => {
  // 绑定快捷键
  document.addEventListener('keydown', handleGlobalKeydown);
  
  // 监听光标位置变化
  if (textareaRef.value) {
    textareaRef.value.addEventListener('selectionchange', updateCursorPosition);
    textareaRef.value.addEventListener('click', updateCursorPosition);
    textareaRef.value.addEventListener('keyup', updateCursorPosition);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown);
});

/**
 * 处理输入事件
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  content.value = target.value;
  updateCursorPosition();
};

/**
 * 处理键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  const { ctrlKey, metaKey, key, shiftKey } = event;
  const isCtrl = ctrlKey || metaKey;

  // Tab 键处理
  if (key === 'Tab') {
    event.preventDefault();
    insertText('  ', ''); // 插入两个空格
    return;
  }

  // 快捷键处理
  if (isCtrl) {
    switch (key) {
      case 'b':
      case 'B':
        event.preventDefault();
        insertText('**', '**');
        break;
      case 'i':
      case 'I':
        if (shiftKey) {
          event.preventDefault();
          triggerImageUpload();
        } else {
          event.preventDefault();
          insertText('*', '*');
        }
        break;
      case 'k':
      case 'K':
        event.preventDefault();
        insertLink();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        togglePreview();
        break;
      case '1':
        event.preventDefault();
        insertText('# ', '');
        break;
      case '2':
        event.preventDefault();
        insertText('## ', '');
        break;
      case '3':
        event.preventDefault();
        insertText('### ', '');
        break;
    }
  }

  // F11 全屏
  if (key === 'F11') {
    event.preventDefault();
    toggleFullscreen();
  }
};

/**
 * 处理全局键盘事件
 */
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // 只在编辑器获得焦点时处理
  if (document.activeElement !== textareaRef.value) {
    return;
  }

  // ESC 退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    event.preventDefault();
    toggleFullscreen();
  }
};

/**
 * 处理粘贴事件
 */
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  // 检查是否有图片
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        await uploadImageFile(file);
      }
      break;
    }
  }
};

/**
 * 处理拖拽事件
 */
const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (!files) return;

  // 处理图片文件
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await uploadImageFile(file);
    }
  }
};

/**
 * 插入文本
 */
const insertText = (before: string, after: string, placeholder?: string) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.value.substring(start, end);
  const textToInsert = selectedText || placeholder || '';
  
  const newText = before + textToInsert + after;
  const newContent = content.value.substring(0, start) + newText + content.value.substring(end);
  
  content.value = newContent;
  
  // 设置光标位置
  nextTick(() => {
    if (selectedText || placeholder) {
      textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
    } else {
      textarea.setSelectionRange(start + before.length, start + before.length);
    }
    textarea.focus();
  });
};

/**
 * 插入链接
 */
const insertLink = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.value.substring(start, end);

  linkDialog.value = {
    visible: true,
    text: selectedText,
    url: '',
    selectionStart: start,
    selectionEnd: end,
  };
};

/**
 * 确认插入链接
 */
const confirmInsertLink = () => {
  const { text, url, selectionStart, selectionEnd } = linkDialog.value;
  
  if (!url.trim()) {
    ElMessage.warning('请输入链接地址');
    return;
  }

  const linkText = text.trim() || url;
  const linkMarkdown = `[${linkText}](${url})`;
  
  const newContent = content.value.substring(0, selectionStart) + 
                    linkMarkdown + 
                    content.value.substring(selectionEnd);
  
  content.value = newContent;
  linkDialog.value.visible = false;
  
  // 设置光标位置
  nextTick(() => {
    const textarea = textareaRef.value;
    if (textarea) {
      const newPosition = selectionStart + linkMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }
  });
};

/**
 * 重置链接对话框
 */
const resetLinkDialog = () => {
  linkDialog.value = {
    visible: false,
    text: '',
    url: '',
    selectionStart: 0,
    selectionEnd: 0,
  };
};

/**
 * 插入代码块
 */
const insertCodeBlock = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const selectedText = content.value.substring(start, textarea.selectionEnd);
  
  const codeBlock = selectedText ?
    `\`\`\`\n${selectedText}\n\`\`\`` :
    '```javascript\n// 在这里输入代码\n```';
  
  insertText('', '', codeBlock);
};

/**
 * 插入表格
 */
const insertTable = () => {
  const table = `| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
  
  insertText('', '', table);
};

/**
 * 触发图片上传
 */
const triggerImageUpload = () => {
  fileInputRef.value?.click();
};

/**
 * 处理文件选择
 */
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await uploadImageFile(file);
    }
  }

  // 清空文件输入
  target.value = '';
};

/**
 * 上传图片文件
 */
const uploadImageFile = async (file: File) => {
  if (!props.uploadImage) {
    ElMessage.warning('图片上传功能未配置');
    return;
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB');
    return;
  }

  uploadingImage.value = true;
  try {
    const imageUrl = await props.uploadImage(file);
    if (imageUrl) {
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      insertText('', '', imageMarkdown);
      ElMessage.success('图片上传成功');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error('图片上传失败');
  } finally {
    uploadingImage.value = false;
  }
};

/**
 * 切换预览
 */
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

/**
 * 切换全屏模式
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

/**
 * 更新光标位置
 */
const updateCursorPosition = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const text = textarea.value;
  const cursorPos = textarea.selectionStart;
  
  // 计算行号
  const lines = text.substring(0, cursorPos).split('\n');
  cursorLine.value = lines.length;
  cursorColumn.value = lines[lines.length - 1].length + 1;
};

// 暴露方法给父组件
defineExpose({
  insertText,
  insertLink,
  insertCodeBlock,
  insertTable,
  togglePreview,
  toggleFullscreen,
  focus: () => textareaRef.value?.focus(),
});
</script>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

.post-editor.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.toolbar-group:not(:last-child)::after {
  content: '';
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
  margin-left: var(--space-sm);
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-body.split-view .editor-pane {
  width: 50%;
  border-right: 1px solid var(--color-border);
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  padding: var(--space-md);
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: transparent;
  tab-size: 2;
}

.editor-textarea::placeholder {
  color: var(--color-text-placeholder);
}

.preview-pane {
  width: 50%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.preview-content {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
}

.editor-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-md);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.status-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.upload-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-primary);
}

.markdown-help {
  max-height: 400px;
  overflow-y: auto;
}

.help-section {
  margin-bottom: var(--space-lg);
}

.help-section h4 {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.help-section pre {
  margin: 0;
  padding: var(--space-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  overflow-x: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-body.split-view {
    flex-direction: column;
  }
  
  .editor-body.split-view .editor-pane {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .preview-pane {
    width: 100%;
    height: 50%;
  }
  
  .editor-toolbar {
    padding: var(--space-xs) var(--space-sm);
    gap: var(--space-xs);
  }
  
  .toolbar-group {
    gap: 2px;
  }
  
  .toolbar-group:not(:last-child)::after {
    display: none;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .editor-textarea {
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
  }
}

/* 滚动条样式 */
.editor-textarea::-webkit-scrollbar,
.preview-content::-webkit-scrollbar,
.markdown-help::-webkit-scrollbar {
  width: 6px;
}

.editor-textarea::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track,
.markdown-help::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.editor-textarea::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb,
.markdown-help::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.editor-textarea::-webkit-scrollbar-thumb:hover,
.preview-content::-webkit-scrollbar-thumb:hover,
.markdown-help::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>