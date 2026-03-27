<script setup lang="ts">
import type { Tag } from '@/types';
import PostDetailTagLinks from '@/components/post/detail/PostDetailTagLinks.vue';

interface Props {
  postTags: Tag[];
}

const props = defineProps<Props>();
</script>

<template>
  <section class="post-conclusion">
    <div class="post-conclusion__content">
      <p class="post-conclusion__kicker">阅读结束</p>
      <h2 class="post-conclusion__title">继续沿着这个主题展开讨论</h2>
      <p class="post-conclusion__text">收藏这篇文章，或直接进入评论区补充你的观察和问题。</p>
    </div>

    <PostDetailTagLinks :tags="props.postTags" variant="conclusion" />
  </section>
</template>

<style scoped>
.post-conclusion {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 0 0;
  border-top: 1px solid var(--color-border);
}

.post-conclusion__content {
  max-width: 420px;
}

.post-conclusion__kicker {
  margin: 0 0 12px;
  color: var(--color-text-tertiary);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.post-conclusion__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
}

.post-conclusion__text {
  margin-top: 10px;
  color: var(--color-text-secondary);
  line-height: 1.75;
}

@media (max-width: 900px) {
  .post-conclusion {
    flex-direction: column;
  }
}
</style>
