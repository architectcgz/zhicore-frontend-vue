<script setup lang="ts">
import { computed } from 'vue';
import { faBookmark, faCommentDots, faHeart, faLink } from '@fortawesome/free-solid-svg-icons';
import PostDetailActionButton from '@/components/post/detail/PostDetailActionButton.vue';
import type { Post } from '@/types';
import { formatNumber } from '@/utils/post-detail-formatters';

interface Props {
  post: Post;
  commentCount: number;
  likeLoading: boolean;
  favoriteLoading: boolean;
  copyLabel: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  like: [];
  favorite: [];
  'scroll-comments': [];
  'copy-link': [];
}>();

const desktopActions = computed(() => [
  {
    key: 'like',
    icon: faHeart,
    label: props.post.isLiked ? '已点赞' : '点赞文章',
    value: formatNumber(props.post.likeCount),
    active: props.post.isLiked,
    disabled: props.likeLoading,
    handler: () => emit('like'),
  },
  {
    key: 'favorite',
    icon: faBookmark,
    label: props.post.isFavorited ? '已收藏' : '收藏文章',
    value: formatNumber(props.post.favoriteCount),
    active: props.post.isFavorited,
    disabled: props.favoriteLoading,
    handler: () => emit('favorite'),
  },
  {
    key: 'comments',
    icon: faCommentDots,
    label: '查看评论',
    value: formatNumber(props.commentCount),
    active: false,
    disabled: false,
    handler: () => emit('scroll-comments'),
  },
  {
    key: 'copy-link',
    icon: faLink,
    label: props.copyLabel,
    value: '链接操作',
    active: false,
    disabled: false,
    handler: () => emit('copy-link'),
  },
]);

const mobileActions = computed(() => [
  {
    key: 'like',
    icon: faHeart,
    label: props.post.isLiked ? '已赞' : '点赞',
    value: formatNumber(props.post.likeCount),
    active: props.post.isLiked,
    disabled: props.likeLoading,
    handler: () => emit('like'),
  },
  {
    key: 'favorite',
    icon: faBookmark,
    label: props.post.isFavorited ? '已藏' : '收藏',
    value: formatNumber(props.post.favoriteCount),
    active: props.post.isFavorited,
    disabled: props.favoriteLoading,
    handler: () => emit('favorite'),
  },
  {
    key: 'comments',
    icon: faCommentDots,
    label: '评论',
    value: formatNumber(props.commentCount),
    active: false,
    disabled: false,
    handler: () => emit('scroll-comments'),
  },
  {
    key: 'copy-link',
    icon: faLink,
    label: props.copyLabel,
    value: '链接',
    active: false,
    disabled: false,
    handler: () => emit('copy-link'),
  },
]);
</script>

<template>
  <Teleport to="#post-detail-action-slot">
    <aside class="post-action-rail">
      <section class="post-rail-section post-rail-section--actions">
        <p class="post-rail-section__kicker">
          工具轨
        </p>

        <div class="post-side-actions">
          <PostDetailActionButton
            v-for="action in desktopActions"
            :key="action.key"
            :icon="action.icon"
            :label="action.label"
            :value="action.value"
            :active="action.active"
            :disabled="action.disabled"
            @click="action.handler"
          />
        </div>
      </section>
    </aside>
  </Teleport>

  <div class="mobile-action-bar">
    <PostDetailActionButton
      v-for="action in mobileActions"
      :key="action.key"
      :icon="action.icon"
      :label="action.label"
      :value="action.value"
      :active="action.active"
      :disabled="action.disabled"
      compact
      @click="action.handler"
    />
  </div>
</template>

<style scoped>
.post-action-rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 88px;
  box-sizing: border-box;
  align-self: start;
  margin-left: auto;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius-xl) + 4px);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface-overlay) 90%, rgba(255, 255, 255, 0.2) 10%),
    color-mix(in srgb, var(--color-surface-overlay) 96%, transparent)
  );
  box-shadow:
    var(--shadow-sm),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
}

.post-rail-section--actions {
  z-index: 5;
  align-self: stretch;
  width: 100%;
  margin-left: 0;
  padding: 6px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.post-rail-section__kicker {
  margin: 0 0 8px;
  color: var(--color-text-tertiary);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}

.post-side-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.post-side-actions :deep(.action-btn + .action-btn) {
  border-top: 1px solid var(--color-border-light);
}

.mobile-action-bar {
  position: fixed;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 65;
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--gradient-card);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
}

@media (max-width: 900px) {
  .post-action-rail {
    position: static;
    order: 3;
    width: 100%;
    margin-left: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .post-rail-section--actions {
    position: static;
    width: 100%;
    margin-left: 0;
    padding: 10px 0 0;
  }

  .post-rail-section__kicker {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .mobile-action-bar {
    display: grid;
  }
}
</style>
