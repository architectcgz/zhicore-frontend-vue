<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useHotTagsQuery } from '@/queries/tags/useHotTagsQuery';
import { useHotCreatorsQuery } from '@/queries/ranking/useHotCreatorsQuery';
import type { Tag } from '@/types';
import type { CreatorRankingItem } from '@/api/ranking';

interface Props {
  isMobile: boolean;
  selectedTagIds: string[];
  hotTags?: Tag[];
  hotCreators?: CreatorRankingItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  tagClick: [tagId: string];
  'tag-click': [tagId: string];
}>();

const hotTagsQuery = useHotTagsQuery();
const hotCreatorsQuery = useHotCreatorsQuery();

const hotTags = computed(() => props.hotTags ?? hotTagsQuery.data.value ?? []);
const hotCreators = computed(() => props.hotCreators ?? hotCreatorsQuery.data.value?.items ?? []);

const emitTagClick = (tagId: string) => {
  emit('tagClick', tagId);
  emit('tag-click', tagId);
};
</script>

<template>
  <aside
    v-if="!props.isMobile"
    class="post-list-sidebar"
  >
    <section class="post-list-sidebar__section">
      <h2 class="post-list-sidebar__title">
        热门标签
      </h2>
      <div class="post-list-sidebar__tags">
        <button
          v-for="tag in hotTags"
          :key="tag.id"
          :data-test="`hot-tag-${tag.id}`"
          class="post-list-sidebar__tag"
          :class="{ 'post-list-sidebar__tag--active': props.selectedTagIds.includes(tag.id) }"
          type="button"
          @click="emitTagClick(tag.id)"
        >
          <span>{{ tag.name }}</span>
          <span>{{ tag.postCount }}</span>
        </button>
      </div>
    </section>

    <section class="post-list-sidebar__section">
      <h2 class="post-list-sidebar__title">
        热门创作者
      </h2>
      <div class="post-list-sidebar__creators">
        <RouterLink
          v-for="item in hotCreators"
          :key="item.user.id"
          class="post-list-sidebar__creator"
          :to="`/users/${item.user.id}`"
        >
          <span>{{ item.user.nickname }}</span>
          <span>{{ item.metrics.posts }} 篇文章</span>
        </RouterLink>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.post-list-sidebar {
  display: grid;
  gap: var(--space-md);
}

.post-list-sidebar__section {
  display: grid;
  gap: 12px;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.post-list-sidebar__title {
  font-size: 1rem;
  color: var(--color-text);
}

.post-list-sidebar__tags,
.post-list-sidebar__creators {
  display: grid;
  gap: 10px;
}

.post-list-sidebar__tag,
.post-list-sidebar__creator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
}

.post-list-sidebar__tag {
  cursor: pointer;
}

.post-list-sidebar__tag--active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
