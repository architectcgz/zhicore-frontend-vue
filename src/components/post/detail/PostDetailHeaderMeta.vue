<script setup lang="ts">
import { computed } from 'vue';
import type { Post, PostReadingPresence } from '@/types';
import PostDetailReadingPresence from '@/components/post/detail/PostDetailReadingPresence.vue';
import { formatDate, formatNumber } from '@/utils/post-detail-formatters';

interface Props {
  post: Post;
  defaultAvatar: string;
  readingTime: number;
  commentCount: number;
  readingPresence: PostReadingPresence;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'avatar-error': [event: Event];
}>();

const statItems = computed(() => [
  `${props.readingTime} 分钟阅读`,
  `${formatNumber(props.post.viewCount)} 次浏览`,
  `${formatNumber(props.commentCount)} 条评论`,
  `${formatNumber(props.post.likeCount)} 次点赞`,
]);
</script>

<template>
  <div class="post-content-header__meta">
    <router-link
      :to="props.post.author.id ? `/users/${props.post.author.id}` : '/posts'"
      class="post-author"
    >
      <img
        :src="props.post.author.avatar || props.defaultAvatar"
        :alt="props.post.author.nickname"
        class="post-author__avatar"
        @error="emit('avatar-error', $event)"
      />
      <div class="post-author__info">
        <span class="post-author__name">{{ props.post.author.nickname }}</span>
        <span class="post-author__date">
          {{ formatDate(props.post.publishedAt || props.post.createdAt) }}
        </span>
      </div>
    </router-link>

    <div class="post-meta-side">
      <div class="post-meta-pills">
        <span v-for="item in statItems" :key="item" class="post-meta-pill soft-pill">
          {{ item }}
        </span>
      </div>

      <PostDetailReadingPresence
        :presence="props.readingPresence"
        :default-avatar="props.defaultAvatar"
      />
    </div>
  </div>
</template>

<style scoped>
.post-content-header__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.post-author {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  text-decoration: none;
}

.post-author__avatar {
  width: 52px;
  height: 52px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-surface-overlay);
}

.post-author__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.post-author__name {
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  transition: color var(--transition-base);
}

.post-author__date {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.post-author:hover .post-author__name {
  color: var(--color-cta);
}

.post-meta-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}

.post-meta-side {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.post-meta-pill {
  min-height: 40px;
  padding: 0 14px;
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-surface-overlay);
}

@media (max-width: 900px) {
  .post-content-header__meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-meta-pills {
    justify-content: flex-start;
  }

  .post-meta-side {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .post-meta-pills {
    gap: 8px;
  }

  .post-meta-pill {
    min-height: 36px;
    padding: 0 12px;
    font-size: 0.82rem;
  }

  .post-author__avatar {
    width: 48px;
    height: 48px;
  }
}
</style>
