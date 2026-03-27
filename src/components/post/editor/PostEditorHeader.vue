<script setup lang="ts">
import { computed } from 'vue';
import type { PostEditorHeaderProps, PostEditorMenuCommand } from '@/types/post/editor';

const props = withDefaults(defineProps<PostEditorHeaderProps>(), {
  saveDraftText: '保存草稿',
  status: undefined,
  showMenu: false,
});

const emit = defineEmits<{
  'save-draft': [];
  'primary-action': [];
  'menu-command': [command: PostEditorMenuCommand];
}>();

const statusTagType = computed(() => {
  if (props.status === 'PUBLISHED') {
    return 'success';
  }

  return 'info';
});

const statusTagText = computed(() => {
  if (props.status === 'PUBLISHED') {
    return '已发布';
  }

  if (props.status === 'DRAFT') {
    return '草稿';
  }

  return '已归档';
});

const handleCommand = (command: string | number | object) => {
  emit('menu-command', command as PostEditorMenuCommand);
};
</script>

<template>
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">
        {{ props.title }}
      </h1>
      <div
        v-if="props.status"
        class="post-status"
      >
        <el-tag :type="statusTagType">
          {{ statusTagText }}
        </el-tag>
      </div>
      <div
        v-if="props.lastSaveTimeText"
        class="auto-save-info"
      >
        <span class="save-status">
          <i class="el-icon-check" />
          上次保存: {{ props.lastSaveTimeText }}
        </span>
      </div>
    </div>
    <div class="header-actions">
      <el-button
        :loading="props.saving"
        @click="emit('save-draft')"
      >
        {{ props.saveDraftText }}
      </el-button>
      <el-button
        type="primary"
        :loading="props.saving"
        @click="emit('primary-action')"
      >
        {{ props.primaryActionText }}
      </el-button>
      <el-dropdown
        v-if="props.showMenu"
        @command="handleCommand"
      >
        <el-button>
          更多操作
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="preview">
              <i class="el-icon-view" />
              预览文章
            </el-dropdown-item>
            <el-dropdown-item
              command="delete"
              divided
            >
              <i class="el-icon-delete" />
              删除文章
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.post-status {
  display: flex;
  align-items: center;
}

.auto-save-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.save-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .header-left {
    flex-wrap: wrap;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>
