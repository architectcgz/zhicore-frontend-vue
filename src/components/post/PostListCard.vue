<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Post } from '@/types';

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  like: [postId: string];
  favorite: [postId: string];
}>();

const router = useRouter();
const defaultAvatar = '/images/default-avatar.svg';

const hasCover = computed(() => Boolean(props.post.coverImage));
const displayDate = computed(() => props.post.publishedAt || props.post.createdAt);
const displayExcerpt = computed(() => props.post.excerpt || props.post.summary || props.post.content);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });

const openPost = () => {
  router.push(`/posts/${props.post.id}`);
};
</script>

<template>
  <article
    class="post-list-card"
    :class="hasCover ? 'post-list-card--with-cover' : 'post-list-card--text-only'"
    @click="openPost"
  >
    <div class="post-list-card__content">
      <div class="post-list-card__meta">
        <div class="post-list-card__author">
          <img
            class="post-list-card__avatar"
            :src="props.post.author.avatar || defaultAvatar"
            :alt="props.post.author.nickname"
          >
          <span>{{ props.post.author.nickname }}</span>
          <span>·</span>
          <span>{{ formatDate(displayDate) }}</span>
        </div>
        <div
          v-if="props.post.tags.length > 0"
          class="post-list-card__tags"
        >
          <span
            v-for="tag in props.post.tags"
            :key="tag.id"
            class="post-list-card__tag"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <h2 class="post-list-card__title">
        {{ props.post.title }}
      </h2>

      <p class="post-list-card__excerpt">
        {{ displayExcerpt }}
      </p>

      <div class="post-list-card__stats">
        <span>👍 {{ props.post.likeCount }}</span>
        <span>💬 {{ props.post.commentCount }}</span>
      </div>
    </div>

    <img
      v-if="hasCover"
      class="post-list-card__cover"
      :src="props.post.coverImage || ''"
      :alt="props.post.title"
    >

    <div
      class="post-list-card__actions"
      @click.stop
    >
      <button
        data-test="like-button"
        class="post-list-card__action"
        type="button"
        @click="emit('like', props.post.id)"
      >
        {{ props.post.isLiked ? '取消点赞' : '点赞' }}
      </button>
      <button
        data-test="favorite-button"
        class="post-list-card__action"
        type="button"
        @click="emit('favorite', props.post.id)"
      >
        {{ props.post.isFavorited ? '取消收藏' : '收藏' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.post-list-card {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  cursor: pointer;
}

.post-list-card--with-cover {
  grid-template-columns: minmax(0, 1fr) 120px;
}

.post-list-card--text-only {
  grid-template-columns: minmax(0, 1fr);
}

.post-list-card__content {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.post-list-card__meta {
  display: grid;
  gap: 8px;
}

.post-list-card__author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.post-list-card__avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  object-fit: cover;
}

.post-list-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-list-card__tag {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.post-list-card__title {
  font-size: 1.2rem;
  color: var(--color-text);
}

.post-list-card__excerpt {
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-text-secondary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.post-list-card__stats {
  display: flex;
  gap: 14px;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.post-list-card__cover {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.post-list-card__actions {
  display: flex;
  gap: 10px;
}

.post-list-card__action {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

@media (max-width: 767px) {
  .post-list-card--with-cover {
    grid-template-columns: minmax(0, 1fr);
  }

  .post-list-card__cover {
    width: 100%;
    height: 180px;
  }
}
</style>
